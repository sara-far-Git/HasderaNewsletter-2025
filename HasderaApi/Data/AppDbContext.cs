using System;
using System.Collections.Generic;
using HasderaApi.Models;
using Microsoft.EntityFrameworkCore;

namespace HasderaApi.Data;

public partial class AppDbContext : DbContext
{
    public AppDbContext()
    {
    }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }
    
    // תיקון שמות המודלים - שימוש בשמות הנכונים מהקבצים
    public virtual DbSet<Adorder> AdOrders { get; set; }
    public virtual DbSet<Adplacement> AdPlacements { get; set; }
    public virtual DbSet<Creative> Creatives { get; set; }
    public virtual DbSet<Slot> Slots { get; set; }
    public virtual DbSet<Advertisercontact> AdvertiserContacts { get; set; }
    public virtual DbSet<Adevent> AdEvents { get; set; }
    public virtual DbSet<Ad> Ads { get; set; }

    public virtual DbSet<Adminuser> Adminusers { get; set; }

    public virtual DbSet<Advertiser> Advertisers { get; set; }

    public virtual DbSet<AiEmbedding> AiEmbeddings { get; set; }

    public virtual DbSet<Analytics> Analytics { get; set; }

    public virtual DbSet<Article> Articles { get; set; }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<Chatbotlog> Chatbotlogs { get; set; }

    public virtual DbSet<Click> Clicks { get; set; }

    public virtual DbSet<Engagement> Engagements { get; set; }

    public virtual DbSet<Issue> Issues { get; set; }

    public virtual DbSet<Medium> Media { get; set; }

    public virtual DbSet<Newsletter> Newsletters { get; set; }

    public virtual DbSet<Package> Packages { get; set; }

    public virtual DbSet<Payment> Payments { get; set; }

    public virtual DbSet<Reader> Readers { get; set; }

    public virtual DbSet<Recommendation> Recommendations { get; set; }

    public virtual DbSet<Subscription> Subscriptions { get; set; }

    public virtual DbSet<Systemlog> Systemlogs { get; set; }

    public virtual DbSet<TestTable> TestTables { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseNpgsql("Host=hasdera-db.c7gocuawyvty.eu-north-1.rds.amazonaws.com;Port=5432;Database=hasdera;Username=Hasdera;Password=Hasdera2025!;Ssl Mode=Require");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // AdOrder
        modelBuilder.Entity<Adorder>(entity =>
        {
            entity.HasKey(e => e.OrderId).HasName("adorders_pkey");
            entity.ToTable("adorders");

            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.AdvertiserId).HasColumnName("advertiser_id");
            entity.Property(e => e.PackageId).HasColumnName("package_id");
            entity.Property(e => e.Status).HasMaxLength(50).HasColumnName("status");
            entity.Property(e => e.OrderDate).HasColumnName("order_date");

            entity.HasOne(d => d.Advertiser).WithMany()
                .HasForeignKey(d => d.AdvertiserId)
                .HasConstraintName("fk_adorder_advertiser");

            entity.HasOne(d => d.Package).WithMany()
                .HasForeignKey(d => d.PackageId)
                .HasConstraintName("fk_adorder_package");
        });

        // AdPlacement
        modelBuilder.Entity<Adplacement>(entity =>
        {
            entity.HasKey(e => e.AdplacementId).HasName("adplacements_pkey");
            entity.ToTable("adplacements");

            entity.Property(e => e.AdplacementId).HasColumnName("adplacement_id");
            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.SlotId).HasColumnName("slot_id");
            entity.Property(e => e.StartDate).HasColumnName("start_date");
            entity.Property(e => e.EndDate).HasColumnName("end_date");

            entity.HasOne(d => d.Order).WithMany()
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("fk_adplacement_adorder");

            entity.HasOne(d => d.Slot).WithMany()
                .HasForeignKey(d => d.SlotId)
                .HasConstraintName("fk_adplacement_slot");
        });

        // Creative - הסרת FileType שלא קיים
        modelBuilder.Entity<Creative>(entity =>
        {
            entity.HasKey(e => e.CreativeId).HasName("creatives_pkey");
            entity.ToTable("creatives");

            entity.Property(e => e.CreativeId).HasColumnName("creative_id");
            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.FileUrl).HasColumnName("file_url");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");

            entity.HasOne(d => d.Order).WithMany()
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("fk_creative_adorder");
        });

        // Slot
        modelBuilder.Entity<Slot>(entity =>
        {
            entity.HasKey(e => e.SlotId).HasName("slots_pkey");
            entity.ToTable("slots");

            entity.Property(e => e.SlotId).HasColumnName("slot_id");
            entity.Property(e => e.Code).HasMaxLength(50).HasColumnName("code");
            entity.Property(e => e.Name).HasMaxLength(100).HasColumnName("name");
            entity.Property(e => e.BasePrice).HasPrecision(10, 2).HasColumnName("base_price");
            entity.Property(e => e.IsExclusive).HasColumnName("is_exclusive");
        });

        // AdvertiserContact
        modelBuilder.Entity<Advertisercontact>(entity =>
        {
            entity.HasKey(e => e.ContactId).HasName("advertisercontacts_pkey");
            entity.ToTable("advertisercontacts");

            entity.Property(e => e.ContactId).HasColumnName("contact_id");
            entity.Property(e => e.AdvertiserId).HasColumnName("advertiser_id");
            entity.Property(e => e.FullName).HasMaxLength(100).HasColumnName("full_name");
            entity.Property(e => e.Email).HasMaxLength(100).HasColumnName("email");
            entity.Property(e => e.Phone).HasMaxLength(20).HasColumnName("phone");
            entity.Property(e => e.IsPrimary).HasColumnName("is_primary");

            entity.HasOne(d => d.Advertiser).WithMany()
                .HasForeignKey(d => d.AdvertiserId)
                .HasConstraintName("fk_contact_advertiser");
        });

        // AdEvent
        modelBuilder.Entity<Adevent>(entity =>
        {
            entity.HasKey(e => e.AdeventId).HasName("adevents_pkey");
            entity.ToTable("adevents");

            entity.Property(e => e.AdeventId).HasColumnName("adevent_id");
            entity.Property(e => e.AdplacementId).HasColumnName("adplacement_id");
            entity.Property(e => e.EventType).HasMaxLength(50).HasColumnName("event_type");
            entity.Property(e => e.EventTime).HasColumnName("event_time");

            entity.HasOne(d => d.Adplacement).WithMany()
                .HasForeignKey(d => d.AdplacementId)
                .HasConstraintName("fk_adevent_adplacement");
        });

        modelBuilder.Entity<Ad>(entity =>
        {
            entity.HasKey(e => e.AdId).HasName("ads_pkey");

            entity.ToTable("ads");

            entity.Property(e => e.AdId).HasColumnName("ad_id");
            entity.Property(e => e.AdvertiserId).HasColumnName("advertiser_id");
            entity.Property(e => e.IssueId).HasColumnName("issue_id");
            entity.Property(e => e.MediaUrl).HasColumnName("media_url");
            entity.Property(e => e.PackageId).HasColumnName("package_id");
            entity.Property(e => e.Placement)
                .HasMaxLength(50)
                .HasColumnName("placement");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasColumnName("status");

            entity.HasOne(d => d.Advertiser).WithMany(p => p.Ads)
                .HasForeignKey(d => d.AdvertiserId)
                .HasConstraintName("fk_ad_advertiser");

            entity.HasOne(d => d.Issue).WithMany(p => p.Ads)
                .HasForeignKey(d => d.IssueId)
                .HasConstraintName("fk_ad_issue");

            entity.HasOne(d => d.Package).WithMany(p => p.Ads)
                .HasForeignKey(d => d.PackageId)
                .HasConstraintName("fk_ad_package");
        });

        modelBuilder.Entity<Adminuser>(entity =>
        {
            entity.HasKey(e => e.AdminId).HasName("adminusers_pkey");

            entity.ToTable("adminusers");

            entity.HasIndex(e => e.Username, "adminusers_username_key").IsUnique();

            entity.Property(e => e.AdminId).HasColumnName("admin_id");
            entity.Property(e => e.PasswordHash).HasColumnName("password_hash");
            entity.Property(e => e.Role)
                .HasMaxLength(50)
                .HasColumnName("role");
            entity.Property(e => e.Username)
                .HasMaxLength(100)
                .HasColumnName("username");
        });

        modelBuilder.Entity<Advertiser>(entity =>
        {
            entity.HasKey(e => e.AdvertiserId).HasName("advertisers_pkey");

            entity.ToTable("advertisers");

            entity.Property(e => e.AdvertiserId).HasColumnName("advertiser_id");
            entity.Property(e => e.Company)
                .HasMaxLength(100)
                .HasColumnName("company");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .HasColumnName("email");
            entity.Property(e => e.JoinDate).HasColumnName("join_date");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
            entity.Property(e => e.Phone)
                .HasMaxLength(20)
                .HasColumnName("phone");
        });

        modelBuilder.Entity<AiEmbedding>(entity =>
        {
            entity.HasKey(e => e.EmbeddingId).HasName("ai_embeddings_pkey");

            entity.ToTable("ai_embeddings");

            entity.Property(e => e.EmbeddingId).HasColumnName("embedding_id");
            entity.Property(e => e.ArticleId).HasColumnName("article_id");
            entity.Property(e => e.IssueId).HasColumnName("issue_id");
            entity.Property(e => e.TextChunk).HasColumnName("text_chunk");
            entity.Property(e => e.Vector).HasColumnName("vector");

            entity.HasOne(d => d.Article).WithMany(p => p.AiEmbeddings)
                .HasForeignKey(d => d.ArticleId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("ai_embeddings_article_id_fkey");

            entity.HasOne(d => d.Issue).WithMany(p => p.AiEmbeddings)
                .HasForeignKey(d => d.IssueId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("ai_embeddings_issue_id_fkey");
        });

        modelBuilder.Entity<Analytics>(entity =>
        {
            entity.HasKey(e => e.AnalyticsId).HasName("analytics_pkey");

            entity.ToTable("analytics");

            entity.Property(e => e.AnalyticsId).HasColumnName("analytics_id");
            entity.Property(e => e.AdId).HasColumnName("ad_id");
            entity.Property(e => e.ClicksTotal)
                .HasDefaultValue(0)
                .HasColumnName("clicks_total");
            entity.Property(e => e.Ctr)
                .HasPrecision(5, 2)
                .HasColumnName("ctr");
            entity.Property(e => e.IssueId).HasColumnName("issue_id");
            entity.Property(e => e.ReportDate)
                .HasDefaultValueSql("CURRENT_DATE")
                .HasColumnName("report_date");
            entity.Property(e => e.UniqueReaders)
                .HasDefaultValue(0)
                .HasColumnName("unique_readers");

            entity.HasOne(d => d.Ad).WithMany(p => p.Analytics)
                .HasForeignKey(d => d.AdId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("analytics_ad_id_fkey");

            entity.HasOne(d => d.Issue).WithMany(p => p.Analytics)
                .HasForeignKey(d => d.IssueId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("analytics_issue_id_fkey");
        });

        modelBuilder.Entity<Article>(entity =>
        {
            entity.HasKey(e => e.ArticleId).HasName("articles_pkey");

            entity.ToTable("articles");

            entity.Property(e => e.ArticleId).HasColumnName("article_id");
            entity.Property(e => e.Author)
                .HasMaxLength(100)
                .HasColumnName("author");
            entity.Property(e => e.CategoryId).HasColumnName("category_id");
            entity.Property(e => e.Content).HasColumnName("content");
            entity.Property(e => e.IsHighlighted)
                .HasDefaultValue(false)
                .HasColumnName("is_highlighted");
            entity.Property(e => e.IssueId).HasColumnName("issue_id");
            entity.Property(e => e.Title)
                .HasMaxLength(200)
                .HasColumnName("title");

            entity.HasOne(d => d.Category).WithMany(p => p.Articles)
                .HasForeignKey(d => d.CategoryId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("articles_category_id_fkey");

            entity.HasOne(d => d.Issue).WithMany(p => p.Articles)
                .HasForeignKey(d => d.IssueId)
                .HasConstraintName("articles_issue_id_fkey");
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.CategoryId).HasName("categories_pkey");

            entity.ToTable("categories");

            entity.HasIndex(e => e.Name, "categories_name_key").IsUnique();

            entity.Property(e => e.CategoryId).HasColumnName("category_id");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
        });

        modelBuilder.Entity<Chatbotlog>(entity =>
        {
            entity.HasKey(e => e.LogId).HasName("chatbotlogs_pkey");

            entity.ToTable("chatbotlogs");

            entity.Property(e => e.LogId).HasColumnName("log_id");
            entity.Property(e => e.Answer).HasColumnName("answer");
            entity.Property(e => e.LogTimestamp)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("log_timestamp");
            entity.Property(e => e.Question).HasColumnName("question");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.UserType)
                .HasMaxLength(20)
                .HasColumnName("user_type");
        });

        modelBuilder.Entity<Click>(entity =>
        {
            entity.HasKey(e => e.ClickId).HasName("clicks_pkey");

            entity.ToTable("clicks");

            entity.Property(e => e.ClickId).HasColumnName("click_id");
            entity.Property(e => e.AdId).HasColumnName("ad_id");
            entity.Property(e => e.DeviceType)
                .HasMaxLength(50)
                .HasColumnName("device_type");
            entity.Property(e => e.IssueId).HasColumnName("issue_id");
            entity.Property(e => e.ReaderId).HasColumnName("reader_id");
            entity.Property(e => e.Source)
                .HasMaxLength(50)
                .HasColumnName("source");
            entity.Property(e => e.Timestamp)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("timestamp");

            entity.HasOne(d => d.Ad).WithMany(p => p.Clicks)
                .HasForeignKey(d => d.AdId)
                .HasConstraintName("fk_click_ad");

            entity.HasOne(d => d.Issue).WithMany(p => p.Clicks)
                .HasForeignKey(d => d.IssueId)
                .HasConstraintName("fk_click_issue");

            entity.HasOne(d => d.Reader).WithMany(p => p.Clicks)
                .HasForeignKey(d => d.ReaderId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_click_reader");
        });

        modelBuilder.Entity<Engagement>(entity =>
        {
            entity.HasKey(e => e.EngagementId).HasName("engagement_pkey");

            entity.ToTable("engagement");

            entity.Property(e => e.EngagementId).HasColumnName("engagement_id");
            entity.Property(e => e.IssueId).HasColumnName("issue_id");
            entity.Property(e => e.ReaderId).HasColumnName("reader_id");
            entity.Property(e => e.Timestamp)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("timestamp");
            entity.Property(e => e.Type)
                .HasMaxLength(20)
                .HasColumnName("type");

            entity.HasOne(d => d.Issue).WithMany(p => p.Engagements)
                .HasForeignKey(d => d.IssueId)
                .HasConstraintName("fk_engagement_issue");

            entity.HasOne(d => d.Reader).WithMany(p => p.Engagements)
                .HasForeignKey(d => d.ReaderId)
                .HasConstraintName("fk_engagement_reader");
        });

        modelBuilder.Entity<Issue>(entity =>
        {
            entity.HasKey(e => e.IssueId).HasName("issues_pkey");

            entity.ToTable("issues");

            entity.Property(e => e.IssueId).HasColumnName("issue_id");
            entity.Property(e => e.FileUrl)
                .HasMaxLength(500)
                .HasColumnName("file_url");
            entity.Property(e => e.IssueDate).HasColumnName("issue_date");
            entity.Property(e => e.Summary).HasColumnName("summary");
            entity.Property(e => e.Title)
                .HasMaxLength(200)
                .HasColumnName("title");
        });

        modelBuilder.Entity<Medium>(entity =>
        {
            entity.HasKey(e => e.MediaId).HasName("media_pkey");

            entity.ToTable("media");

            entity.Property(e => e.MediaId).HasColumnName("media_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.RelatedId).HasColumnName("related_id");
            entity.Property(e => e.RelatedTo)
                .HasMaxLength(20)
                .HasColumnName("related_to");
            entity.Property(e => e.Type)
                .HasMaxLength(50)
                .HasColumnName("type");
            entity.Property(e => e.Url)
                .HasMaxLength(500)
                .HasColumnName("url");
        });

        modelBuilder.Entity<Newsletter>(entity =>
        {
            entity.HasKey(e => e.NewsletterId).HasName("newsletter_pkey");

            entity.ToTable("newsletter");

            entity.Property(e => e.NewsletterId).HasColumnName("newsletter_id");
            entity.Property(e => e.ReaderId).HasColumnName("reader_id");
            entity.Property(e => e.Subscribed).HasColumnName("subscribed");
            entity.Property(e => e.UnsubscribedDate).HasColumnName("unsubscribed_date");

            entity.HasOne(d => d.Reader).WithMany(p => p.Newsletters)
                .HasForeignKey(d => d.ReaderId)
                .HasConstraintName("fk_newsletter_reader");
        });

        modelBuilder.Entity<Package>(entity =>
        {
            entity.HasKey(e => e.PackageId).HasName("packages_pkey");

            entity.ToTable("packages");

            entity.Property(e => e.PackageId).HasColumnName("package_id");
            entity.Property(e => e.AdvertiserId).HasColumnName("advertiser_id");
            entity.Property(e => e.EndDate).HasColumnName("end_date");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
            entity.Property(e => e.Price)
                .HasPrecision(10, 2)
                .HasColumnName("price");
            entity.Property(e => e.SlotsTotal).HasColumnName("slots_total");
            entity.Property(e => e.SlotsUsed).HasColumnName("slots_used");
            entity.Property(e => e.StartDate).HasColumnName("start_date");

            entity.HasOne(d => d.Advertiser).WithMany(p => p.Packages)
                .HasForeignKey(d => d.AdvertiserId)
                .HasConstraintName("fk_package_advertiser");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.PaymentId).HasName("payments_pkey");

            entity.ToTable("payments");

            entity.Property(e => e.PaymentId).HasColumnName("payment_id");
            entity.Property(e => e.AdvertiserId).HasColumnName("advertiser_id");
            entity.Property(e => e.Amount)
                .HasPrecision(10, 2)
                .HasColumnName("amount");
            entity.Property(e => e.Date).HasColumnName("date");
            entity.Property(e => e.Method)
                .HasMaxLength(50)
                .HasColumnName("method");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasColumnName("status");

            entity.HasOne(d => d.Advertiser).WithMany(p => p.Payments)
                .HasForeignKey(d => d.AdvertiserId)
                .HasConstraintName("fk_payment_advertiser");
        });

        modelBuilder.Entity<Reader>(entity =>
        {
            entity.HasKey(e => e.ReaderId).HasName("readers_pkey");

            entity.ToTable("readers");

            entity.Property(e => e.ReaderId).HasColumnName("reader_id");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .HasColumnName("email");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
            entity.Property(e => e.Phone)
                .HasMaxLength(20)
                .HasColumnName("phone");
            entity.Property(e => e.Preferences).HasColumnName("preferences");
            entity.Property(e => e.SignupDate).HasColumnName("signup_date");
        });

        modelBuilder.Entity<Recommendation>(entity =>
        {
            entity.HasKey(e => e.RecommendationId).HasName("recommendations_pkey");

            entity.ToTable("recommendations");

            entity.Property(e => e.RecommendationId).HasColumnName("recommendation_id");
            entity.Property(e => e.ArticleId).HasColumnName("article_id");
            entity.Property(e => e.GeneratedAt)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("generated_at");
            entity.Property(e => e.ReaderId).HasColumnName("reader_id");
            entity.Property(e => e.Score)
                .HasPrecision(5, 2)
                .HasColumnName("score");

            entity.HasOne(d => d.Article).WithMany(p => p.Recommendations)
                .HasForeignKey(d => d.ArticleId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("recommendations_article_id_fkey");
        });

        modelBuilder.Entity<Subscription>(entity =>
        {
            entity.HasKey(e => e.SubscriptionId).HasName("subscriptions_pkey");

            entity.ToTable("subscriptions");

            entity.Property(e => e.SubscriptionId).HasColumnName("subscription_id");
            entity.Property(e => e.EndDate).HasColumnName("end_date");
            entity.Property(e => e.ReaderId).HasColumnName("reader_id");
            entity.Property(e => e.StartDate).HasColumnName("start_date");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasColumnName("status");

            entity.HasOne(d => d.Reader).WithMany(p => p.Subscriptions)
                .HasForeignKey(d => d.ReaderId)
                .HasConstraintName("fk_reader");
        });

        modelBuilder.Entity<Systemlog>(entity =>
        {
            entity.HasKey(e => e.LogId).HasName("systemlogs_pkey");

            entity.ToTable("systemlogs");

            entity.Property(e => e.LogId).HasColumnName("log_id");
            entity.Property(e => e.Action)
                .HasMaxLength(200)
                .HasColumnName("action");
            entity.Property(e => e.Details).HasColumnName("details");
            entity.Property(e => e.LogTimestamp)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("log_timestamp");
            entity.Property(e => e.UserId).HasColumnName("user_id");
        });

        modelBuilder.Entity<TestTable>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("test_table_pkey");

            entity.ToTable("test_table");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
