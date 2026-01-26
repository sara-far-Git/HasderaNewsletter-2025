using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HasderaApi.Models;

[Table("sections")]
public class Section
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("section_key")]
    public string SectionKey { get; set; } = string.Empty; // מזהה ייחודי (למשל: "recipes", "stories")

    [Required]
    [MaxLength(200)]
    [Column("title")]
    public string Title { get; set; } = string.Empty; // שם הקטגוריה בעברית

    [Column("description")]
    public string? Description { get; set; } // תיאור הקטגוריה

    [MaxLength(50)]
    [Column("icon")]
    public string? Icon { get; set; } // אייקון (emoji או שם)

    [MaxLength(20)]
    [Column("color")]
    public string? Color { get; set; } // צבע לקטגוריה (hex)

    [Column("is_active")]
    public bool IsActive { get; set; } = true; // האם הקטגוריה פעילה

    [Column("sort_order")]
    public int SortOrder { get; set; } = 0; // סדר הצגה

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public virtual ICollection<SectionContent> Contents { get; set; } = new List<SectionContent>();
}

