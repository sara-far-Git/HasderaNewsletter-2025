using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HasderaApi.Models
{
    /// <summary>
    /// הודעות חגיגיות / מבצעים / עדכונים לקוראים
    /// </summary>
    [Table("announcements")]
    public class Announcement
    {
        [Key]
        [Column("announcement_id")]
        public int AnnouncementId { get; set; }

        /// <summary>
        /// כותרת ההודעה
        /// </summary>
        [Required]
        [Column("title")]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// תוכן ההודעה
        /// </summary>
        [Column("content")]
        public string? Content { get; set; }

        /// <summary>
        /// סוג ההודעה: promotion, holiday, news, update
        /// </summary>
        [Column("type")]
        [MaxLength(50)]
        public string Type { get; set; } = "news";

        /// <summary>
        /// אייקון (emoji או שם אייקון)
        /// </summary>
        [Column("icon")]
        [MaxLength(50)]
        public string? Icon { get; set; }

        /// <summary>
        /// צבע רקע (hex או gradient)
        /// </summary>
        [Column("background_color")]
        [MaxLength(100)]
        public string? BackgroundColor { get; set; }

        /// <summary>
        /// קישור לפעולה (אופציונלי)
        /// </summary>
        [Column("action_url")]
        [MaxLength(500)]
        public string? ActionUrl { get; set; }

        /// <summary>
        /// טקסט לכפתור הפעולה
        /// </summary>
        [Column("action_text")]
        [MaxLength(100)]
        public string? ActionText { get; set; }

        /// <summary>
        /// תאריך תחילת הצגה
        /// </summary>
        [Column("start_date")]
        public DateTime StartDate { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// תאריך סיום הצגה (null = ללא הגבלה)
        /// </summary>
        [Column("end_date")]
        public DateTime? EndDate { get; set; }

        /// <summary>
        /// האם ההודעה פעילה
        /// </summary>
        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// עדיפות (מספר גבוה = מוצג ראשון)
        /// </summary>
        [Column("priority")]
        public int Priority { get; set; } = 0;

        /// <summary>
        /// תאריך יצירה
        /// </summary>
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// תאריך עדכון אחרון
        /// </summary>
        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        /// <summary>
        /// מזהה היוצר
        /// </summary>
        [Column("created_by")]
        public int? CreatedBy { get; set; }
    }
}

