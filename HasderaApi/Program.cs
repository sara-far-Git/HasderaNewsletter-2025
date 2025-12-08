using System.Text.Json.Serialization;
using Dapper;
using Npgsql;
using Amazon;
using Amazon.S3;
using Amazon.Runtime;
using Microsoft.EntityFrameworkCore;
using HasderaApi.Data;
using HasderaApi.Services;
using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ===== הגדרות =====
var connStr = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

var s3Region = builder.Configuration["S3:Region"] ?? "eu-north-1";

builder.Services.ConfigureHttpJsonOptions(o =>
{
    o.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    o.SerializerOptions.PropertyNamingPolicy = null;
    o.SerializerOptions.PropertyNameCaseInsensitive = true; // תמיכה גם ב-lowercase וגם ב-capital
    o.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles; // מניעת circular references
});

// Entity Framework and Database Configuration
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(connStr, npgsqlOptions =>
    {
        npgsqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5, // מספר retries
            maxRetryDelay: TimeSpan.FromSeconds(10), // delay בין retries
            errorCodesToAdd: null);
        npgsqlOptions.CommandTimeout(60); // timeout ארוך יותר
    });
    options.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);
    options.EnableServiceProviderCaching();
});

// חיבור DB פר בקשה
builder.Services.AddScoped<NpgsqlConnection>(_ => new NpgsqlConnection(connStr));

// S3 - הגדרת credentials מ-appsettings או environment variables
builder.Services.AddSingleton<IAmazonS3>(sp =>
{
    var config = sp.GetRequiredService<IConfiguration>();
    var accessKey = config["S3:AccessKey"] ?? Environment.GetEnvironmentVariable("AWS_ACCESS_KEY_ID");
    var secretKey = config["S3:SecretKey"] ?? Environment.GetEnvironmentVariable("AWS_SECRET_ACCESS_KEY");
    
    if (!string.IsNullOrEmpty(accessKey) && !string.IsNullOrEmpty(secretKey))
    {
        // שימוש ב-credentials מהקונפיגורציה
        var credentials = new BasicAWSCredentials(accessKey, secretKey);
        return new AmazonS3Client(credentials, RegionEndpoint.GetBySystemName(s3Region));
    }
    else
    {
        // נסיון להשתמש ב-default credentials chain (כולל environment variables, AWS credentials file, וכו')
        // זה יעבוד אם יש AWS credentials מוגדרים במערכת
        return new AmazonS3Client(RegionEndpoint.GetBySystemName(s3Region));
    }
});

// CORS - עדכון לתמוך ב-HTTPS ו-Cloudflare Pages
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
            {
                // Allow localhost for development
                if (origin.StartsWith("http://localhost:") || origin.StartsWith("https://localhost:"))
                    return true;
                
                // Allow Cloudflare Pages domains
                if (origin.EndsWith(".hasdera-advertiser.pages.dev") || 
                    origin == "https://hasdera-advertiser.pages.dev")
                    return true;
                
                return false;
            })
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // נדרש עבור HTTPS
    });
});
builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key not found"))
            )
        };
    });
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("AdvertiserOnly", policy => policy.RequireRole("Advertiser"));
    options.AddPolicy("SubscribersOnly", policy => policy.RequireRole("Subscriber"));
});

builder.Services.AddAuthorization();
builder.Services.AddScoped<IAuthService, AuthService>();

// Controllers
builder.Services.AddControllers();

var app = builder.Build();

