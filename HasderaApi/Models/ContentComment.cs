using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HasderaApi.Models;

[Table("content_comments")]
public class ContentComment
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [Column("content_id")]
    public int ContentId { get; set; }

    [Column("user_id")]
    public int? UserId { get; set; } // ID של המשתמש (אם מחובר)

    [Required]
    [MaxLength(200)]
    [Column("author_name")]
    public string AuthorName { get; set; } = string.Empty; // שם המגיב

    [Required]
    [Column("text")]
    public string Text { get; set; } = string.Empty; // תוכן התגובה

    [Column("is_approved")]
    public bool IsApproved { get; set; } = true; // האם התגובה מאושרת (למניעת ספאם)

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("ContentId")]
    public virtual SectionContent? Content { get; set; }
}

