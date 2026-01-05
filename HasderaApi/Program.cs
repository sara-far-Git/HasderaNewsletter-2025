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

// אם `dotnet run --urls ...` או `ASPNETCORE_URLS` הוגדרו – לא נדרוס.
// אחרת, נריץ לפי PORT/HOST (Render) או ברירת מחדל מקומית.
var aspnetcoreUrls = Environment.GetEnvironmentVariable("ASPNETCORE_URLS");
if (string.IsNullOrWhiteSpace(aspnetcoreUrls))
{
    var port = Environment.GetEnvironmentVariable("PORT") ?? "5055";
    var host = Environment.GetEnvironmentVariable("HOST")
        ?? (builder.Environment.IsProduction() ? "0.0.0.0" : "localhost");
    builder.WebHost.UseUrls($"http://{host}:{port}");
}

// ===== הגדרות =====
// אפשרות להשתמש ב-connection string חלופי לפיתוח דרך environment variable
var connStr = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING") 
    ?? builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

var s3Region = builder.Configuration["S3:Region"] ?? "eu-north-1";

builder.Services.ConfigureHttpJsonOptions(o =>
{
    // שינוי: נשמור null values כדי שה-Summary יישלח גם כשהוא null
    // זה חשוב כדי שהפרונט-אנד יוכל לזהות שה-Summary לא נשמר
    o.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.Never; // Changed from WhenWritingNull to Never
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
                
                // Allow Cloudflare Pages domains (כל תת-דומיינים)
                if (origin.EndsWith(".hasdera-advertiser.pages.dev") || 
                    origin == "https://hasdera-advertiser.pages.dev")
                    return true;
                
                // Allow custom domain (אם יש)
                // הוסף כאן את הדומיין המותאם אישית שלך, למשל:
                // if (origin == "https://advertiser.hasdera.com" || origin == "https://app.hasdera.com")
                //     return true;
                
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

// ✅ Seed default ad slots (once) so admin can sell placements
// רץ ברקע כדי לא לחסום את עליית השרת, ולא נכשל אם ה-DB לא זמין
_ = Task.Run(async () =>
{
    await Task.Delay(3000);
    try
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // אם הטבלה ריקה – ניצור סט בסיסי של מקומות פרסום
        if (!await db.Slots.AnyAsync())
        {
            db.Slots.AddRange(new[]
            {
                new HasderaApi.Models.Slot { Code = "SLOT-01", Name = "מקום פרסום 1", BasePrice = null, IsExclusive = null },
                new HasderaApi.Models.Slot { Code = "SLOT-02", Name = "מקום פרסום 2", BasePrice = null, IsExclusive = null },
                new HasderaApi.Models.Slot { Code = "SLOT-03", Name = "מקום פרסום 3", BasePrice = null, IsExclusive = null },
                new HasderaApi.Models.Slot { Code = "SLOT-04", Name = "מקום פרסום 4", BasePrice = null, IsExclusive = null },
                new HasderaApi.Models.Slot { Code = "SLOT-05", Name = "מקום פרסום 5", BasePrice = null, IsExclusive = null },
                new HasderaApi.Models.Slot { Code = "SLOT-06", Name = "מקום פרסום 6", BasePrice = null, IsExclusive = null },
                new HasderaApi.Models.Slot { Code = "SLOT-07", Name = "מקום פרסום 7", BasePrice = null, IsExclusive = null },
                new HasderaApi.Models.Slot { Code = "SLOT-08", Name = "מקום פרסום 8", BasePrice = null, IsExclusive = null },
                new HasderaApi.Models.Slot { Code = "SLOT-09", Name = "מקום פרסום 9", BasePrice = null, IsExclusive = null },
                new HasderaApi.Models.Slot { Code = "SLOT-10", Name = "מקום פרסום 10", BasePrice = null, IsExclusive = null },
                new HasderaApi.Models.Slot { Code = "SLOT-11", Name = "מקום פרסום 11", BasePrice = null, IsExclusive = null },
                new HasderaApi.Models.Slot { Code = "SLOT-12", Name = "מקום פרסום 12", BasePrice = null, IsExclusive = null },
                new HasderaApi.Models.Slot { Code = "SLOT-BACK", Name = "גב עיתון", BasePrice = null, IsExclusive = null },
            });

            await db.SaveChangesAsync();
            Console.WriteLine("✅ Seeded default Slots (13, incl. back cover)");
        }
        else
        {
            // אם כבר יש Slots אבל חסר "גב עיתון" – נוסיף אותו בלבד
            var hasBackCover = await db.Slots.AnyAsync(s => s.Code == "SLOT-BACK");
            if (!hasBackCover)
            {
                db.Slots.Add(new HasderaApi.Models.Slot { Code = "SLOT-BACK", Name = "גב עיתון", BasePrice = null, IsExclusive = null });
                await db.SaveChangesAsync();
                Console.WriteLine("✅ Added back cover Slot (SLOT-BACK)");
            }
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"⚠️ Slot seeding skipped: {ex.Message}");
    }
});

// יצירת טבלאות אם לא קיימות (רק בפיתוח)
// הערה: הקוד הזה רץ ברקע ולא חוסם את השרת
if (!app.Environment.IsProduction())
{
    _ = Task.Run(async () =>
    {
        await Task.Delay(5000); // מחכה 5 שניות כדי שהשרת יתחיל ומסד הנתונים יהיה מוכן
        int retryCount = 0;
        const int maxRetries = 5; // הגדלנו את מספר הניסיונות
        
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
                    int delay = retryCount * 3000; // 3, 6, 9, 12, 15 שניות
                    Console.WriteLine($"   Retrying in {delay / 1000} seconds...");
                    await Task.Delay(delay);
                }
                else
                {
                    Console.WriteLine("❌ Failed to create database tables after all retries");
                    Console.WriteLine("⚠️  The server will continue running, but database operations may fail.");
                    Console.WriteLine("Please check:");
                    Console.WriteLine("   1. Database server is running and accessible");
                    Console.WriteLine("   2. Connection string in appsettings.json is correct");
                    Console.WriteLine("   3. Network connectivity to AWS RDS");
                    Console.WriteLine("   4. Security groups allow connections from your IP");
                    Console.WriteLine("You can run the SQL script manually: HasderaApi/Scripts/CreateUsersTable.sql");
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

// הוספת headers ל-Google OAuth
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    context.Response.Headers.Append("Cross-Origin-Embedder-Policy", "unsafe-none");
    await next();
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// הגדרת פורט מ-environment variable (ל-Render) או שימוש בברירת מחדל
var envPort = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(envPort))
{
    var url = $"http://0.0.0.0:{envPort}";
    Console.WriteLine($"🚀 Starting server on {url}");
    app.Run(url);
}
else
{
    var urlsText = app.Urls != null && app.Urls.Count > 0 ? string.Join(", ", app.Urls) : "(default)";
    Console.WriteLine($"🚀 Starting server on {urlsText}");
    app.Run();
}