// יצירת טבלאות אם לא קיימות (רק בפיתוח)
// הערה: הקוד הזה רץ ברקע ולא חוסם את השרת
if (!app.Environment.IsProduction())
{
    _ = Task.Run(async () =>
    {
        await Task.Delay(2000); // מחכה 2 שניות כדי שהשרת יתחיל
        int retryCount = 0;
        const int maxRetries = 3;
        
        while (retryCount < maxRetries)
        {
            try
            {
                using (var scope = app.Services.CreateScope())
                {
                    var connection = scope.ServiceProvider.GetRequiredService<NpgsqlConnection>();
                    
                    // בדיקה שה-connection תקין לפני פתיחה
                    if (connection == null)
                    {
                        throw new InvalidOperationException("NpgsqlConnection service not found");
                    }
                    
                    await connection.OpenAsync();
                    Console.WriteLine($"✅ Database connection opened (attempt {retryCount + 1}/{maxRetries})");
                    
                    try
                    {
                    // יצירת טבלת users (ללא FOREIGN KEY זמנית כדי למנוע בעיות)
                    using (var cmd = new NpgsqlCommand(@"
                        CREATE TABLE IF NOT EXISTS users (
                            id SERIAL PRIMARY KEY,
                            full_name VARCHAR(255) NOT NULL,
                            email VARCHAR(255) NOT NULL,
                            password_hash VARCHAR(255) NOT NULL DEFAULT '',
                            role VARCHAR(50) NOT NULL,
                            refresh_token VARCHAR(255),
                            google_id VARCHAR(255),
                            advertiser_id INTEGER
                        );
                    ", connection))
                    {
                        await cmd.ExecuteNonQueryAsync();
                    }

                    // הוספת FOREIGN KEY רק אם הטבלה advertisers קיימת
                    try
                    {
                        using (var cmd = new NpgsqlCommand(@"
                            DO $$
                            BEGIN
                                IF NOT EXISTS (
                                    SELECT 1 FROM pg_constraint 
                                    WHERE conname = 'fk_users_advertiser'
                                ) THEN
                                    ALTER TABLE users 
                                    ADD CONSTRAINT fk_users_advertiser 
                                    FOREIGN KEY (advertiser_id) REFERENCES advertisers(advertiser_id);
                                END IF;
                            END $$;
                        ", connection))
                        {
                            await cmd.ExecuteNonQueryAsync();
                        }
                    }
                    catch
                    {
                        // אם יש בעיה עם FOREIGN KEY, נמשיך בלי זה
                        Console.WriteLine("⚠️ Could not add foreign key constraint (advertisers table might not exist)");
                    }

                    // יצירת אינדקסים
                    using (var cmd = new NpgsqlCommand(@"
                        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
                        CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
                    ", connection))
                    {
                        await cmd.ExecuteNonQueryAsync();
                    }

                    // יצירת טבלת PasswordResetTokens
                    using (var cmd = new NpgsqlCommand(@"
                        CREATE TABLE IF NOT EXISTS password_reset_tokens (
                            id SERIAL PRIMARY KEY,
                            user_id INTEGER NOT NULL,
                            token VARCHAR(255) NOT NULL,
                            expires_at TIMESTAMP NOT NULL,
                            CONSTRAINT fk_password_reset_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                        );
                        CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
                    ", connection))
                    {
                        await cmd.ExecuteNonQueryAsync();
                    }

                    // יצירת טבלת creatives אם לא קיימת
                    try
                    {
                        using (var cmd = new NpgsqlCommand(@"
                            CREATE TABLE IF NOT EXISTS creatives (
                                creative_id SERIAL PRIMARY KEY,
                                order_id INTEGER NOT NULL,
                                file_url TEXT,
                                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                CONSTRAINT fk_creative_adorder FOREIGN KEY (order_id) REFERENCES adorders(order_id)
                            );
                            CREATE INDEX IF NOT EXISTS idx_creatives_order_id ON creatives(order_id);
                        ", connection))
                        {
                            await cmd.ExecuteNonQueryAsync();
                        }
                        Console.WriteLine("✅ Table 'creatives' checked/created successfully");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"⚠️ Warning: Could not create creatives table: {ex.Message}");
                        // אם הטבלה adorders לא קיימת, ננסה ליצור את creatives בלי FOREIGN KEY
                        try
                        {
                            using (var cmd = new NpgsqlCommand(@"
                                CREATE TABLE IF NOT EXISTS creatives (
                                    creative_id SERIAL PRIMARY KEY,
                                    order_id INTEGER NOT NULL,
                                    file_url TEXT,
                                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                                );
                                CREATE INDEX IF NOT EXISTS idx_creatives_order_id ON creatives(order_id);
                            ", connection))
                            {
                                await cmd.ExecuteNonQueryAsync();
                            }
                            Console.WriteLine("✅ Table 'creatives' created without foreign key constraint");
                        }
                        catch (Exception ex2)
                        {
                            Console.WriteLine($"⚠️ Could not create creatives table even without FK: {ex2.Message}");
                        }
                    }

                        Console.WriteLine("✅ Database tables checked/created successfully");
                        return; // הצלחנו, נצא מהלולאה
                    }
                    finally
                    {
                        if (connection.State == System.Data.ConnectionState.Open)
                        {
                            await connection.CloseAsync();
                            Console.WriteLine("✅ Database connection closed");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                retryCount++;
                Console.WriteLine($"⚠️ Warning: Could not ensure database tables exist (attempt {retryCount}/{maxRetries}): {ex.Message}");
                Console.WriteLine($"   Error details: {ex.InnerException?.Message ?? ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"   Inner exception type: {ex.InnerException.GetType().Name}");
                }
                Console.WriteLine($"   Stack trace: {ex.StackTrace}");
                
                if (retryCount < maxRetries)
                {
                    int delay = retryCount * 2000; // 2, 4, 6 שניות
                    Console.WriteLine($"   Retrying in {delay}ms...");
                    await Task.Delay(delay);
                }
                else
                {
                    Console.WriteLine("❌ Failed to create database tables after all retries");
                    Console.WriteLine("Please run the SQL script manually: HasderaApi/Scripts/CreateUsersTable.sql");
                }
            }
        }
    });
}

// HTTPS Redirection - מושבת בפיתוח כדי למנוע בעיות CORS
// if (!app.Environment.IsProduction())
// {
//     app.UseHttpsRedirection();
// }

// Enable CORS
app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();
