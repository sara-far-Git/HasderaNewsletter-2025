using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HasderaApi.Data;
using HasderaApi.Models;
using System.Security.Claims;

namespace HasderaApi.Controllers
{
    /// <summary>
    /// קונטרולר מדורים - ניהול מדורי תוכן ותגובות
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class SectionsController : ControllerBase
    {
        private readonly HasderaDbContext _context;

        public SectionsController(HasderaDbContext context)
        {
            _context = context;
        }

        #region Sections

        /// <summary>
        /// קבלת כל המדורים הפעילים
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Section>>> GetSections()
        {
            return await _context.Sections
                .Where(s => s.IsActive)
                .OrderBy(s => s.SortOrder)
                .ToListAsync();
        }

        /// <summary>
        /// קבלת מדור לפי מזהה
        /// </summary>
        [HttpGet("{sectionKey}")]
        public async Task<ActionResult<Section>> GetSection(string sectionKey)
        {
            var section = await _context.Sections
                .FirstOrDefaultAsync(s => s.SectionKey == sectionKey);

            if (section == null)
            {
                return NotFound();
            }

            return section;
        }

        #endregion

        #region Contents

        /// <summary>
        /// קבלת תכנים של מדור
        /// </summary>
        [HttpGet("{sectionKey}/contents")]
        public async Task<ActionResult<IEnumerable<object>>> GetSectionContents(string sectionKey)
        {
            var section = await _context.Sections
                .FirstOrDefaultAsync(s => s.SectionKey == sectionKey);

            if (section == null)
            {
                return NotFound("Section not found");
            }

            var contents = await _context.SectionContents
                .Where(c => c.SectionId == section.Id && c.Published)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new
                {
                    c.Id,
                    c.Title,
                    c.Excerpt,
                    c.ImageUrl,
                    c.AuthorName,
                    c.CreatedAt,
                    c.LikesCount,
                    c.CommentsCount,
                    Comments = c.Comments
                        .Where(comment => comment.IsApproved)
                        .OrderByDescending(comment => comment.CreatedAt)
                        .Take(10)
                        .Select(comment => new
                        {
                            comment.Id,
                            Author = comment.AuthorName,
                            comment.Text,
                            comment.CreatedAt
                        })
                })
                .ToListAsync();

            return Ok(contents);
        }

