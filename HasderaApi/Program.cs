using System.Text.Json.Serialization;
using Dapper;
using Npgsql;
using Amazon;
using Amazon.S3;
using Microsoft.EntityFrameworkCore;
using HasderaApi.Data;
using System.Security.Cryptography.X509Certificates;

var builder = WebApplication.CreateBuilder(args);

// ===== הגדרות =====
var connStr = builder.Configuration.GetConnectionString("Hasdera")
    ?? "Host=hasdera-db.c7gocuawyvty.eu-north-1.rds.amazonaws.com;Port=5432;Database=hasdera;Username=Hasdera;Password=Hasdera2025!;Ssl Mode=Require";

var s3Region = builder.Configuration["S3:Region"] ?? "eu-north-1";

builder.Services.ConfigureHttpJsonOptions(o =>
{
    o.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    o.SerializerOptions.PropertyNamingPolicy = null;
});

// Entity Framework and Database Configuration
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connStr, npgsqlOptions =>
    {
        npgsqlOptions.EnableRetryOnFailure(
            maxRetryCount: 3,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorCodesToAdd: null);
        npgsqlOptions.CommandTimeout(30);
    }));

// חיבור DB פר בקשה עם מדיניות נסיונות
builder.Services.AddScoped<NpgsqlConnection>(_ => 
{
    var connection = new NpgsqlConnection(connStr);
    connection.ProvideClientCertificatesCallback += (X509CertificateCollection certs) => { };
    connection.UserCertificateValidationCallback += (sender, certificate, chain, errors) => true;
    return connection;
});

// S3
builder.Services.AddSingleton<IAmazonS3>(_ => new AmazonS3Client(RegionEndpoint.GetBySystemName(s3Region)));

// CORS - עדכון לתמוך ב-HTTPS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "https://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // נדרש עבור HTTPS
    });
});

// Controllers
builder.Services.AddControllers();

var app = builder.Build();

// HTTPS Redirection
app.UseHttpsRedirection();

// Enable CORS
app.UseCors("AllowReactApp");

app.MapControllers();
app.Run();
