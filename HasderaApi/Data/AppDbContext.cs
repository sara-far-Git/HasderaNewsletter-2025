using Microsoft.EntityFrameworkCore;
using HasderaApi.Models;

namespace HasderaApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Issue> Issues { get; set; }
    }
}