        /// <summary>
        /// קבלת תוכן בודד עם פרטים מלאים
        /// </summary>
        [HttpGet("contents/{contentId}")]
        public async Task<ActionResult<object>> GetContent(int contentId)
        {
            var content = await _context.SectionContents
                .Include(c => c.Comments.Where(comment => comment.IsApproved))
                .FirstOrDefaultAsync(c => c.Id == contentId && c.Published);

            if (content == null)
            {
                return NotFound();
            }

            // Increment views
            content.ViewsCount++;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                content.Id,
                content.Title,
                content.Excerpt,
                content.Content,
                content.ImageUrl,
                content.AuthorName,
                content.CreatedAt,
                content.LikesCount,
                content.CommentsCount,
                content.ViewsCount,
                Comments = content.Comments
                    .OrderByDescending(c => c.CreatedAt)
                    .Select(c => new
                    {
                        c.Id,
                        Author = c.AuthorName,
                        c.Text,
                        c.CreatedAt
                    })
            });
        }

        #endregion

        #region Comments

        /// <summary>
        /// הוספת תגובה לתוכן
        /// </summary>
        [HttpPost("contents/{contentId}/comments")]
        public async Task<ActionResult<object>> AddComment(int contentId, [FromBody] CommentDto dto)
        {
            var content = await _context.SectionContents.FindAsync(contentId);
            if (content == null)
            {
                return NotFound("Content not found");
            }

            var comment = new ContentComment
            {
                ContentId = contentId,
                AuthorName = dto.AuthorName ?? "אורחת",
                Text = dto.Text,
                IsApproved = true, // Auto-approve for now
                CreatedAt = DateTime.UtcNow
            };

            _context.ContentComments.Add(comment);
            content.CommentsCount++;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                comment.Id,
                Author = comment.AuthorName,
                comment.Text,
                comment.CreatedAt
            });
        }

        #endregion

        #region Likes

        /// <summary>
        /// הוספת/הסרת לייק לתוכן
        /// </summary>
        [HttpPost("contents/{contentId}/like")]
        public async Task<ActionResult<object>> ToggleLike(int contentId, [FromBody] LikeDto dto)
        {
            var content = await _context.SectionContents.FindAsync(contentId);
            if (content == null)
            {
                return NotFound("Content not found");
            }

            var existingLike = await _context.ContentLikes
                .FirstOrDefaultAsync(l => l.ContentId == contentId && l.UserId == dto.UserId);

            bool liked;
            if (existingLike != null)
            {
                // Remove like
                _context.ContentLikes.Remove(existingLike);
                content.LikesCount = Math.Max(0, content.LikesCount - 1);
                liked = false;
            }
            else
            {
                // Add like
                _context.ContentLikes.Add(new ContentLike
                {
                    ContentId = contentId,
                    UserId = dto.UserId,
                    CreatedAt = DateTime.UtcNow
                });
                content.LikesCount++;
                liked = true;
            }

            await _context.SaveChangesAsync();

            return Ok(new { liked, likesCount = content.LikesCount });
        }

        #endregion

        #region Admin

        /// <summary>
        /// [Admin] קבלת כל התכנים של מדור (כולל טיוטות)
        /// </summary>
        [HttpGet("admin/{sectionKey}/contents")]
        public async Task<ActionResult<IEnumerable<object>>> GetAdminSectionContents(string sectionKey)
        {
            var section = await _context.Sections
                .FirstOrDefaultAsync(s => s.SectionKey == sectionKey);

            if (section == null)
            {
                return NotFound("Section not found");
            }

            var contents = await _context.SectionContents
                .Where(c => c.SectionId == section.Id)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new
                {
                    c.Id,
                    c.Title,
                    c.Excerpt,
                    c.Content,
                    c.ImageUrl,
                    c.Published,
                    c.AuthorName,
                    c.CreatedAt,
                    c.UpdatedAt,
                    c.LikesCount,
                    c.CommentsCount,
                    c.ViewsCount
                })
                .ToListAsync();

            return Ok(contents);
        }

        /// <summary>
        /// [Admin] יצירת תוכן חדש
        /// </summary>
        [HttpPost("admin/{sectionKey}/contents")]
        public async Task<ActionResult<object>> CreateContent(string sectionKey, [FromBody] ContentCreateDto dto)
        {
            var section = await _context.Sections
                .FirstOrDefaultAsync(s => s.SectionKey == sectionKey);

            if (section == null)
            {
                return NotFound("Section not found");
            }

            var content = new SectionContent
            {
                SectionId = section.Id,
                Title = dto.Title,
                Excerpt = dto.Excerpt,
                Content = dto.Content,
                ImageUrl = dto.ImageUrl,
                Published = dto.Published,
                AuthorName = dto.AuthorName ?? "מערכת השדרה",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.SectionContents.Add(content);
            await _context.SaveChangesAsync();

            return Ok(new { content.Id, message = "Content created successfully" });
        }

        /// <summary>
        /// [Admin] עדכון תוכן
        /// </summary>
        [HttpPut("admin/contents/{contentId}")]
        public async Task<ActionResult<object>> UpdateContent(int contentId, [FromBody] ContentUpdateDto dto)
        {
            var content = await _context.SectionContents.FindAsync(contentId);
            if (content == null)
            {
                return NotFound("Content not found");
            }

            if (!string.IsNullOrEmpty(dto.Title))
                content.Title = dto.Title;
            if (dto.Excerpt != null)
                content.Excerpt = dto.Excerpt;
            if (dto.Content != null)
                content.Content = dto.Content;
            if (dto.ImageUrl != null)
                content.ImageUrl = dto.ImageUrl;
            if (dto.Published.HasValue)
                content.Published = dto.Published.Value;
            
            content.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Content updated successfully" });
        }

        /// <summary>
        /// [Admin] מחיקת תוכן
        /// </summary>
        [HttpDelete("admin/contents/{contentId}")]
        public async Task<ActionResult> DeleteContent(int contentId)
        {
            var content = await _context.SectionContents
                .Include(c => c.Comments)
                .Include(c => c.Likes)
                .FirstOrDefaultAsync(c => c.Id == contentId);

            if (content == null)
            {
                return NotFound("Content not found");
            }

            // Remove related comments and likes
            _context.ContentComments.RemoveRange(content.Comments);
            _context.ContentLikes.RemoveRange(content.Likes);
            _context.SectionContents.Remove(content);
            
            await _context.SaveChangesAsync();

            return Ok(new { message = "Content deleted successfully" });
        }

        /// <summary>
        /// [Admin] שינוי סטטוס פרסום
        /// </summary>
        [HttpPatch("admin/contents/{contentId}/publish")]
        public async Task<ActionResult<object>> TogglePublish(int contentId)
        {
            var content = await _context.SectionContents.FindAsync(contentId);
            if (content == null)
            {
                return NotFound("Content not found");
            }

            content.Published = !content.Published;
            content.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { published = content.Published });
        }

        #endregion
    }

    #region DTOs

    public class CommentDto
    {
        public string? AuthorName { get; set; }
        public string Text { get; set; } = null!;
    }

    public class LikeDto
    {
        public int UserId { get; set; }
    }

    public class ContentCreateDto
    {
        public string Title { get; set; } = null!;
        public string? Excerpt { get; set; }
        public string? Content { get; set; }
        public string? ImageUrl { get; set; }
        public bool Published { get; set; } = true;
        public string? AuthorName { get; set; }
    }

    public class ContentUpdateDto
    {
        public string? Title { get; set; }
        public string? Excerpt { get; set; }
        public string? Content { get; set; }
        public string? ImageUrl { get; set; }
        public bool? Published { get; set; }
    }

    #endregion
}

