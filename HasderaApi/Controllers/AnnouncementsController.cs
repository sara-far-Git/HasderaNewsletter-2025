using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HasderaApi.Data;
using HasderaApi.Models;
using Microsoft.AspNetCore.Authorization;

namespace HasderaApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnnouncementsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AnnouncementsController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// קבלת כל ההודעות הפעילות (לקוראים)
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetActiveAnnouncements()
        {
            var now = DateTime.UtcNow;
            
            var announcements = await _context.Announcements
                .Where(a => a.IsActive 
                    && a.StartDate <= now 
                    && (a.EndDate == null || a.EndDate > now))
                .OrderByDescending(a => a.Priority)
                .ThenByDescending(a => a.CreatedAt)
                .Select(a => new
                {
                    a.AnnouncementId,
                    a.Title,
                    a.Content,
                    a.Type,
                    a.Icon,
                    a.BackgroundColor,
                    a.ActionUrl,
                    a.ActionText,
                    a.StartDate,
                    a.EndDate,
                    a.Priority
                })
                .ToListAsync();

            return Ok(announcements);
        }

        /// <summary>
        /// קבלת כל ההודעות (לניהול)
        /// </summary>
        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<Announcement>>> GetAllAnnouncements()
        {
            var announcements = await _context.Announcements
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            return Ok(announcements);
        }

        /// <summary>
        /// קבלת הודעה לפי מזהה
        /// </summary>
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Announcement>> GetAnnouncement(int id)
        {
            var announcement = await _context.Announcements.FindAsync(id);

            if (announcement == null)
            {
                return NotFound(new { error = "הודעה לא נמצאה" });
            }

            return Ok(announcement);
        }

        /// <summary>
        /// יצירת הודעה חדשה
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Announcement>> CreateAnnouncement([FromBody] CreateAnnouncementDto dto)
        {
            var announcement = new Announcement
            {
                Title = dto.Title,
                Content = dto.Content,
                Type = dto.Type ?? "news",
                Icon = dto.Icon,
                BackgroundColor = dto.BackgroundColor,
                ActionUrl = dto.ActionUrl,
                ActionText = dto.ActionText,
                StartDate = dto.StartDate ?? DateTime.UtcNow,
                EndDate = dto.EndDate,
                IsActive = dto.IsActive ?? true,
                Priority = dto.Priority ?? 0,
                CreatedAt = DateTime.UtcNow
            };

            _context.Announcements.Add(announcement);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAnnouncement), new { id = announcement.AnnouncementId }, announcement);
        }

        /// <summary>
        /// עדכון הודעה
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateAnnouncement(int id, [FromBody] UpdateAnnouncementDto dto)
        {
            var announcement = await _context.Announcements.FindAsync(id);

            if (announcement == null)
            {
                return NotFound(new { error = "הודעה לא נמצאה" });
            }

            if (dto.Title != null) announcement.Title = dto.Title;
            if (dto.Content != null) announcement.Content = dto.Content;
            if (dto.Type != null) announcement.Type = dto.Type;
            if (dto.Icon != null) announcement.Icon = dto.Icon;
            if (dto.BackgroundColor != null) announcement.BackgroundColor = dto.BackgroundColor;
            if (dto.ActionUrl != null) announcement.ActionUrl = dto.ActionUrl;
            if (dto.ActionText != null) announcement.ActionText = dto.ActionText;
            if (dto.StartDate.HasValue) announcement.StartDate = dto.StartDate.Value;
            if (dto.EndDate.HasValue) announcement.EndDate = dto.EndDate.Value;
            if (dto.IsActive.HasValue) announcement.IsActive = dto.IsActive.Value;
            if (dto.Priority.HasValue) announcement.Priority = dto.Priority.Value;
            
            announcement.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(announcement);
        }

        /// <summary>
        /// מחיקת הודעה
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAnnouncement(int id)
        {
            var announcement = await _context.Announcements.FindAsync(id);

            if (announcement == null)
            {
                return NotFound(new { error = "הודעה לא נמצאה" });
            }

            _context.Announcements.Remove(announcement);
            await _context.SaveChangesAsync();

            return Ok(new { message = "ההודעה נמחקה בהצלחה" });
        }

        /// <summary>
        /// הפעלה/כיבוי הודעה
        /// </summary>
        [HttpPatch("{id}/toggle")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ToggleAnnouncement(int id)
        {
            var announcement = await _context.Announcements.FindAsync(id);

            if (announcement == null)
            {
                return NotFound(new { error = "הודעה לא נמצאה" });
            }

            announcement.IsActive = !announcement.IsActive;
            announcement.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();

            return Ok(new { 
                message = announcement.IsActive ? "ההודעה הופעלה" : "ההודעה כובתה",
                isActive = announcement.IsActive 
            });
        }
    }

    // DTOs
    public class CreateAnnouncementDto
    {
        public required string Title { get; set; }
        public string? Content { get; set; }
        public string? Type { get; set; }
        public string? Icon { get; set; }
        public string? BackgroundColor { get; set; }
        public string? ActionUrl { get; set; }
        public string? ActionText { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool? IsActive { get; set; }
        public int? Priority { get; set; }
    }

    public class UpdateAnnouncementDto
    {
        public string? Title { get; set; }
        public string? Content { get; set; }
        public string? Type { get; set; }
        public string? Icon { get; set; }
        public string? BackgroundColor { get; set; }
        public string? ActionUrl { get; set; }
        public string? ActionText { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool? IsActive { get; set; }
        public int? Priority { get; set; }
    }
}

