using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HasderaApi.Data;
using HasderaApi.Models;
using System.Security.Claims;

namespace HasderaApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SectionsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<SectionsController> _logger;

    public SectionsController(AppDbContext context, ILogger<SectionsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/sections - קבלת כל הקטגוריות הפעילות
    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetSections()
    {
        var sections = await _context.Sections
            .Where(s => s.IsActive)
            .OrderBy(s => s.SortOrder)
            .ThenBy(s => s.Title)
            .Select(s => new
            {
                s.Id,
                s.SectionKey,
                s.Title,
                s.Description,
                s.Icon,
                s.Color,
                s.SortOrder,
                ContentsCount = s.Contents.Count(c => c.Published)
            })
            .ToListAsync();

        return Ok(sections);
    }

    // GET: api/sections/{id} - קבלת קטגוריה ספציפית
    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetSection(int id)
    {
        var section = await _context.Sections
            .Where(s => s.Id == id && s.IsActive)
            .Select(s => new
            {
                s.Id,
                s.SectionKey,
                s.Title,
                s.Description,
                s.Icon,
                s.Color,
                s.SortOrder
            })
            .FirstOrDefaultAsync();

        if (section == null)
        {
            return NotFound(new { message = "קטגוריה לא נמצאה" });
        }

        return Ok(section);
    }

    // GET: api/sections/{id}/contents - קבלת כל התוכן של קטגוריה
    [HttpGet("{id}/contents")]
    public async Task<ActionResult<IEnumerable<object>>> GetSectionContents(int id, [FromQuery] bool publishedOnly = true)
    {
        var query = _context.SectionContents
            .Where(c => c.SectionId == id);

        if (publishedOnly)
        {
            query = query.Where(c => c.Published);
        }

        var contents = await query
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new
            {
                c.Id,
                c.Title,
                c.Excerpt,
                c.ImageUrl,
                c.Published,
                c.LikesCount,
                c.CommentsCount,
                c.ViewsCount,
                c.AuthorName,
                c.CreatedAt,
                c.UpdatedAt
            })
            .ToListAsync();

        return Ok(contents);
    }

    // GET: api/sections/contents/{contentId} - קבלת תוכן ספציפי
    [HttpGet("contents/{contentId}")]
    public async Task<ActionResult<object>> GetContent(int contentId)
    {
        var content = await _context.SectionContents
            .Where(c => c.Id == contentId)
            .Select(c => new
            {
                c.Id,
                c.SectionId,
                SectionTitle = c.Section != null ? c.Section.Title : null,
                c.Title,
                c.Excerpt,
                c.Content,
                c.ImageUrl,
                c.Published,
                c.LikesCount,
                c.CommentsCount,
                c.ViewsCount,
                c.AuthorName,
                c.CreatedAt,
                c.UpdatedAt
            })
            .FirstOrDefaultAsync();

        if (content == null)
        {
            return NotFound(new { message = "תוכן לא נמצא" });
        }

        // עדכון מספר הצפיות
        var contentEntity = await _context.SectionContents.FindAsync(contentId);
        if (contentEntity != null)
        {
            contentEntity.ViewsCount++;
            await _context.SaveChangesAsync();
        }

        return Ok(content);
    }

    // POST: api/sections - יצירת קטגוריה חדשה (Admin only)
    [HttpPost]
    public async Task<ActionResult<Section>> CreateSection([FromBody] CreateSectionDto dto)
    {
        if (!IsAdmin())
        {
            return Unauthorized(new { message = "אין הרשאה" });
        }

        if (await _context.Sections.AnyAsync(s => s.SectionKey == dto.SectionKey))
        {
            return BadRequest(new { message = "מזהה קטגוריה כבר קיים" });
        }

        var section = new Section
        {
            SectionKey = dto.SectionKey,
            Title = dto.Title,
            Description = dto.Description,
            Icon = dto.Icon,
            Color = dto.Color,
            IsActive = true,
            SortOrder = dto.SortOrder ?? 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Sections.Add(section);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSection), new { id = section.Id }, section);
    }

    // PUT: api/sections/{id} - עדכון קטגוריה (Admin only)
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSection(int id, [FromBody] UpdateSectionDto dto)
    {
        if (!IsAdmin())
        {
            return Unauthorized(new { message = "אין הרשאה" });
        }

        var section = await _context.Sections.FindAsync(id);
        if (section == null)
        {
            return NotFound(new { message = "קטגוריה לא נמצאה" });
        }

        if (dto.SectionKey != null && dto.SectionKey != section.SectionKey)
        {
            if (await _context.Sections.AnyAsync(s => s.SectionKey == dto.SectionKey && s.Id != id))
            {
                return BadRequest(new { message = "מזהה קטגוריה כבר קיים" });
            }
            section.SectionKey = dto.SectionKey;
        }

        if (dto.Title != null) section.Title = dto.Title;
        if (dto.Description != null) section.Description = dto.Description;
        if (dto.Icon != null) section.Icon = dto.Icon;
        if (dto.Color != null) section.Color = dto.Color;
        if (dto.IsActive.HasValue) section.IsActive = dto.IsActive.Value;
        if (dto.SortOrder.HasValue) section.SortOrder = dto.SortOrder.Value;
        section.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/sections/{id} - מחיקת קטגוריה (Admin only)
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSection(int id)
    {
        if (!IsAdmin())
        {
            return Unauthorized(new { message = "אין הרשאה" });
        }

        var section = await _context.Sections.FindAsync(id);
        if (section == null)
        {
            return NotFound(new { message = "קטגוריה לא נמצאה" });
        }

        _context.Sections.Remove(section);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // POST: api/sections/{sectionId}/contents - יצירת תוכן חדש (Admin only)
    [HttpPost("{sectionId}/contents")]
    public async Task<ActionResult<SectionContent>> CreateContent(int sectionId, [FromBody] CreateContentDto dto)
    {
        if (!IsAdmin())
        {
            return Unauthorized(new { message = "אין הרשאה" });
        }

        var section = await _context.Sections.FindAsync(sectionId);
        if (section == null)
        {
            return NotFound(new { message = "קטגוריה לא נמצאה" });
        }

        var userId = GetUserId();
        var userName = GetUserName();

        var content = new SectionContent
        {
            SectionId = sectionId,
            Title = dto.Title,
            Excerpt = dto.Excerpt,
            Content = dto.Content,
            ImageUrl = dto.ImageUrl,
            Published = dto.Published ?? false,
            AuthorId = userId,
            AuthorName = userName ?? "מנהל",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.SectionContents.Add(content);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetContent), new { contentId = content.Id }, content);
    }

    // PUT: api/sections/contents/{contentId} - עדכון תוכן (Admin only)
    [HttpPut("contents/{contentId}")]
    public async Task<IActionResult> UpdateContent(int contentId, [FromBody] UpdateContentDto dto)
    {
        if (!IsAdmin())
        {
            return Unauthorized(new { message = "אין הרשאה" });
        }

        var content = await _context.SectionContents.FindAsync(contentId);
        if (content == null)
        {
            return NotFound(new { message = "תוכן לא נמצא" });
        }

        if (dto.Title != null) content.Title = dto.Title;
        if (dto.Excerpt != null) content.Excerpt = dto.Excerpt;
        if (dto.Content != null) content.Content = dto.Content;
        if (dto.ImageUrl != null) content.ImageUrl = dto.ImageUrl;
        if (dto.Published.HasValue) content.Published = dto.Published.Value;
        content.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/sections/contents/{contentId} - מחיקת תוכן (Admin only)
    [HttpDelete("contents/{contentId}")]
    public async Task<IActionResult> DeleteContent(int contentId)
    {
        if (!IsAdmin())
        {
            return Unauthorized(new { message = "אין הרשאה" });
        }

        var content = await _context.SectionContents.FindAsync(contentId);
        if (content == null)
        {
            return NotFound(new { message = "תוכן לא נמצא" });
        }

        _context.SectionContents.Remove(content);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // POST: api/sections/contents/{contentId}/comments - הוספת תגובה
    [HttpPost("contents/{contentId}/comments")]
    public async Task<ActionResult<ContentComment>> AddComment(int contentId, [FromBody] CreateCommentDto dto)
    {
        var content = await _context.SectionContents.FindAsync(contentId);
        if (content == null)
        {
            return NotFound(new { message = "תוכן לא נמצא" });
        }

        var userId = GetUserId();

        var comment = new ContentComment
        {
            ContentId = contentId,
            UserId = userId,
            AuthorName = dto.AuthorName ?? "אורח",
            Text = dto.Text,
            IsApproved = true, // ניתן לשנות ל-moderation
            CreatedAt = DateTime.UtcNow
        };

        _context.ContentComments.Add(comment);
        
        // עדכון מספר התגובות
        content.CommentsCount = await _context.ContentComments.CountAsync(c => c.ContentId == contentId && c.IsApproved);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetComments), new { contentId }, comment);
    }

    // GET: api/sections/contents/{contentId}/comments - קבלת תגובות
    [HttpGet("contents/{contentId}/comments")]
    public async Task<ActionResult<IEnumerable<object>>> GetComments(int contentId)
    {
        var comments = await _context.ContentComments
            .Where(c => c.ContentId == contentId && c.IsApproved)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new
            {
                c.Id,
                c.AuthorName,
                c.Text,
                c.CreatedAt
            })
            .ToListAsync();

        return Ok(comments);
    }

    // POST: api/sections/contents/{contentId}/like - הוספת/הסרת לייק
    [HttpPost("contents/{contentId}/like")]
    public async Task<IActionResult> ToggleLike(int contentId)
    {
        var content = await _context.SectionContents.FindAsync(contentId);
        if (content == null)
        {
            return NotFound(new { message = "תוכן לא נמצא" });
        }

        var userId = GetUserId();
        var existingLike = await _context.ContentLikes
            .FirstOrDefaultAsync(l => l.ContentId == contentId && l.UserId == userId);

        if (existingLike != null)
        {
            // הסרת לייק
            _context.ContentLikes.Remove(existingLike);
            content.LikesCount = Math.Max(0, content.LikesCount - 1);
        }
        else
        {
            // הוספת לייק
            var like = new ContentLike
            {
                ContentId = contentId,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };
            _context.ContentLikes.Add(like);
            content.LikesCount++;
        }

        await _context.SaveChangesAsync();
        return Ok(new { likesCount = content.LikesCount, isLiked = existingLike == null });
    }

    // Helper methods
    private bool IsAdmin()
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        return role?.ToLower() == "admin";
    }

    private int? GetUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return userIdClaim != null && int.TryParse(userIdClaim, out var userId) ? userId : null;
    }

    private string? GetUserName()
    {
        return User.FindFirstValue(ClaimTypes.Name);
    }

    // DTOs
    public class CreateSectionDto
    {
        public string SectionKey { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Icon { get; set; }
        public string? Color { get; set; }
        public int? SortOrder { get; set; }
    }

    public class UpdateSectionDto
    {
        public string? SectionKey { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Icon { get; set; }
        public string? Color { get; set; }
        public bool? IsActive { get; set; }
        public int? SortOrder { get; set; }
    }

    public class CreateContentDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Excerpt { get; set; }
        public string Content { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public bool? Published { get; set; }
    }

    public class UpdateContentDto
    {
        public string? Title { get; set; }
        public string? Excerpt { get; set; }
        public string? Content { get; set; }
        public string? ImageUrl { get; set; }
        public bool? Published { get; set; }
    }

    public class CreateCommentDto
    {
        public string AuthorName { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
    }

    // POST: api/sections/setup/create-tables - יצירת טבלאות (זמני - להסרה אחרי הרצה)
    [HttpPost("setup/create-tables")]
    public async Task<IActionResult> CreateTables()
    {
        if (!IsAdmin())
        {
            return Unauthorized(new { message = "אין הרשאה" });
        }

        try
        {
            var sqlScript = @"
-- יצירת טבלאות לניהול קטגוריות ותוכן

-- טבלת קטגוריות (Sections)
CREATE TABLE IF NOT EXISTS sections (
    id SERIAL PRIMARY KEY,
    section_key VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- טבלת תוכן בקטגוריות (Section Contents)
CREATE TABLE IF NOT EXISTS section_contents (
    id SERIAL PRIMARY KEY,
    section_id INTEGER NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    excerpt VARCHAR(500),
    content TEXT NOT NULL,
    image_url VARCHAR(1000),
    published BOOLEAN DEFAULT false,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    author_id INTEGER,
    author_name VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- טבלת תגובות (Comments)
CREATE TABLE IF NOT EXISTS content_comments (
    id SERIAL PRIMARY KEY,
    content_id INTEGER NOT NULL REFERENCES section_contents(id) ON DELETE CASCADE,
    user_id INTEGER,
    author_name VARCHAR(200) NOT NULL,
    text TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- טבלת לייקים (Likes)
CREATE TABLE IF NOT EXISTS content_likes (
    id SERIAL PRIMARY KEY,
    content_id INTEGER NOT NULL REFERENCES section_contents(id) ON DELETE CASCADE,
    user_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(content_id, user_id)
);

-- יצירת אינדקסים לשיפור ביצועים
CREATE INDEX IF NOT EXISTS idx_sections_is_active ON sections(is_active);
CREATE INDEX IF NOT EXISTS idx_sections_sort_order ON sections(sort_order);
CREATE INDEX IF NOT EXISTS idx_section_contents_section_id ON section_contents(section_id);
CREATE INDEX IF NOT EXISTS idx_section_contents_published ON section_contents(published);
CREATE INDEX IF NOT EXISTS idx_content_comments_content_id ON content_comments(content_id);
CREATE INDEX IF NOT EXISTS idx_content_comments_is_approved ON content_comments(is_approved);
CREATE INDEX IF NOT EXISTS idx_content_likes_content_id ON content_likes(content_id);
CREATE INDEX IF NOT EXISTS idx_content_likes_user_id ON content_likes(user_id);

-- הוספת קטגוריות ראשוניות (דוגמה)
INSERT INTO sections (section_key, title, description, icon, color, sort_order) VALUES
('recipes', 'מתכונים', 'מתכונים טעימים וקלים להכנה', '🍳', '#10b981', 1),
('stories', 'סיפורים', 'סיפורים בהמשכים', '📖', '#8b5cf6', 2),
('challenges', 'אתגרים', 'אתגרי השדרה', '🎯', '#f59e0b', 3),
('buy-sell', 'קניה ומכירה', 'לוח מודעות לקניה ומכירה', '💰', '#3b82f6', 4)
ON CONFLICT (section_key) DO NOTHING;
";

            await _context.Database.ExecuteSqlRawAsync(sqlScript);
            
            return Ok(new { message = "טבלאות נוצרו בהצלחה" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating tables");
            return StatusCode(500, new { message = "שגיאה ביצירת טבלאות", error = ex.Message });
        }
    }
}

