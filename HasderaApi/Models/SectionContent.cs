using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HasderaApi.Models;

[Table("section_contents")]
public class SectionContent
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [Column("section_id")]
    public int SectionId { get; set; }

    [Required]
    [MaxLength(300)]
    [Column("title")]
    public string Title { get; set; } = string.Empty;

    [MaxLength(500)]
    [Column("excerpt")]
    public string? Excerpt { get; set; } // תקציר

    [Column("content")]
    public string Content { get; set; } = string.Empty; // תוכן מלא (HTML או Markdown)

    [MaxLength(1000)]
    [Column("image_url")]
    public string? ImageUrl { get; set; } // תמונה ראשית

    [Column("published")]
    public bool Published { get; set; } = false; // האם פורסם

    [Column("likes_count")]
    public int LikesCount { get; set; } = 0;

    [Column("comments_count")]
    public int CommentsCount { get; set; } = 0;

    [Column("views_count")]
    public int ViewsCount { get; set; } = 0;

    [Column("author_id")]
    public int? AuthorId { get; set; } // ID של המשתמש שיצר

    [MaxLength(200)]
    [Column("author_name")]
    public string? AuthorName { get; set; } // שם המחבר

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("SectionId")]
    public virtual Section? Section { get; set; }

    public virtual ICollection<ContentComment> Comments { get; set; } = new List<ContentComment>();
    public virtual ICollection<ContentLike> Likes { get; set; } = new List<ContentLike>();
}

