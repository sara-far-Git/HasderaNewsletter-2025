using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HasderaApi.Models
{
    /// <summary>
    /// מודל מדור - מייצג מדור תוכן באזור הקוראים
    /// </summary>
    public class Section
    {
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string SectionKey { get; set; } = null!; // recipes, stories, challenges, etc.

        [Required]
        [StringLength(100)]
        public string Title { get; set; } = null!;

        [StringLength(500)]
        public string? Description { get; set; }

        [StringLength(10)]
        public string? Icon { get; set; } // Emoji

        [StringLength(20)]
        public string? Color { get; set; } // Hex color

        public bool IsActive { get; set; } = true;

        public int SortOrder { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public ICollection<SectionContent> Contents { get; set; } = new List<SectionContent>();
    }
}

