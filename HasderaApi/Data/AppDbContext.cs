using Microsoft.EntityFrameworkCore;
using HasderaApi.Models;

namespace HasderaApi.Data
{
    /// <summary>
    /// AppDbContext – מחבר בין המודלים למסד הנתונים PostgreSQL
    /// </summary>
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // === תוכן המגזין ===
        public DbSet<Issue> Issues { get; set; }
        public DbSet<Article> Articles { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Media> Media { get; set; }

        // === ניהול ואנליטיקות ===
        public DbSet<AdminUser> AdminUsers { get; set; }
        public DbSet<Analytics> Analytics { get; set; }
        public DbSet<ChatbotLog> ChatbotLogs { get; set; }
        public DbSet<AiEmbedding> AiEmbeddings { get; set; }
        public DbSet<Recommendation> Recommendations { get; set; }
        public DbSet<SystemLog> SystemLogs { get; set; }

        // === פרסום ומנויים ===
        public DbSet<Ad> Ads { get; set; }
        public DbSet<Subscriber> Subscribers { get; set; }
    }
}
