using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HasderaApi.Models
{
    /// <summary>
    /// מודל תגובה לתוכן
    /// </summary>
    public class ContentComment
    {
        public int Id { get; set; }

        [Required]
        public int ContentId { get; set; }

        public int? UserId { get; set; }

        [Required]
        [StringLength(100)]
        public string AuthorName { get; set; } = null!;

        [Required]
        [StringLength(1000)]
        public string Text { get; set; } = null!;

        public bool IsApproved { get; set; } = true; // Auto-approve or require moderation

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        [ForeignKey("ContentId")]
        public SectionContent? Content { get; set; }
    }
}

