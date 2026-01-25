using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HasderaApi.Models
{
    /// <summary>
    /// מודל תוכן מדור - מייצג פריט תוכן בתוך מדור
    /// </summary>
    public class SectionContent
    {
        public int Id { get; set; }

        [Required]
        public int SectionId { get; set; }

        [Required]
        [StringLength(200)]
        public string Title { get; set; } = null!;

        [StringLength(500)]
        public string? Excerpt { get; set; }

        public string? Content { get; set; } // Full content (HTML or plain text)

        [StringLength(500)]
        public string? ImageUrl { get; set; }

        public bool Published { get; set; } = true;

        public int LikesCount { get; set; } = 0;

        public int CommentsCount { get; set; } = 0;

        public int ViewsCount { get; set; } = 0;

        public int? AuthorId { get; set; }

        [StringLength(100)]
        public string? AuthorName { get; set; } = "מערכת השדרה";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("SectionId")]
        public Section? Section { get; set; }

        public ICollection<ContentComment> Comments { get; set; } = new List<ContentComment>();
        
        public ICollection<ContentLike> Likes { get; set; } = new List<ContentLike>();
    }
}

