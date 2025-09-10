<<<<<<< HEAD
=======
using HasderaApi.Data;
using Microsoft.EntityFrameworkCore;
using HasderaApi.Services;

using HasderaApi.Data;
using Microsoft.EntityFrameworkCore;

>>>>>>> origin
namespace HasderaApi
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

<<<<<<< HEAD
            // Add services to the container.
=======
            // === Add services to the container ===
>>>>>>> origin
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            builder.Services.AddSingleton<AiService>();


            // === ï¿½ï¿½ï¿½ï¿½ï¿½ ï¿½-PostgreSQL ï¿½ï¿½ï¿½ ï¿½-DbContext ===
            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
            );

            var app = builder.Build();

<<<<<<< HEAD
            // ? äôòìä ùì Swagger úîéã, ìà ø÷ á-Development
=======
            // === Configure the HTTP request pipeline ===
>>>>>>> origin
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "Hasdera API V1");
<<<<<<< HEAD
                c.RoutePrefix = string.Empty; // ëãé ùééôúç éùø á-root (http://localhost:5000)
=======

                if (app.Environment.IsDevelopment())
                {
                    // ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ ï¿½ Swagger ï¿½ï¿½ï¿½ï¿½ ï¿½ï¿½ï¿½ ï¿½-root
                    c.RoutePrefix = string.Empty;
                }
                else
                {
                    // ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ ï¿½ Swagger ï¿½ï¿½ ï¿½ï¿½ï¿½ /swagger
                    c.RoutePrefix = "swagger";
                }
>>>>>>> origin
            });

            app.UseHttpsRedirection();
            app.UseAuthorization();
<<<<<<< HEAD

=======
>>>>>>> origin
            app.MapControllers();
            app.Run();
        }
    }
}
