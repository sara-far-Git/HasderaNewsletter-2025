using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HasderaApi.Models;

[Table("content_likes")]
public class ContentLike
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [Column("content_id")]
    public int ContentId { get; set; }

    [Column("user_id")]
    public int? UserId { get; set; } // ID של המשתמש (אם מחובר)

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("ContentId")]
    public virtual SectionContent? Content { get; set; }
}

