using HasderaApi.Data;
using Microsoft.EntityFrameworkCore;
using HasderaApi.Services;

using HasderaApi.Data;
using Microsoft.EntityFrameworkCore;

namespace HasderaApi
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // === Add services to the container ===
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            builder.Services.AddSingleton<AiService>();


            // === ����� �-PostgreSQL ��� �-DbContext ===
            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
            );

            var app = builder.Build();

            // === Configure the HTTP request pipeline ===
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "Hasdera API V1");

                if (app.Environment.IsDevelopment())
                {
                    // ������ � Swagger ���� ��� �-root
                    c.RoutePrefix = string.Empty;
                }
                else
                {
                    // �������� � Swagger �� ��� /swagger
                    c.RoutePrefix = "swagger";
                }
            });

            app.UseHttpsRedirection();
            app.UseAuthorization();
            app.MapControllers();
            app.Run();
        }
    }
}
