using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HasderaApi.Models
{
    /// <summary>
    /// מודל לייק לתוכן
    /// </summary>
    public class ContentLike
    {
        public int Id { get; set; }

        [Required]
        public int ContentId { get; set; }

        [Required]
        public int UserId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        [ForeignKey("ContentId")]
        public SectionContent? Content { get; set; }
    }
}

