using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HasderaApi.Data;
using HasderaApi.Models;
using Dapper;
using Amazon.S3;
using Amazon.S3.Model;
using Amazon;
using Npgsql;
using System.Net;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using System.IO;
using System.Linq;
using System.Text.Json.Serialization;
using System.Text.Json;

namespace HasderaApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class IssuesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly NpgsqlConnection _db;
        private readonly IConfiguration _cfg;
        private readonly IAmazonS3 _s3;

        public IssuesController(AppDbContext context, NpgsqlConnection db, IConfiguration cfg, IAmazonS3 s3)
        {
            _context = context;
            _db = db;
            _cfg = cfg;
            _s3 = s3;
        }

        public class PagedResult<T>
        {
            public int Total { get; set; }
            public int Page { get; set; }
            public int PageSize { get; set; }
            public List<T> Items { get; set; } = new();

            public PagedResult(int total, int page, int pageSize, List<T> items)
            {
                Total = total;
                Page = page;
                PageSize = pageSize;
                Items = items;
            }

            public PagedResult() { }
        }

        public class IssueDto
        {
            public int Issue_id { get; set; }
            public string Title { get; set; } = string.Empty;
            public DateTime Issue_date { get; set; }   // תוקן ל־DateTime
            public string? File_url { get; set; }
            public string? Pdf_url { get; set; }
        }

            public class AdminBookSlotRequest
            {
                public int? AdvertiserId { get; set; }
                public string? Name { get; set; }
                public string? Company { get; set; }
                public string? Email { get; set; }
                public string? Phone { get; set; }

                public decimal? Amount { get; set; }
                public string? Method { get; set; }
                public string? PaymentStatus { get; set; }

                public string? Size { get; set; }
                public List<int>? Quarters { get; set; }
                public string? PlacementDescription { get; set; }
            }

            public class PlacementInfo
            {
                public int? SlotId { get; set; }
                public string? Size { get; set; }
                public List<int>? Quarters { get; set; }
                public string? Description { get; set; }
            }

            private static PlacementInfo? TryParsePlacement(string? placementJson)
            {
                if (string.IsNullOrWhiteSpace(placementJson)) return null;
                try
                {
                    return JsonSerializer.Deserialize<PlacementInfo>(placementJson, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
                }
                catch
                {
                    return null;
                }
            }

            private static HashSet<int> NormalizeQuarters(PlacementInfo? placement)
            {
                if (placement == null) return new HashSet<int>();
                var size = placement.Size?.Trim().ToLowerInvariant();
                if (size == "full") return new HashSet<int> { 1, 2, 3, 4 };
                var quarters = placement.Quarters ?? new List<int>();
                return new HashSet<int>(quarters.Where(q => q >= 1 && q <= 4));
            }

            public class UpdateSlotBookingRequest
            {
                public int? TargetSlotId { get; set; }
                public string? PaymentStatus { get; set; }
            }

            public class UpdateSlotPlacementRequest
            {
                public int OrderId { get; set; }
                public string? Size { get; set; }
                public List<int>? Quarters { get; set; }
                public string? Description { get; set; }
            }

        // GET /api/issues?q=...&page=1&pageSize=20&publishedOnly=true
        [HttpGet]
        public async Task<ActionResult<PagedResult<IssueDto>>> Get(
            [FromQuery] string? q,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] bool publishedOnly = false) // פרמטר חדש - רק גליונות שפורסמו
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;
            var offset = (page - 1) * pageSize;

            try 
            {
                // ניסיון להשתמש ב-EF Core במקום Dapper
                var query = _context.Issues.AsNoTracking()  // משפר ביצועים
                    .Where(i => string.IsNullOrEmpty(q) || EF.Functions.ILike(i.Title, $"%{q}%"));
                
                // אם publishedOnly=true, נסנן רק גליונות שפורסמו
                // טיוטות מזוהות ע"י: pending-upload-, /uploads/, draft:, /api/issues/draft-file/
                // גיליון פורסם = URL שמכיל amazonaws.com (לא טיוטה)
                if (publishedOnly)
                {
                    query = query.Where(i => 
                        i.PdfUrl != null 
                        // 🔧 שלילת כל סוגי הטיוטות
                        && !i.PdfUrl.StartsWith("pending-upload-")
                        && !i.PdfUrl.StartsWith("/uploads/")
                        && !i.PdfUrl.StartsWith("/api/issues/draft-file/")
                        && !i.PdfUrl.StartsWith("draft:") // פורמט חדש של טיוטות ב-S3
                        // 🔧 וידוא שזה ב-S3 (URL תקין של amazonaws)
                        && (i.PdfUrl.Contains("s3.eu-north-1.amazonaws.com") 
                            || i.PdfUrl.Contains("s3.amazonaws.com")
                            || i.PdfUrl.Contains("amazonaws.com")
                            || (i.PdfUrl.StartsWith("https://") && (i.PdfUrl.Contains("amazonaws.com") || i.PdfUrl.Contains(".s3.")))));
                }
                
                query = query.OrderByDescending(i => i.IssueDate)
                    .ThenByDescending(i => i.IssueId);

                var total = await query.CountAsync();
                var items = await query
                    .Skip(offset)
                    .Take(pageSize)
                    .Select(i => new IssueDto
                    {
                        Issue_id = i.IssueId,
                        Title = i.Title,
                        Issue_date = i.IssueDate,
                        File_url = i.FileUrl,
                        Pdf_url = i.PdfUrl
                    })
                    .ToListAsync();

                // יצירת pre-signed URLs עבור PDFs
                // חשוב: רק עבור קבצים שפורסמו (ב-S3), לא עבור טיוטות
                Console.WriteLine($"📋 Processing {items.Count} issues for pre-signed URLs");
                foreach (var item in items)
                {
                    try
                    {
                        if (!string.IsNullOrEmpty(item.Pdf_url))
                        {
                            // אם זה טיוטה (pending-upload או draft-file), לא נעבד את ה-URL
                            // הטיוטות נגישות דרך endpoint נפרד
                            if (!item.Pdf_url.StartsWith("pending-upload-") && 
                                !item.Pdf_url.StartsWith("/uploads/") &&
                                !item.Pdf_url.StartsWith("/api/issues/draft-file/"))
                            {
                                var originalUrl = item.Pdf_url;
                                item.Pdf_url = GetFileUrl(item.Pdf_url);
                                if (string.IsNullOrEmpty(item.Pdf_url))
                                {
                                    Console.WriteLine($"⚠️ GetFileUrl returned empty for issue {item.Issue_id}, keeping original");
                                    item.Pdf_url = originalUrl; // נשמור את ה-URL המקורי אם GetFileUrl נכשל
                                }
                            }
                            // אם זה טיוטה, נשאיר את ה-URL כמו שהוא (הגישה דרך endpoint נפרד)
                        }
                        if (!string.IsNullOrEmpty(item.File_url))
                        {
                            if (!item.File_url.StartsWith("pending-upload-") && 
                                !item.File_url.StartsWith("/uploads/") &&
                                !item.File_url.StartsWith("/api/issues/draft-file/"))
                            {
                                var originalUrl = item.File_url;
                                item.File_url = GetFileUrl(item.File_url);
                                if (string.IsNullOrEmpty(item.File_url))
                                {
                                    Console.WriteLine($"⚠️ GetFileUrl returned empty for issue {item.Issue_id}, keeping original");
                                    item.File_url = originalUrl; // נשמור את ה-URL המקורי אם GetFileUrl נכשל
                                }
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"❌ Error processing URLs for issue {item.Issue_id}: {ex.Message}");
                        // נמשיך עם ה-URLs המקוריים במקרה של שגיאה
                    }
                }

                Console.WriteLine($"✅ Returning {items.Count} issues (total: {total})");
                return Ok(new PagedResult<IssueDto>(total, page, pageSize, items));
            }
            catch (Exception ex)
            {
                // לוג מפורט יותר של השגיאה
                var errorMessage = $"❌ שגיאה בשליפת גיליונות: {ex.Message}";
                if (ex.InnerException != null)
                {
                    errorMessage += $"\nInner Exception: {ex.InnerException.Message}";
                }
                Console.WriteLine(errorMessage);
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");

                return StatusCode(500, new { error = "שגיאה בשליפת נתונים מבסיס הנתונים", details = ex.Message });
            }
        }

        // GET /api/issues/123
        [HttpGet("{id}")]
        public async Task<ActionResult<Issue>> GetIssue(int id)
        {
            try
            {
                // טעינה מפורשת של ה-Summary מהמסד נתונים
                // שימוש ב-FirstOrDefault במקום FindAsync כדי לוודא שה-Summary נטען
                var issue = await _context.Issues
                    .Where(i => i.IssueId == id)
                    .Select(i => new Issue
                    {
                        IssueId = i.IssueId,
                        Title = i.Title,
                        IssueDate = i.IssueDate,
                        FileUrl = i.FileUrl,
                        PdfUrl = i.PdfUrl,
                        Summary = i.Summary // נוודא שה-Summary נטען במפורש
                    })
                    .FirstOrDefaultAsync();

                if (issue == null)
                {
                    Console.WriteLine($"❌ גיליון לא נמצא: ID {id}");
                    return NotFound();
                }
                
                Console.WriteLine($"🔍 GetIssue - Summary is {(string.IsNullOrEmpty(issue.Summary) ? "NULL/EMPTY" : $"PRESENT ({issue.Summary.Length} chars)")}");
                Console.WriteLine($"🔍 GetIssue - Summary value: {(issue.Summary ?? "NULL")}");

                // יצירת pre-signed URLs עבור PDFs
                // חשוב: רק עבור קבצים שפורסמו (ב-S3), לא עבור טיוטות
                // טיוטות נגישות דרך endpoint נפרד מהשרת המקומי
                if (!string.IsNullOrEmpty(issue.PdfUrl))
                {
                    // אם זה טיוטה (pending-upload או draft-file), לא נעבד את ה-URL
                    // הטיוטות נגישות דרך endpoint נפרד מהשרת המקומי
                    if (!issue.PdfUrl.StartsWith("pending-upload-") && 
                        !issue.PdfUrl.StartsWith("/uploads/") &&
                        !issue.PdfUrl.StartsWith("/api/issues/draft-file/"))
                {
                    issue.PdfUrl = GetFileUrl(issue.PdfUrl);
                    }
                    else
                    {
                        // אם זה טיוטה, נמיר ל-URL מלא לשרת המקומי
                        if (issue.PdfUrl.StartsWith("pending-upload-"))
                        {
                            var tempFileName = issue.PdfUrl.Replace("pending-upload-", "");
                            // שימוש ב-API URL, לא Frontend URL
                            var apiBaseUrl = _cfg["ApiUrl"] ?? _cfg["FrontendUrl"]?.Replace(":5173", ":5055") ?? "http://localhost:5055";
                            issue.PdfUrl = $"{apiBaseUrl}/api/issues/draft-file/{tempFileName}";
                        }
                        else if (issue.PdfUrl.StartsWith("/api/issues/draft-file/"))
                        {
                            // אם זה URL יחסי, נמיר אותו ל-URL מלא
                            var apiBaseUrl = _cfg["ApiUrl"] ?? _cfg["FrontendUrl"]?.Replace(":5173", ":5055") ?? "http://localhost:5055";
                            issue.PdfUrl = $"{apiBaseUrl}{issue.PdfUrl}";
                        }
                        else if (issue.PdfUrl.StartsWith("/uploads/"))
                        {
                            // אם זה URL יחסי, נמיר אותו ל-URL מלא
                            var apiBaseUrl = _cfg["ApiUrl"] ?? _cfg["FrontendUrl"]?.Replace(":5173", ":5055") ?? "http://localhost:5055";
                            issue.PdfUrl = $"{apiBaseUrl}{issue.PdfUrl}";
                        }
                    }
                }
                if (!string.IsNullOrEmpty(issue.FileUrl))
                {
                    // אותו דבר עבור FileUrl
                    if (!issue.FileUrl.StartsWith("pending-upload-") && 
                        !issue.FileUrl.StartsWith("/uploads/") &&
                        !issue.FileUrl.StartsWith("/api/issues/draft-file/"))
                {
                    issue.FileUrl = GetFileUrl(issue.FileUrl);
                    }
                    else
                    {
                        // אם זה טיוטה, נמיר ל-URL מלא לשרת המקומי
                        if (issue.FileUrl.StartsWith("pending-upload-"))
                        {
                            var tempFileName = issue.FileUrl.Replace("pending-upload-", "");
                            // שימוש ב-API URL, לא Frontend URL
                            var apiBaseUrl = _cfg["ApiUrl"] ?? _cfg["FrontendUrl"]?.Replace(":5173", ":5055") ?? "http://localhost:5055";
                            issue.FileUrl = $"{apiBaseUrl}/api/issues/draft-file/{tempFileName}";
                        }
                        else if (issue.FileUrl.StartsWith("/api/issues/draft-file/"))
                        {
                            // אם זה URL יחסי, נמיר אותו ל-URL מלא
                            var apiBaseUrl = _cfg["ApiUrl"] ?? _cfg["FrontendUrl"]?.Replace(":5173", ":5055") ?? "http://localhost:5055";
                            issue.FileUrl = $"{apiBaseUrl}{issue.FileUrl}";
                        }
                        else if (issue.FileUrl.StartsWith("/uploads/"))
                        {
                            // אם זה URL יחסי, נמיר אותו ל-URL מלא
                            var apiBaseUrl = _cfg["ApiUrl"] ?? _cfg["FrontendUrl"]?.Replace(":5173", ":5055") ?? "http://localhost:5055";
                            issue.FileUrl = $"{apiBaseUrl}{issue.FileUrl}";
                        }
                    }
                }

                Console.WriteLine($"✅ גיליון נמצא: {issue.Title}, PDF URL: {issue.PdfUrl}");
                Console.WriteLine($"📄 Summary length: {issue.Summary?.Length ?? 0}");
                Console.WriteLine($"📄 Summary content: {(string.IsNullOrEmpty(issue.Summary) ? "null/empty" : issue.Summary.Substring(0, Math.Min(100, issue.Summary.Length)))}");
                
                // בדיקה נוספת - נוודא שה-Summary נטען נכון מהמסד נתונים
                if (!string.IsNullOrEmpty(issue.Summary))
                {
                    try
                    {
                        var testMetadata = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(issue.Summary);
                        if (testMetadata != null && testMetadata.ContainsKey("links"))
                        {
                            var linksCount = testMetadata["links"] is System.Text.Json.JsonElement jsonElement && jsonElement.ValueKind == System.Text.Json.JsonValueKind.Array
                                ? jsonElement.GetArrayLength()
                                : 0;
                            Console.WriteLine($"🔗 GetIssue - Found {linksCount} links in Summary");
                        }
                        else
                        {
                            Console.WriteLine($"⚠️ GetIssue - No 'links' key found in metadata");
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"❌ GetIssue - Error parsing Summary: {ex.Message}");
                    }
                }
                
                return issue;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ שגיאה בשליפת גיליון: {ex.Message}");
                return StatusCode(500, "שגיאה פנימית בשרת");
            }
        }

        // POST /api/issues
        [HttpPost]
        public async Task<ActionResult<Issue>> CreateIssue(Issue issue)
        {
            _context.Issues.Add(issue);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetIssue), new { id = issue.IssueId }, issue);
        }

        // PUT /api/issues/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateIssue(int id, Issue issue)
        {
            if (id != issue.IssueId)
                return BadRequest();

            var existing = await _context.Issues.FindAsync(id);
            if (existing == null)
                return NotFound();

            existing.Title = issue.Title;
            existing.IssueDate = issue.IssueDate;
            existing.FileUrl = issue.FileUrl;
            existing.PdfUrl = issue.PdfUrl;
            existing.Summary = issue.Summary;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // POST /api/issues/{id}/fix-pdf-url - תיקון URL של PDF במסד הנתונים
        // Endpoint זמני לתיקון בעיות encoding או שמות קבצים
        [HttpPost("{id}/fix-pdf-url")]
        public async Task<IActionResult> FixPdfUrl(int id, [FromBody] FixPdfUrlRequest request)
        {
            try
            {
                var issue = await _context.Issues.FindAsync(id);
                if (issue == null)
                {
                    return NotFound("גיליון לא נמצא");
                }

                var oldUrl = issue.PdfUrl;
                issue.PdfUrl = request.NewPdfUrl;
                await _context.SaveChangesAsync();

                Console.WriteLine($"✅ Fixed PDF URL for issue {id}:");
                Console.WriteLine($"   Old: {oldUrl}");
                Console.WriteLine($"   New: {request.NewPdfUrl}");

                return Ok(new { message = "URL תוקן בהצלחה", oldUrl, newUrl = request.NewPdfUrl });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error fixing PDF URL: {ex.Message}");
                return StatusCode(500, "שגיאה בתיקון URL");
            }
        }

        public class FixPdfUrlRequest
        {
            public string NewPdfUrl { get; set; } = string.Empty;
        }

        // POST /api/issues/upload-pdf - העלאת PDF (ישירות ל-S3 כטיוטה)
        [Authorize]
        [HttpPost("upload-pdf")]
        public async Task<IActionResult> UploadPdf(IFormFile file, [FromForm] string? title = null, [FromForm] string? issueNumber = null, [FromForm] DateTime? issueDate = null)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest("קובץ לא הועלה");
                }

                // בדיקת סוג קובץ
                if (file.ContentType != "application/pdf")
                {
                    return BadRequest("רק קבצי PDF נתמכים");
                }

                // בדיקה שהקובץ הוא PDF תקין (בודק את ה-magic bytes)
                using var memoryStream = new MemoryStream();
                await file.CopyToAsync(memoryStream);
                var fileBytes = memoryStream.ToArray();
                
                if (fileBytes.Length < 4 || 
                    fileBytes[0] != 0x25 || // %
                    fileBytes[1] != 0x50 || // P
                    fileBytes[2] != 0x44 || // D
                    fileBytes[3] != 0x46)   // F
                {
                    Console.WriteLine($"❌ הקובץ שהועלה לא נראה כמו PDF תקין");
                    return BadRequest("הקובץ שהועלה אינו בפורמט PDF תקין");
                }

                // העלאה ישירות ל-S3 לתיקיית drafts (טיוטות)
                var bucketName = _cfg["S3:Bucket"] ?? "hasdera-issues";
                var draftPrefix = "drafts/"; // תיקיית טיוטות ב-S3
                var draftFileName = $"draft-{Guid.NewGuid()}.pdf";
                var s3Key = $"{draftPrefix}{draftFileName}";

                Console.WriteLine($"📤 Uploading draft PDF to S3: {s3Key}");

                memoryStream.Position = 0; // חזרה לתחילת הסטרים
                var putRequest = new PutObjectRequest
                {
                    BucketName = bucketName,
                    Key = s3Key,
                    InputStream = memoryStream,
                    ContentType = "application/pdf",
                    ServerSideEncryptionMethod = ServerSideEncryptionMethod.AES256
                };

                await _s3.PutObjectAsync(putRequest);

                // יצירת URL לקובץ הטיוטה ב-S3
                var draftS3Url = $"https://{bucketName}.s3.eu-north-1.amazonaws.com/{s3Key}";
                
                Console.WriteLine($"✅ Draft PDF uploaded to S3: {draftS3Url}");

                // יצירת Issue במסד הנתונים עם סטטוס draft
                // נשמור את ה-S3 key במקום URL מלא כדי לדעת שזה draft
                var issue = new Issue
                {
                    Title = title ?? $"גיליון {DateTime.UtcNow:yyyy-MM-dd}",
                    IssueDate = issueDate ?? DateTime.UtcNow,
                    PdfUrl = $"draft:{s3Key}", // מסמן שזו טיוטה ב-S3 עם המפתח
                    FileUrl = draftS3Url // URL לצפייה
                };

                try
                {
                _context.Issues.Add(issue);
                    
                    // נשמור את השינויים - ה-retry mechanism יטפל בשגיאות transient
                await _context.SaveChangesAsync();
                    
                    // אחרי השמירה, ה-IssueId צריך להיות מוגדר
                    if (issue.IssueId == 0)
                    {
                        // אם ה-ID עדיין 0, ננסה לטעון מחדש מה-DB
                        await _context.Entry(issue).ReloadAsync();
                    }
                    
                    Console.WriteLine($"✅ Issue created successfully with ID: {issue.IssueId}");

                return Ok(new
                {
                    issueId = issue.IssueId,
                    title = issue.Title,
                    pdfUrl = GetFileUrl(issue.PdfUrl), // URL לצפייה בטיוטה (חתום)
                    issueDate = issue.IssueDate,
                    isDraft = true // סימון שזה טיוטה
                });
                }
                catch (DbUpdateException dbEx)
                {
                    Console.WriteLine($"❌ Database error: {dbEx.Message}");
                    if (dbEx.InnerException != null)
                    {
                        Console.WriteLine($"Inner exception: {dbEx.InnerException.Message}");
                        Console.WriteLine($"Inner exception type: {dbEx.InnerException.GetType().Name}");
                        
                        // אם זה transient exception (EndOfStream), ה-retry mechanism של EF Core אמור לטפל בזה
                        // אבל אם זה נכשל גם אחרי retries, נחזיר שגיאה
                        var isTransient = dbEx.InnerException is NpgsqlException npgsqlEx && 
                                         (npgsqlEx.Message.Contains("stream") || 
                                          npgsqlEx.Message.Contains("EndOfStream") ||
                                          npgsqlEx.IsTransient);
                        
                        if (isTransient)
                        {
                            Console.WriteLine("⚠️ Transient exception detected - EF Core retry mechanism should handle this");
                        }
                    }
                    return StatusCode(500, new { error = "שגיאה בשמירת הגיליון במסד הנתונים", details = dbEx.InnerException?.Message ?? dbEx.Message });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "שגיאה בהעלאת הקובץ", details = ex.Message });
            }
        }

        // PUT /api/issues/{id}/update - עדכון גיליון
        [Authorize]
        [HttpPut("{id}/update")]
        public async Task<IActionResult> UpdateIssueWithMetadata(int id, [FromBody] UpdateIssueRequest request)
        {
            Console.WriteLine($"🚨🚨🚨 UpdateIssueWithMetadata ENTRY POINT - id: {id}");
            try
            {
                // לוגים לבדיקה
                Console.WriteLine($"📝 UpdateIssueWithMetadata called for issue {id}");
                
                if (request == null)
                {
                    Console.WriteLine($"❌ Request is null");
                    return BadRequest("Request body is required");
                }
                
                Console.WriteLine($"📝 Request Title: {request.Title}");
                Console.WriteLine($"📝 Request Summary: {request.Summary?.Substring(0, Math.Min(200, request.Summary?.Length ?? 0)) ?? "null"}");
                Console.WriteLine($"📝 Request Links count: {request.Links?.Count ?? 0}");
                Console.WriteLine($"📝 Request Animations count: {request.Animations?.Count ?? 0}");
                
                var issue = await _context.Issues.FindAsync(id);
                if (issue == null)
                {
                    Console.WriteLine($"❌ Issue {id} not found");
                    return NotFound();
                }

                // עדכון פרטי הגיליון - תמיכה גם ב-lowercase וגם ב-capital
                var title = request.GetTitle() ?? string.Empty;
                if (!string.IsNullOrEmpty(title))
                {
                    issue.Title = title;
                }
                
                var issueDate = request.GetIssueDate();
                if (issueDate.HasValue)
                {
                    issue.IssueDate = issueDate.Value;
                }
                
                // שמירת קישורים ואנימציות ב-Summary כ-JSON
                var metadata = new Dictionary<string, object>();
                
                // אם יש Summary קיים, נטען אותו
                if (!string.IsNullOrEmpty(issue.Summary))
                {
                    try
                    {
                        var existingMetadata = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(issue.Summary);
                        if (existingMetadata != null)
                        {
                            metadata = existingMetadata;
                        }
                    }
                    catch
                    {
                        // אם יש בעיה בפענוח, נתחיל מחדש
                    }
                }
                
                // עדכון קישורים אם נשלחו - תמיכה גם ב-lowercase וגם ב-capital
                // חשוב: נעדכן גם כשהמערך ריק כדי למחוק קישורים קיימים
                var links = request.GetLinks();
                Console.WriteLine($"📝 UpdateIssueWithMetadata - Links received: {(links != null ? links.Count : 0)}");
                if (links != null)
                {
                    // המרה ל-array של dictionaries בפורמט הנכון
                    var linksArray = links.Select(link => new Dictionary<string, object>
                    {
                        ["id"] = link.GetId(),
                        ["page"] = link.GetPage(),
                        ["x"] = link.GetX(),
                        ["y"] = link.GetY(),
                        ["width"] = link.GetWidth(),
                        ["height"] = link.GetHeight(),
                        ["url"] = link.GetUrl(),
                        ["icon"] = link.GetIcon() ?? "Link",
                        ["email"] = link.GetEmail() ?? string.Empty
                    }).ToList();
                    metadata["links"] = linksArray;
                    Console.WriteLine($"✅ Saving {linksArray.Count} links to metadata");
                    foreach (var link in linksArray)
                    {
                        Console.WriteLine($"  🔗 Link: id={link["id"]}, page={link["page"]}, url={link["url"]}");
                    }
                }
                else
                {
                    Console.WriteLine($"⚠️ Links is null - not updating links");
                }
                
                // עדכון אנימציות אם נשלחו
                var animations = request.GetAnimations();
                if (animations != null)
                {
                    metadata["animations"] = animations;
                }
                
                // עדכון Summary אם נשלח ישירות
                if (!string.IsNullOrEmpty(request.Summary))
                {
                    issue.Summary = request.Summary;
                    // סימון מפורש של ה-Summary כ-modified כדי לכפות עדכון במסד הנתונים
                    _context.Entry(issue).Property(x => x.Summary).IsModified = true;
                    Console.WriteLine($"💾 Saving Summary from request: {issue.Summary?.Substring(0, Math.Min(100, issue.Summary?.Length ?? 0))}");
                }
                else if (links != null)
                {
                    // אם links נשלח (גם אם ריק), תמיד נעדכן את ה-Summary
                    // זה מבטיח שמירה גם כשמערך הקישורים ריק (למחיקת קישורים קיימים)
                    issue.Summary = System.Text.Json.JsonSerializer.Serialize(metadata);
                    // סימון מפורש של ה-Summary כ-modified כדי לכפות עדכון במסד הנתונים
                    _context.Entry(issue).Property(x => x.Summary).IsModified = true;
                    Console.WriteLine($"💾 Saving Summary with links (count: {links.Count}): {issue.Summary?.Substring(0, Math.Min(200, issue.Summary?.Length ?? 0))}");
                }
                else if (animations != null || metadata.Count > 0)
                {
                    // שמירת metadata כ-JSON אם יש אנימציות או metadata אחר
                    issue.Summary = System.Text.Json.JsonSerializer.Serialize(metadata);
                    // סימון מפורש של ה-Summary כ-modified כדי לכפות עדכון במסד הנתונים
                    _context.Entry(issue).Property(x => x.Summary).IsModified = true;
                    Console.WriteLine($"💾 Saving Summary with metadata: {issue.Summary?.Substring(0, Math.Min(200, issue.Summary?.Length ?? 0))}");
                }
                else
                {
                    Console.WriteLine($"⚠️ No links, animations, or metadata to save - Summary will remain: {(string.IsNullOrEmpty(issue.Summary) ? "NULL" : "EXISTING")}");
                }

                // חשוב! EF Core לפעמים לא מזהה שינויים ב-nullable strings
                // סימון מפורש שהשדה השתנה כדי להבטיח שמירה לדאטאבייס
                _context.Entry(issue).Property(x => x.Summary).IsModified = true;

                // בדיקה לפני שמירה - נוודא שה-Summary מסומן כ-modified
                var summaryEntry = _context.Entry(issue).Property(x => x.Summary);
                Console.WriteLine($"🔍 Summary IsModified before SaveChanges: {summaryEntry.IsModified}");
                Console.WriteLine($"🔍 Summary CurrentValue length: {(summaryEntry.CurrentValue as string)?.Length ?? 0}");
                
                await _context.SaveChangesAsync();
                
                Console.WriteLine($"✅ Issue {id} updated successfully");
                Console.WriteLine($"✅ Summary length after save (before reload): {issue.Summary?.Length ?? 0}");
                Console.WriteLine($"✅ Summary content after save (before reload): {(string.IsNullOrEmpty(issue.Summary) ? "null/empty" : issue.Summary.Substring(0, Math.Min(200, issue.Summary.Length)))}");
                
                // טעינה מחדש מהמסד נתונים כדי לוודא שה-Summary נשמר
                await _context.Entry(issue).ReloadAsync();
                
                Console.WriteLine($"✅ Summary length after reload: {issue.Summary?.Length ?? 0}");
                Console.WriteLine($"✅ Summary content after reload: {(string.IsNullOrEmpty(issue.Summary) ? "null/empty" : issue.Summary.Substring(0, Math.Min(200, issue.Summary.Length)))}");
                
                // בדיקה נוספת - נטען ישירות מהמסד נתונים עם Select מפורש (כמו ב-GetIssue)
                var savedIssue = await _context.Issues
                    .Where(i => i.IssueId == id)
                    .Select(i => new { i.IssueId, i.Summary })
                    .FirstOrDefaultAsync();
                
                if (savedIssue != null)
                {
                    Console.WriteLine($"🔍 Direct DB check - Summary length: {savedIssue.Summary?.Length ?? 0}");
                    Console.WriteLine($"🔍 Direct DB check - Summary value: {(savedIssue.Summary ?? "NULL")}");
                    if (!string.IsNullOrEmpty(savedIssue.Summary))
                    {
                        try
                        {
                            var testMetadata = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(savedIssue.Summary);
                            if (testMetadata != null && testMetadata.ContainsKey("links"))
                            {
                                var linksCount = testMetadata["links"] is System.Text.Json.JsonElement jsonElement && jsonElement.ValueKind == System.Text.Json.JsonValueKind.Array
                                    ? jsonElement.GetArrayLength()
                                    : 0;
                                Console.WriteLine($"🔗 Direct DB check - Found {linksCount} links in Summary");
                            }
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"❌ Direct DB check - Error parsing Summary: {ex.Message}");
                        }
                    }
                }
                else
                {
                    Console.WriteLine($"❌ Direct DB check - Issue not found after save!");
                }

                return Ok(new
                {
                    issueId = issue.IssueId,
                    title = issue.Title,
                    pdfUrl = issue.PdfUrl
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error updating issue {id}: {ex.Message}");
                Console.WriteLine($"❌ Stack trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"❌ Inner exception: {ex.InnerException.Message}");
                }
                return StatusCode(500, new { error = "שגיאה בעדכון הגיליון", details = ex.Message });
            }
        }

        // PUT /api/issues/{id}/publish - פרסום גיליון
        [Authorize]
        [HttpPut("{id}/publish")]
        public async Task<IActionResult> PublishIssue(int id)
        {
            try
            {
                var issue = await _context.Issues.FindAsync(id);
                if (issue == null)
                {
                    return NotFound();
                }

                var bucketName = _cfg["S3:Bucket"] ?? "hasdera-issues";
                
                // טיפול בטיוטות מ-S3 (פורמט חדש: "draft:drafts/draft-xxx.pdf")
                if (issue.PdfUrl != null && issue.PdfUrl.StartsWith("draft:"))
                {
                    var draftS3Key = issue.PdfUrl.Substring(6); // מסיר את "draft:"
                    var publishPrefix = "issues/";
                    var newFileName = $"{issue.IssueId}_{Guid.NewGuid()}.pdf";
                    var newS3Key = $"{publishPrefix}{newFileName}";

                    Console.WriteLine($"📤 Moving draft from {draftS3Key} to {newS3Key}");

                    // העתקת הקובץ מתיקיית drafts לתיקיית issues
                    var copyRequest = new CopyObjectRequest
                    {
                        SourceBucket = bucketName,
                        SourceKey = draftS3Key,
                        DestinationBucket = bucketName,
                        DestinationKey = newS3Key,
                        ServerSideEncryptionMethod = ServerSideEncryptionMethod.AES256
                    };

                    await _s3.CopyObjectAsync(copyRequest);

                    // מחיקת הטיוטה הישנה
                    await _s3.DeleteObjectAsync(bucketName, draftS3Key);

                    // עדכון ה-URL ל-S3 הסופי
                    var generatePreSignedUrls = _cfg.GetValue<bool>("GeneratePreSignedUrls", true);
                    if (generatePreSignedUrls)
                    {
                        var request = new GetPreSignedUrlRequest
                        {
                            BucketName = bucketName,
                            Key = newS3Key,
                            Verb = HttpVerb.GET,
                            Expires = DateTime.UtcNow.AddDays(7)
                        };
                        issue.PdfUrl = _s3.GetPreSignedURL(request);
                    }
                    else
                    {
                        issue.PdfUrl = $"https://{bucketName}.s3.eu-north-1.amazonaws.com/{newS3Key}";
                    }
                    issue.FileUrl = issue.PdfUrl;

                    Console.WriteLine($"✅ Draft moved and published: {issue.PdfUrl}");
                }
                // טיפול בטיוטות ישנות מהשרת (פורמט ישן: "pending-upload-xxx.pdf")
                else if (issue.PdfUrl != null && issue.PdfUrl.StartsWith("pending-upload-"))
                {
                    var prefix = "issues/";
                    var fileName = $"{issue.IssueId}_{Guid.NewGuid()}.pdf";
                    var s3Key = $"{prefix}{fileName}";

                    // נתיב לקובץ הזמני בשרת
                    var tempFileName = issue.PdfUrl;
                    var localFilePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "issues", tempFileName);
                    
                    Console.WriteLine($"📁 Looking for file at: {localFilePath}");
                    
                    if (System.IO.File.Exists(localFilePath))
                    {
                        using var fileStream = new FileStream(localFilePath, FileMode.Open, FileAccess.Read);
                        var putRequest = new PutObjectRequest
                        {
                            BucketName = bucketName,
                            Key = s3Key,
                            InputStream = fileStream,
                            ContentType = "application/pdf",
                            ServerSideEncryptionMethod = ServerSideEncryptionMethod.AES256
                        };

                        await _s3.PutObjectAsync(putRequest);

                        // עדכון ה-URL ל-S3
                        var generatePreSignedUrls = _cfg.GetValue<bool>("GeneratePreSignedUrls", true);
                        if (generatePreSignedUrls)
                        {
                            var request = new GetPreSignedUrlRequest
                            {
                                BucketName = bucketName,
                                Key = s3Key,
                                Verb = HttpVerb.GET,
                                Expires = DateTime.UtcNow.AddDays(7)
                            };
                            issue.PdfUrl = _s3.GetPreSignedURL(request);
                        }
                        else
                        {
                            issue.PdfUrl = $"https://{bucketName}.s3.eu-north-1.amazonaws.com/{s3Key}";
                        }
                        issue.FileUrl = issue.PdfUrl;

                        // מחיקת הקובץ הזמני מהשרת
                        System.IO.File.Delete(localFilePath);
                    }
                    else
                    {
                        // הקובץ הזמני לא נמצא - לא ניתן לפרסם!
                        Console.WriteLine($"❌ Temporary file not found: {localFilePath}");
                        return BadRequest(new { 
                            error = "לא ניתן לפרסם - קובץ ה-PDF לא נמצא בשרת", 
                            details = "הקובץ הזמני פג תוקף או נמחק. יש להעלות את ה-PDF מחדש.",
                            suggestion = "נסה לערוך את הגיליון ולהעלות PDF חדש"
                        });
                    }
                }

                // עדכון תאריך פרסום להיום
                issue.IssueDate = DateTime.UtcNow;

                // וידוא שה-entity tracked ושהשינויים יישמרו
                _context.Entry(issue).State = EntityState.Modified;
                Console.WriteLine($"💾 Saving issue {issue.IssueId} with PdfUrl: {issue.PdfUrl?.Substring(0, Math.Min(50, issue.PdfUrl?.Length ?? 0))}...");

                await _context.SaveChangesAsync();
                Console.WriteLine($"✅ Issue {issue.IssueId} saved successfully");

                // ✅ יצירת גיליון ריק חדש (טיוטה) לשבוע הבא לצורך מכירת מקומות פרסום
                // מונע כפילויות לפי תאריך (טווח של יום שלם)
                try
                {
                    var nextIssueDate = issue.IssueDate.Date.AddDays(7);
                    var start = nextIssueDate;
                    var end = nextIssueDate.AddDays(1);

                    var existsForDate = await _context.Issues.AsNoTracking()
                        .AnyAsync(i => i.IssueDate >= start && i.IssueDate < end);

                    if (!existsForDate)
                    {
                        var nextIssue = new Issue
                        {
                            Title = $"גיליון חדש (מקומות פרסום) - {nextIssueDate:yyyy-MM-dd}",
                            IssueDate = nextIssueDate,
                            PdfUrl = null,
                            FileUrl = null,
                            Summary = null
                        };

                        _context.Issues.Add(nextIssue);
                        await _context.SaveChangesAsync();
                        Console.WriteLine($"✅ Created next empty issue for ad slots: {nextIssue.IssueId} ({nextIssue.IssueDate:yyyy-MM-dd})");
                    }
                    else
                    {
                        Console.WriteLine($"ℹ️ Next issue placeholder already exists for date: {nextIssueDate:yyyy-MM-dd}");
                    }
                }
                catch (Exception exCreateNext)
                {
                    // לא נכשיל פרסום בגלל כשל ביצירת גיליון הבא
                    Console.WriteLine($"⚠️ Failed creating next empty issue: {exCreateNext.Message}");
                }

                // יצירת גיליון ריק חדש לשבוע הבא (אם עדיין לא קיים)
                var nextWeekDate = DateTime.UtcNow.AddDays(7);
                var existingNextIssue = await _context.Issues
                    .Where(i => i.IssueDate >= nextWeekDate.AddDays(-3) && 
                               i.IssueDate <= nextWeekDate.AddDays(3) &&
                               (i.PdfUrl == null || i.PdfUrl.StartsWith("pending-upload-")))
                    .FirstOrDefaultAsync();

                if (existingNextIssue == null)
                {
                    // יצירת גיליון ריק חדש לשבוע הבא
                    var nextIssue = new Issue
                    {
                        Title = $"גיליון {nextWeekDate:yyyy-MM-dd}",
                        IssueDate = nextWeekDate,
                        PdfUrl = null, // גיליון ריק - ללא PDF
                        FileUrl = null
                    };
                    _context.Issues.Add(nextIssue);
                    await _context.SaveChangesAsync();
                    
                    Console.WriteLine($"✅ Created empty issue for next week: IssueId={nextIssue.IssueId}, Date={nextWeekDate:yyyy-MM-dd}");
                }

                // יצירת קישור לפרסום
                var publishUrl = $"{_cfg["FrontendUrl"] ?? "http://localhost:5173"}/viewer?issueId={issue.IssueId}";

                return Ok(new
                {
                    issueId = issue.IssueId,
                    title = issue.Title,
                    published = true,
                    publishUrl = publishUrl,
                    issueDate = issue.IssueDate,
                    pdfUrl = issue.PdfUrl // URL חדש ב-S3
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "שגיאה בפרסום הגיליון", details = ex.Message });
            }
        }

        // DELETE /api/issues/{id} - מחיקת גיליון (גם טיוטות וגם פרסומים)
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteIssue(int id)
        {
            try
            {
                var issue = await _context.Issues.FindAsync(id);
                if (issue == null)
                {
                    return NotFound();
                }

                // בדיקה אם הגיליון פורסם
                var isDraft = issue.PdfUrl == null || 
                             issue.PdfUrl.StartsWith("pending-upload-") || 
                             issue.PdfUrl.StartsWith("/uploads/") ||
                             issue.PdfUrl.StartsWith("/api/issues/draft-file/");

                // מחיקת הקובץ הזמני מהשרת אם קיים
                if (issue.PdfUrl != null && issue.PdfUrl.StartsWith("pending-upload-"))
                {
                    var tempFileName = issue.PdfUrl.Replace("pending-upload-", "");
                    var localFilePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "issues", tempFileName);
                    if (System.IO.File.Exists(localFilePath))
                    {
                        System.IO.File.Delete(localFilePath);
                    }
                }
                else if (issue.PdfUrl != null && issue.PdfUrl.StartsWith("/uploads/"))
                {
                    var localFilePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", issue.PdfUrl.TrimStart('/'));
                    if (System.IO.File.Exists(localFilePath))
                    {
                        System.IO.File.Delete(localFilePath);
                    }
                }
                // אם זה קובץ ב-S3, לא נמחק אותו מ-S3 (נשאיר למחיקה ידנית)

                // מחיקת הגיליון ממסד הנתונים
                _context.Issues.Remove(issue);
                await _context.SaveChangesAsync();

                return Ok(new { message = "הגיליון נמחק בהצלחה" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "שגיאה במחיקת הגיליון", details = ex.Message });
            }
        }

        public class UpdateIssueRequest
        {
            // עם PropertyNameCaseInsensitive = true, System.Text.Json יוכל לקרוא גם Title וגם title
            public string? Title { get; set; }
            public DateTime? IssueDate { get; set; }
            public string? Summary { get; set; }
            public List<LinkDto>? Links { get; set; }
            public List<object>? Animations { get; set; }
            
            // Property getters שיחזירו את הערך הנכון (עכשיו Title יכול להיות גם title)
            public string? GetTitle() => Title;
            public DateTime? GetIssueDate() => IssueDate;
            public string? GetSummary() => Summary;
            public List<LinkDto>? GetLinks() => Links;
            public List<object>? GetAnimations() => Animations;
        }

        public class LinkDto
        {
            // עם PropertyNameCaseInsensitive = true, System.Text.Json יוכל לקרוא גם Id וגם id
            public string Id { get; set; } = string.Empty;
            public int Page { get; set; }
            public double X { get; set; }
            public double Y { get; set; }
            public double Width { get; set; }
            public double Height { get; set; }
            public string Url { get; set; } = string.Empty;
            public string? Icon { get; set; }
            public string? Email { get; set; }
            
            // Property getters
            public string GetId() => Id;
            public int GetPage() => Page;
            public double GetX() => X;
            public double GetY() => Y;
            public double GetWidth() => Width;
            public double GetHeight() => Height;
            public string GetUrl() => Url;
            public string? GetIcon() => Icon;
            public string? GetEmail() => Email;
        }

        // OPTIONS /api/issues/draft-file/{fileName} - CORS preflight
        [HttpOptions("draft-file/{fileName}")]
        public IActionResult GetDraftFileOptions()
        {
            Response.Headers["Access-Control-Allow-Origin"] = "*";
            Response.Headers["Access-Control-Allow-Methods"] = "GET, OPTIONS, HEAD";
            Response.Headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Range";
            Response.Headers["Access-Control-Expose-Headers"] = "Content-Length, Content-Range, Accept-Ranges";
            Response.Headers["Access-Control-Max-Age"] = "86400"; // 24 hours
            return NoContent();
        }

        // GET /api/issues/draft-file/{fileName} - גישה לקבצי טיוטה
        // תמיכה ב-token גם מה-query parameter (עבור FlipBook שלא תומך ב-custom headers)
        [HttpGet("draft-file/{fileName}")]
        public async Task<IActionResult> GetDraftFile(string fileName, [FromQuery] string? token = null)
        {
            try
            {
                // בדיקת אימות - תמיכה גם ב-Authorization header וגם ב-token query parameter
                var authHeader = Request.Headers["Authorization"].FirstOrDefault();
                var authToken = authHeader?.StartsWith("Bearer ") == true 
                    ? authHeader.Substring("Bearer ".Length).Trim() 
                    : null;
                
                // אם אין Authorization header, נבדוק את ה-token מה-query parameter
                if (string.IsNullOrEmpty(authToken) && !string.IsNullOrEmpty(token))
                {
                    authToken = token;
                }
                
                // אם אין token בכלל, נחזיר 401
                if (string.IsNullOrEmpty(authToken))
                {
                    Console.WriteLine("❌ No authorization token provided");
                    return Unauthorized("נדרש אימות");
                }
                
                // כאן אפשר להוסיף בדיקת תקינות ה-token אם צריך
                // כרגע אנחנו סומכים על ה-[Authorize] attribute שהוסר
                
                // ניקוי שם הקובץ מכל תווים מסוכנים
                fileName = Path.GetFileName(fileName);
                
                // אם שם הקובץ לא מתחיל ב-pending-upload-, נוסיף את הקידומת
                // (כי הקבצים נשמרים עם הקידומת pending-upload-)
                if (!fileName.StartsWith("pending-upload-"))
                {
                    fileName = $"pending-upload-{fileName}";
                }
                
                var localFilePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "issues", fileName);
                
                Console.WriteLine($"🔍 מחפש קובץ טיוטה בנתיב: {localFilePath}");
                
                if (!System.IO.File.Exists(localFilePath))
                {
                    Console.WriteLine($"❌ קובץ טיוטה לא נמצא: {localFilePath}");
                    
                    // ננסה לחפש גם בלי הקידומת (אם הקובץ נשמר בלי הקידומת)
                    var fileNameWithoutPrefix = fileName.Replace("pending-upload-", "");
                    var alternativePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "issues", fileNameWithoutPrefix);
                    if (System.IO.File.Exists(alternativePath))
                    {
                        Console.WriteLine($"✅ נמצא קובץ חלופי: {alternativePath}");
                        localFilePath = alternativePath;
                        fileName = fileNameWithoutPrefix;
                    }
                    else
                    {
                        return NotFound("קובץ טיוטה לא נמצא");
                    }
                }

                var fileInfo = new FileInfo(localFilePath);
                Console.WriteLine($"📄 קובץ טיוטה נמצא: {fileName}, גודל: {fileInfo.Length} bytes");
                
                // בדיקה שהקובץ לא ריק
                if (fileInfo.Length == 0)
                {
                    Console.WriteLine($"❌ קובץ טיוטה ריק: {fileName}");
                    return StatusCode(500, "הקובץ ריק או פגום");
                }
                
                // בדיקה בסיסית שזה קובץ PDF (מתחיל ב-%PDF) - נטען רק את ה-bytes הראשונים
                var headerBytes = new byte[Math.Min(20, (int)fileInfo.Length)];
                using (var fileStream = new FileStream(localFilePath, FileMode.Open, FileAccess.Read, FileShare.Read))
                {
                    await fileStream.ReadAsync(headerBytes, 0, headerBytes.Length);
                }
                
                // בדיקה אם זה PDF תקין - נבדוק את ה-header
                bool isValidPdf = headerBytes.Length >= 4 &&
                                 headerBytes[0] == 0x25 && // %
                                 headerBytes[1] == 0x50 && // P
                                 headerBytes[2] == 0x44 && // D
                                 headerBytes[3] == 0x46;   // F
                
                if (!isValidPdf)
                {
                    // נבדוק אם יש BOM או תווים נוספים בהתחלה
                    int startIndex = 0;
                    while (startIndex < Math.Min(10, headerBytes.Length - 4))
                    {
                        if (headerBytes[startIndex] == 0x25 && 
                            headerBytes[startIndex + 1] == 0x50 && 
                            headerBytes[startIndex + 2] == 0x44 && 
                            headerBytes[startIndex + 3] == 0x46)
                        {
                            Console.WriteLine($"⚠️ PDF נמצא עם offset של {startIndex} bytes");
                            isValidPdf = true;
                            break;
                        }
                        startIndex++;
                    }
                    
                    if (!isValidPdf)
                    {
                        Console.WriteLine($"❌ קובץ לא נראה כמו PDF תקין: {fileName}");
                        Console.WriteLine($"ראשית הקובץ (hex): {BitConverter.ToString(headerBytes)}");
                        return StatusCode(500, "הקובץ אינו בפורמט PDF תקין");
                    }
                }
                
                Console.WriteLine($"✅ מחזיר קובץ טיוטה תקין: {fileName}, גודל: {fileInfo.Length} bytes");
                
                // הוספת headers ל-CORS (שימוש ב-Append או indexer כדי למנוע שגיאות)
                Response.Headers["Access-Control-Allow-Origin"] = "*";
                Response.Headers["Access-Control-Allow-Methods"] = "GET, OPTIONS, HEAD";
                Response.Headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Range";
                Response.Headers["Access-Control-Expose-Headers"] = "Content-Length, Content-Range, Accept-Ranges";
                
                // שינוי Cache-Control כדי למנוע שגיאת ERR_CACHE_OPERATION_NOT_SUPPORTED
                Response.Headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
                Response.Headers["Pragma"] = "no-cache";
                Response.Headers["Expires"] = "0";
                
                // הוספת Content-Disposition כדי למנוע בעיות עם תווים מיוחדים בשם הקובץ
                var safeFileName = fileName.Replace("pending-upload-", ""); // הסרת הקידומת מה-Content-Disposition
                Response.Headers["Content-Disposition"] = $"inline; filename=\"{safeFileName}\"";
                
                Console.WriteLine($"📤 Sending PDF file: {fileName}, Size: {fileInfo.Length} bytes, Content-Type: application/pdf");
                
                // שימוש ב-PhysicalFile עם streaming - הוא מטפל אוטומטית ב-Range requests
                // enableRangeProcessing: true מאפשר תמיכה ב-Range requests עבור PDF streaming
                // PhysicalFile יוסיף אוטומטית את Content-Type, Content-Length, Accept-Ranges ו-Content-Range לפי הצורך
                return PhysicalFile(localFilePath, "application/pdf", safeFileName, enableRangeProcessing: true);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ שגיאה בטעינת קובץ טיוטה: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { error = "שגיאה פנימית בשרת", details = ex.Message });
            }
        }

        // טיפול ב-Range requests עבור PDF streaming
        private async Task<IActionResult> HandleRangeRequest(string filePath, string rangeHeader, long fileLength)
        {
            try
            {
                Console.WriteLine($"🔍 Handling range request: {rangeHeader}, file length: {fileLength}");
                
                // פרסור ה-Range header (format: "bytes=start-end")
                var range = rangeHeader.Replace("bytes=", "");
                var ranges = range.Split('-');
                
                long start = 0;
                long end = fileLength - 1;
                
                if (ranges.Length == 2)
                {
                    if (!string.IsNullOrEmpty(ranges[0]))
                    {
                        if (!long.TryParse(ranges[0], out start))
                        {
                            Console.WriteLine($"❌ Invalid start range: {ranges[0]}");
                            Response.Headers["Content-Range"] = $"bytes */{fileLength}";
                            return StatusCode(416, "Range Not Satisfiable");
                        }
                    }
                    if (!string.IsNullOrEmpty(ranges[1]))
                    {
                        if (!long.TryParse(ranges[1], out end))
                        {
                            Console.WriteLine($"❌ Invalid end range: {ranges[1]}");
                            Response.Headers["Content-Range"] = $"bytes */{fileLength}";
                            return StatusCode(416, "Range Not Satisfiable");
                        }
                    }
                }
                else
                {
                    Console.WriteLine($"❌ Invalid range format: {rangeHeader}");
                    Response.Headers["Content-Range"] = $"bytes */{fileLength}";
                    return StatusCode(416, "Range Not Satisfiable");
                }
                
                // וידוא שה-range תקין
                if (start < 0)
                {
                    start = 0;
                }
                if (end >= fileLength)
                {
                    end = fileLength - 1;
                }
                if (start > end)
                {
                    Console.WriteLine($"❌ Invalid range: start ({start}) > end ({end})");
                    Response.Headers["Content-Range"] = $"bytes */{fileLength}";
                    return StatusCode(416, "Range Not Satisfiable");
                }
                
                var contentLength = end - start + 1;
                
                Console.WriteLine($"✅ Parsed range: start={start}, end={end}, contentLength={contentLength}");
                
                // הוספת headers ל-Range response
                Response.Headers["Content-Range"] = $"bytes {start}-{end}/{fileLength}";
                Response.Headers["Content-Length"] = contentLength.ToString();
                Response.Headers["Accept-Ranges"] = "bytes";
                Response.Headers["Content-Type"] = "application/pdf";
                Response.StatusCode = 206; // Partial Content
                
                // קריאת החלק המבוקש מהקובץ
                var buffer = new byte[contentLength];
                using (var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read))
                {
                    fileStream.Seek(start, SeekOrigin.Begin);
                    var bytesRead = await fileStream.ReadAsync(buffer, 0, (int)contentLength);
                    Console.WriteLine($"✅ Read {bytesRead} bytes from file");
                }
                
                Console.WriteLine($"✅ Range request satisfied: bytes {start}-{end}/{fileLength}");
                return File(buffer, "application/pdf", enableRangeProcessing: true);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error handling range request: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, "Error processing range request");
            }
        }

        // GET /api/issues/{id}/pdf - טעינת PDF דרך הבקנד
        [HttpGet("{id}/pdf")]
        public async Task<IActionResult> GetIssuePdf(int id)
        {
            try
            {
                var issue = await _context.Issues.FindAsync(id);

                if (issue == null)
                {
                    return NotFound();
                }

                if (string.IsNullOrEmpty(issue.PdfUrl))
                {
                    return NotFound("PDF לא נמצא");
                }

                // אם זה טיוטה ב-S3 (פורמט חדש: "draft:drafts/draft-xxx.pdf")
                if (issue.PdfUrl.StartsWith("draft:"))
                {
                    var draftS3Key = issue.PdfUrl.Substring(6); // מסיר את "draft:"
                    var bucketName = _cfg["S3:Bucket"] ?? "hasdera-issues";
                    
                    Console.WriteLine($"🔍 טוען טיוטה מ-S3: {draftS3Key}");
                    
                    try
                    {
                        var getRequest = new GetObjectRequest
                        {
                            BucketName = bucketName,
                            Key = draftS3Key
                        };

                        using var response = await _s3.GetObjectAsync(getRequest);
                        using var memoryStream = new MemoryStream();
                        await response.ResponseStream.CopyToAsync(memoryStream);
                        var pdfBytes = memoryStream.ToArray();
                        
                        Console.WriteLine($"✅ טיוטה נטענה מ-S3, גודל: {pdfBytes.Length} bytes");
                        return File(pdfBytes, "application/pdf", $"{issue.Title}.pdf");
                    }
                    catch (AmazonS3Exception s3Ex)
                    {
                        Console.WriteLine($"❌ S3 Error: {s3Ex.Message}");
                        if (s3Ex.StatusCode == HttpStatusCode.NotFound)
                        {
                            return NotFound($"טיוטה לא נמצאה ב-S3: {s3Ex.Message}");
                        }

                        return StatusCode(502, $"שגיאה בגישה ל-S3: {s3Ex.Message}");
                    }
                }

                // אם זה טיוטה ישנה (pending-upload), נטען מהשרת המקומי
                if (issue.PdfUrl.StartsWith("pending-upload-"))
                {
                    // הקובץ נשמר עם הקידומת pending-upload- - לא להסיר אותה!
                    var draftFileName = issue.PdfUrl; // issue.PdfUrl כבר מכיל את שם הקובץ המלא
                    var localFilePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "issues", draftFileName);
                    
                    Console.WriteLine($"🔍 מחפש קובץ טיוטה: {localFilePath}");
                    
                    if (System.IO.File.Exists(localFilePath))
                    {
                        Console.WriteLine($"✅ נמצא קובץ טיוטה: {localFilePath}");
                        var fileBytes = await System.IO.File.ReadAllBytesAsync(localFilePath);
                        return File(fileBytes, "application/pdf", $"{issue.Title}.pdf");
                    }
                    else
                    {
                        // ננסה גם בלי הקידומת למקרה שהקובץ נשמר אחרת
                        var tempFileName = issue.PdfUrl.Replace("pending-upload-", "");
                        var alternativePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "issues", tempFileName);
                        
                        Console.WriteLine($"🔍 מחפש בנתיב חלופי: {alternativePath}");
                        
                        if (System.IO.File.Exists(alternativePath))
                        {
                            Console.WriteLine($"✅ נמצא בנתיב חלופי: {alternativePath}");
                            var fileBytes = await System.IO.File.ReadAllBytesAsync(alternativePath);
                            return File(fileBytes, "application/pdf", $"{issue.Title}.pdf");
                        }
                        
                        Console.WriteLine($"❌ קובץ טיוטה לא נמצא בשום נתיב");
                        return NotFound("קובץ טיוטה לא נמצא בשרת");
                    }
                }

                // אם זה URL יחסי (uploads / draft-file) – לא משתמשים ב-HttpClient עם URI יחסי
                if (issue.PdfUrl.StartsWith("/api/issues/draft-file/"))
                {
                    var fileName = issue.PdfUrl.Replace("/api/issues/draft-file/", "").TrimStart('/');
                    return await GetDraftFile(fileName);
                }

                if (issue.PdfUrl.StartsWith("/uploads/"))
                {
                    var relative = issue.PdfUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
                    var localPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", relative);
                    if (!System.IO.File.Exists(localPath))
                        return NotFound("PDF לא נמצא");

                    var bytes = await System.IO.File.ReadAllBytesAsync(localPath);
                    return File(bytes, "application/pdf", $"{issue.Title}.pdf");
                }

                // אם זה קובץ שפורסם ב-S3 – נטען דרך ה-S3 SDK (כמו טיוטה), עם ניסיון תיקון prefix/key
                if (issue.PdfUrl.Contains("amazonaws.com", StringComparison.OrdinalIgnoreCase))
                {
                    var bucketName = _cfg["S3:Bucket"] ?? "hasdera-issues";
                    var basePrefix = _cfg["S3:BasePrefix"] ?? "";

                    var resolvedKey = await ResolveS3KeyFromUrlAsync(issue.PdfUrl, bucketName, basePrefix);
                    Console.WriteLine($"🔗 Original PdfUrl from DB: {issue.PdfUrl}");
                    Console.WriteLine($"🔑 Resolved S3 Key: {resolvedKey}");

                    try
                    {
                        using var response = await _s3.GetObjectAsync(new GetObjectRequest
                        {
                            BucketName = bucketName,
                            Key = resolvedKey
                        });

                        using var memoryStream = new MemoryStream();
                        await response.ResponseStream.CopyToAsync(memoryStream);
                        var pdfBytes = memoryStream.ToArray();

                        Console.WriteLine($"✅ PDF loaded from S3, size: {pdfBytes.Length} bytes");
                        return File(pdfBytes, "application/pdf", $"{issue.Title}.pdf");
                    }
                    catch (AmazonS3Exception s3Ex)
                    {
                        Console.WriteLine($"❌ S3 Error: {s3Ex.Message}");
                        if (s3Ex.StatusCode == HttpStatusCode.NotFound)
                            return NotFound("PDF לא נמצא ב-S3");

                        return StatusCode(502, $"שגיאה בגישה ל-S3: {s3Ex.Message}");
                    }
                }

                // כל URL אחר (http/https) – fallback ב-HttpClient
                var pdfUrl = GetFileUrl(issue.PdfUrl);
                Console.WriteLine($"🔗 Original PdfUrl from DB: {issue.PdfUrl}");
                Console.WriteLine($"🔗 Generated URL: {pdfUrl}");

                using (var httpClient = new HttpClient())
                {
                    httpClient.Timeout = TimeSpan.FromMinutes(5);

                    try
                    {
                        var response = await httpClient.GetAsync(pdfUrl);
                        Console.WriteLine($"📥 Response Status: {response.StatusCode}");

                        if (!response.IsSuccessStatusCode)
                        {
                            var errorContent = await response.Content.ReadAsStringAsync();
                            Console.WriteLine($"❌ Error Response: {errorContent}");

                            if (response.StatusCode == HttpStatusCode.NotFound)
                                return NotFound("PDF לא נמצא");

                            return StatusCode(502, $"שגיאה בטעינת PDF: {response.StatusCode}");
                        }

                        var pdfBytes = await response.Content.ReadAsByteArrayAsync();
                        return File(pdfBytes, "application/pdf", $"{issue.Title}.pdf");
                    }
                    catch (HttpRequestException httpEx)
                    {
                        Console.WriteLine($"❌ HTTP Error fetching PDF: {httpEx.Message}");
                        return StatusCode(502, $"שגיאה בחיבור: {httpEx.Message}");
                    }
                    catch (TaskCanceledException tcEx)
                    {
                        Console.WriteLine($"❌ Timeout fetching PDF: {tcEx.Message}");
                        return StatusCode(504, "Timeout בטעינת PDF");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ שגיאה בטעינת PDF: {ex.Message}");
                return StatusCode(500, "שגיאה פנימית בשרת");
            }
        }

        private async Task<string> ResolveS3KeyFromUrlAsync(string fileUrl, string bucketName, string basePrefix)
        {
            // Extract key from URL path and try a few common variants (decode + folder swaps + BasePrefix).
            var urlWithoutQuery = fileUrl.Split('?')[0];
            var uri = new Uri(urlWithoutQuery);
            var rawKey = uri.AbsolutePath
                .Replace($"/{bucketName}/", "")
                .TrimStart('/');

            var candidates = new List<string>();
            void AddCandidate(string? candidate)
            {
                if (string.IsNullOrWhiteSpace(candidate)) return;
                candidate = candidate.TrimStart('/');
                if (!candidates.Contains(candidate)) candidates.Add(candidate);
            }

            AddCandidate(rawKey);

            // Decode once/twice (to avoid double-encoding in DB)
            try { AddCandidate(Uri.UnescapeDataString(rawKey)); } catch { }
            try { AddCandidate(Uri.UnescapeDataString(Uri.UnescapeDataString(rawKey))); } catch { }

            // Swap common prefixes
            if (rawKey.StartsWith("issues/", StringComparison.OrdinalIgnoreCase))
                AddCandidate("pdfs/" + rawKey.Substring("issues/".Length));
            if (rawKey.StartsWith("pdfs/", StringComparison.OrdinalIgnoreCase))
                AddCandidate("issues/" + rawKey.Substring("pdfs/".Length));

            // Apply BasePrefix if provided
            if (!string.IsNullOrWhiteSpace(basePrefix))
            {
                basePrefix = basePrefix.TrimStart('/');
                foreach (var existing in candidates.ToArray())
                {
                    var fileNameOnly = existing.Contains('/') ? existing.Substring(existing.LastIndexOf('/') + 1) : existing;
                    AddCandidate(basePrefix.TrimEnd('/') + "/" + fileNameOnly);
                }
            }

            foreach (var key in candidates)
            {
                try
                {
                    await _s3.GetObjectMetadataAsync(new GetObjectMetadataRequest
                    {
                        BucketName = bucketName,
                        Key = key
                    });
                    return key;
                }
                catch (AmazonS3Exception s3Ex) when (s3Ex.StatusCode == HttpStatusCode.NotFound)
                {
                    // try next
                }
                catch
                {
                    // If metadata check fails for other reasons, keep going.
                }
            }

            // fallback to raw
            return rawKey;
        }

        private string GetFileUrl(string? fileUrl)
        {
    if (string.IsNullOrWhiteSpace(fileUrl))
                return fileUrl ?? string.Empty;

            // 0) טיוטה ב-S3 - draft:drafts/xxx.pdf
            if (fileUrl.StartsWith("draft:"))
            {
                try
                {
                    var draftBucketName = _cfg["S3:Bucket"] ?? "hasdera-issues";
                    var key = fileUrl.Substring(6);
                    if (string.IsNullOrWhiteSpace(key))
                        return fileUrl;

                    var expiryMinutes = _cfg.GetValue<int>("PreSignedExpiryMinutes", 60);
                    var request = new GetPreSignedUrlRequest
                    {
                        BucketName = draftBucketName,
                        Key = key,
                        Verb = HttpVerb.GET,
                        Expires = DateTime.UtcNow.AddMinutes(Math.Max(5, expiryMinutes))
                    };
                    return _s3.GetPreSignedURL(request);
                }
                catch
                {
                    return fileUrl;
                }
            }

    // 1) טיוטה - pending-upload-xxxx.pdf
            if (fileUrl.StartsWith("pending-upload-"))
            {
                var tempFileName = fileUrl.Replace("pending-upload-", "");
                return $"/api/issues/draft-file/{tempFileName}";
            }

    // 2) קובץ שמור בשרת
            if (fileUrl.StartsWith("/uploads/"))
                return fileUrl;

            // 2.1) טיוטה דרך endpoint
            if (fileUrl.StartsWith("/api/issues/draft-file/"))
                return fileUrl;

    // 3) קובץ ב-S3 (פורסם)
            var bucketName = _cfg["S3:Bucket"] ?? "hasdera-issues";
            
    // אם לא URL של S3 – מחזירים כמו שהוא
    if (!fileUrl.Contains("amazonaws.com"))
                return fileUrl;

    try
    {
        // חילוץ KEY בצורה פשוטה ובריאה (בלי regex)
        var uri = new Uri(fileUrl.Split('?')[0]);
        var key = uri.AbsolutePath
                     .Replace($"/{bucketName}/", "")
                     .TrimStart('/');

        if (string.IsNullOrWhiteSpace(key))
                    return fileUrl;

        // 🔧 תיקון double encoding - תמיד נעבד decode ל-key לפני יצירת pre-signed URL חדש
        // זה קורה כשהשם כבר מקודד ונשמר במסד הנתונים, ואז כשמחלצים אותו הוא עדיין מקודד
        // ה-S3 SDK יעשה encode אוטומטית, אז אנחנו צריכים לוודא שה-key לא מקודד פעמיים
        string decodedKey = key;
                int decodeAttempts = 0;
        bool hasEncodedChars = key.Contains("%");
        
        // אם יש תווים מקודדים, נעבד decode עד שלא נשאר encoding
        while (hasEncodedChars && decodeAttempts < 5)
        {
            try
            {
                var beforeDecode = decodedKey;
                decodedKey = Uri.UnescapeDataString(decodedKey);
                
                // אם אחרי decode אין שינוי, נעצור
                if (beforeDecode == decodedKey)
                        break;
                    
                    decodeAttempts++;
                hasEncodedChars = decodedKey.Contains("%");
            }
            catch
            {
                // אם יש שגיאה ב-decode, נשתמש ב-key המקורי
                break;
            }
        }
        
        if (decodedKey != key)
        {
            key = decodedKey;
            Console.WriteLine($"🔧 Decoded S3 key: {key}");
        }

        // בדיקה אם הקובץ קיים ב-S3 לפני יצירת pre-signed URL
        // אם הקובץ לא נמצא ב-pdfs/, ננסה לחפש אותו ב-issues/
        string finalKey = key;
        
        try
        {
            // נבדוק אם הקובץ קיים ב-S3 (סינכרוני כדי לא לשנות את חתימת הפונקציה)
            var headRequest = new GetObjectMetadataRequest
            {
                BucketName = bucketName,
                Key = key
            };
            
            try
            {
                _s3.GetObjectMetadataAsync(headRequest).GetAwaiter().GetResult();
                finalKey = key;
                Console.WriteLine($"✅ File found in S3: {key}");
            }
            catch (Amazon.S3.AmazonS3Exception s3Ex) when (s3Ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                // הקובץ לא נמצא ב-pdfs/, ננסה לחפש אותו ב-issues/
                Console.WriteLine($"⚠️ File not found in S3 at {key}, trying issues/ folder");
                
                // אם ה-key מתחיל ב-pdfs/, נחליף ל-issues/
                if (key.StartsWith("pdfs/"))
                {
                    var alternativeKey = key.Replace("pdfs/", "issues/");
                    try
                    {
                        var altHeadRequest = new GetObjectMetadataRequest
                        {
                            BucketName = bucketName,
                            Key = alternativeKey
                        };
                        _s3.GetObjectMetadataAsync(altHeadRequest).GetAwaiter().GetResult();
                        finalKey = alternativeKey;
                        Console.WriteLine($"✅ File found in S3 at alternative location: {alternativeKey}");
                    }
                    catch
                    {
                        Console.WriteLine($"❌ File not found in S3 at either {key} or {alternativeKey}");
                        // אם הקובץ לא נמצא, ננסה ליצור pre-signed URL עם ה-key המקורי בכל מקרה
                        // (אולי הקובץ קיים אבל יש בעיית הרשאות בבדיקה)
                        finalKey = alternativeKey;
                        Console.WriteLine($"⚠️ Will try to create pre-signed URL anyway with key: {alternativeKey}");
                    }
                }
                else if (!key.StartsWith("issues/"))
                {
                    // אם ה-key לא מתחיל ב-pdfs/ או issues/, ננסה להוסיף issues/
                    var alternativeKey = $"issues/{key}";
                    try
                    {
                        var altHeadRequest = new GetObjectMetadataRequest
                        {
                            BucketName = bucketName,
                            Key = alternativeKey
                        };
                        _s3.GetObjectMetadataAsync(altHeadRequest).GetAwaiter().GetResult();
                        finalKey = alternativeKey;
                        Console.WriteLine($"✅ File found in S3 at alternative location: {alternativeKey}");
                    }
                    catch
                    {
                        Console.WriteLine($"❌ File not found in S3 at either {key} or {alternativeKey}");
                        // אם הקובץ לא נמצא, ננסה ליצור pre-signed URL עם ה-key המקורי בכל מקרה
                        finalKey = alternativeKey;
                        Console.WriteLine($"⚠️ Will try to create pre-signed URL anyway with key: {alternativeKey}");
                    }
                }
                else
                {
                    // הקובץ לא נמצא, אבל ננסה ליצור pre-signed URL בכל מקרה
                    Console.WriteLine($"⚠️ File not found in S3: {key}, but will try to create pre-signed URL anyway");
                    finalKey = key;
                            }
                        }
                    }
                    catch (Exception ex)
                    {
            Console.WriteLine($"⚠️ Error checking file existence in S3: {ex.Message}");
            // נמשיך עם יצירת pre-signed URL גם אם הבדיקה נכשלה
        }

        // יצירת URL חתום - ה-S3 SDK יעשה encode אוטומטית, אז אנחנו לא צריכים לעשות encode ידנית
                var request = new GetPreSignedUrlRequest
                {
                    BucketName = bucketName,
            Key = finalKey, // Key ללא encoding - ה-S3 SDK יעשה את זה אוטומטית
                    Verb = HttpVerb.GET,
                    Expires = DateTime.UtcNow.AddDays(7)
                };
                
        return _s3.GetPreSignedURL(request);
    }
    catch
    {
        // במקרה של שגיאה – לא שוברים כלום
        return fileUrl;
    }
    }

    // GET /api/issues/{id}/slots - קבלת מקומות פרסום לפי גיליון
    [Authorize]
    [HttpGet("{id}/slots")]
    public async Task<IActionResult> GetIssueSlots(int id)
    {
        try
        {
            var issue = await _context.Issues.FindAsync(id);
            if (issue == null)
            {
                return NotFound("גיליון לא נמצא");
            }

            var issueDate = DateOnly.FromDateTime(issue.IssueDate);

            // קבלת כל ה-Slots הקיימים
            var allSlots = await _context.Slots.ToListAsync();

            // קבלת כל ה-AdPlacements שתופסים מקום בתאריך של הגיליון
            // הגדרה: תפוס אם issueDate בתוך הטווח StartDate..EndDate (כולל), עם null כ"פתוח".
            var occupiedPlacements = await _context.Adplacements
                .Include(ap => ap.Order)
                    .ThenInclude(o => o.Advertiser)
                .Where(ap =>
                    (ap.StartDate == null || ap.StartDate <= issueDate)
                    && (ap.EndDate == null || issueDate <= ap.EndDate))
                .ToListAsync();

            // שליפת מיקומים (רבעים) לפי Ads עבור הגיליון
            var ads = await _context.Ads
                .Where(ad => ad.IssueId == id && ad.Placement != null)
                .ToListAsync();

            var occupiedBySlot = new Dictionary<int, HashSet<int>>();
            foreach (var ad in ads)
            {
                var placement = TryParsePlacement(ad.Placement);
                if (placement?.SlotId == null || placement.SlotId <= 0) continue;
                var normalized = NormalizeQuarters(placement);
                if (normalized.Count == 0) continue;
                if (!occupiedBySlot.TryGetValue(placement.SlotId.Value, out var set))
                {
                    set = new HashSet<int>();
                    occupiedBySlot[placement.SlotId.Value] = set;
                }
                foreach (var q in normalized) set.Add(q);
            }

            var occupiedSlotIds = occupiedPlacements.Select(op => op.SlotId).Distinct().ToHashSet();
            var slotsWithPlacementData = occupiedBySlot.Keys.ToHashSet();
            var fullyOccupiedByLegacy = occupiedSlotIds
                .Where(slotId => !slotsWithPlacementData.Contains(slotId))
                .ToHashSet();

            // יצירת רשימת מקומות עם סטטוס
            var slotsWithStatus = allSlots.Select(slot => new
            {
                SlotId = slot.SlotId,
                Code = slot.Code,
                Name = slot.Name,
                BasePrice = slot.BasePrice,
                IsExclusive = slot.IsExclusive,
                OccupiedQuarters = fullyOccupiedByLegacy.Contains(slot.SlotId)
                    ? new List<int> { 1, 2, 3, 4 }
                    : (occupiedBySlot.TryGetValue(slot.SlotId, out var slotQuarters)
                        ? slotQuarters.OrderBy(q => q).ToList()
                        : new List<int>()),
                IsOccupied = fullyOccupiedByLegacy.Contains(slot.SlotId)
                    || (occupiedBySlot.TryGetValue(slot.SlotId, out var occupiedQuartersForSlot) && occupiedQuartersForSlot.Count >= 4),
                OccupiedBy = occupiedPlacements
                    .Where(op => op.SlotId == slot.SlotId)
                    .OrderBy(op => op.StartDate ?? DateOnly.MinValue)
                    .Select(op => new
                    {
                        AdvertiserId = op.Order != null ? op.Order.AdvertiserId : 0,
                        AdvertiserName = op.Order != null && op.Order.Advertiser != null
                            ? op.Order.Advertiser.Company ?? op.Order.Advertiser.Name ?? op.Order.Advertiser.Email ?? "לא ידוע"
                            : "לא ידוע",
                        Company = op.Order != null && op.Order.Advertiser != null ? op.Order.Advertiser.Company : null,
                        Email = op.Order != null && op.Order.Advertiser != null ? op.Order.Advertiser.Email : null,
                        Phone = op.Order != null && op.Order.Advertiser != null ? op.Order.Advertiser.Phone : null,
                        OrderId = op.OrderId,
                        AdplacementId = op.AdplacementId,
                        OrderStatus = op.Order != null ? op.Order.Status : null,
                        StartDate = op.StartDate,
                        EndDate = op.EndDate
                    })
                    .FirstOrDefault()
            }).ToList();

            var occupiedDistinctSlots = occupiedPlacements.Select(op => op.SlotId).Distinct().Count();

            return Ok(new
            {
                IssueId = id,
                IssueTitle = issue.Title,
                Slots = slotsWithStatus,
                TotalSlots = allSlots.Count,
                OccupiedSlots = occupiedDistinctSlots,
                AvailableSlots = allSlots.Count - occupiedDistinctSlots
            });
            }
            catch (Exception ex)
            {
            Console.WriteLine($"❌ שגיאה בקבלת מקומות פרסום: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return StatusCode(500, new { error = "שגיאה פנימית בשרת", details = ex.Message });
        }
            }

        // GET /api/issues/{id}/creatives - הורדת כל המודעות לגיליון (מנהל)
        [Authorize]
        [HttpGet("{id}/creatives")]
        public async Task<IActionResult> GetIssueCreatives(int id)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return Unauthorized("לא מאומת");
                }

                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return NotFound("משתמש לא נמצא");
                }

                if (user.Role != "Admin" && user.Role != "admin")
                {
                    return Forbid("רק מנהל יכול להוריד מודעות");
                }

                var issue = await _context.Issues.FindAsync(id);
                if (issue == null)
                {
                    return NotFound("גיליון לא נמצא");
                }

                var result = await BuildIssueCreativesAsync(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ שגיאה בהורדת מודעות: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { error = "שגיאה פנימית בשרת", details = ex.Message });
            }
        }

        // GET /api/issues/latest-draft/creatives - כל המודעות של הגיליון הטיוטה האחרון
        [Authorize]
        [HttpGet("latest-draft/creatives")]
        public async Task<IActionResult> GetLatestDraftCreatives()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return Unauthorized("לא מאומת");
                }

                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return NotFound("משתמש לא נמצא");
                }

                if (user.Role != "Admin" && user.Role != "admin")
                {
                    return Forbid("רק מנהל יכול להוריד מודעות");
                }

                var latestDraft = await _context.Issues
                    .OrderByDescending(i => i.IssueDate)
                    .FirstOrDefaultAsync(i =>
                        i.PdfUrl == null
                        || i.PdfUrl.StartsWith("pending-upload-")
                        || i.PdfUrl.StartsWith("draft:")
                        || (!i.PdfUrl.Contains("amazonaws.com") && !i.PdfUrl.Contains(".s3."))
                    );

                if (latestDraft == null)
                {
                    return NotFound("לא נמצא גיליון טיוטה");
                }

                var result = await BuildIssueCreativesAsync(latestDraft.IssueId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ שגיאה בהורדת מודעות מהטיוטה האחרונה: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { error = "שגיאה פנימית בשרת", details = ex.Message });
            }
        }

        private async Task<List<object>> BuildIssueCreativesAsync(int id)
        {
            var issue = await _context.Issues.FindAsync(id);
            if (issue == null)
            {
                throw new Exception("גיליון לא נמצא");
            }

            var issueDate = DateOnly.FromDateTime(issue.IssueDate);

            var adPlacements = await _context.Adplacements
                .Include(ap => ap.Order)
                    .ThenInclude(o => o.Advertiser)
                .Include(ap => ap.Order)
                    .ThenInclude(o => o.Creatives)
                .Include(ap => ap.Slot)
                .Where(ap =>
                    (ap.StartDate == null || ap.StartDate <= issueDate)
                    && (ap.EndDate == null || issueDate <= ap.EndDate))
                .ToListAsync();

            var ads = await _context.Ads
                .Where(ad => ad.IssueId == id && ad.Placement != null)
                .ToListAsync();

            var placementsByAdvertiser = ads
                .Select(ad => new
                {
                    ad.AdvertiserId,
                    Placement = TryParsePlacement(ad.Placement)
                })
                .Where(x => x.Placement != null)
                .ToList();

            var result = new List<object>();
            foreach (var placement in adPlacements)
            {
                var order = placement.Order;
                if (order == null || order.Creatives == null) continue;

                var placementInfo = placementsByAdvertiser
                    .FirstOrDefault(x =>
                        x.AdvertiserId == order.AdvertiserId &&
                        (x.Placement?.SlotId == null || x.Placement?.SlotId == placement.SlotId))
                    ?.Placement;

                foreach (var creative in order.Creatives)
                {
                    if (creative == null) continue;
                    var fileUrl = GetFileUrl(creative.FileUrl);

                    result.Add(new
                    {
                        creativeId = creative.CreativeId,
                        orderId = order.OrderId,
                        advertiserId = order.AdvertiserId,
                        advertiserName = order.Advertiser?.Company ?? order.Advertiser?.Name ?? order.Advertiser?.Email ?? "לא ידוע",
                        slotId = placement.SlotId,
                        slotCode = placement.Slot?.Code,
                        placement = placementInfo,
                        fileUrl = fileUrl
                    });
                }
            }

            return result;
        }

        // POST /api/issues/{id}/slots/{slotId}/book - הזמנה טלפונית (מנהל)
        [Authorize]
        [HttpPost("{id}/slots/{slotId}/book")]
        public async Task<IActionResult> BookSlotForIssue(int id, int slotId, [FromBody] AdminBookSlotRequest request)
        {
            try
            {
                var issue = await _context.Issues.FindAsync(id);
                if (issue == null)
                {
                    return NotFound("גיליון לא נמצא");
                }

                var slot = await _context.Slots.FindAsync(slotId);
                if (slot == null)
                {
                    return NotFound("מקום פרסום לא נמצא");
                }

                var issueDate = DateOnly.FromDateTime(issue.IssueDate);

                if (string.IsNullOrWhiteSpace(request.Size) || request.Quarters == null || request.Quarters.Count == 0)
                {
                    return BadRequest("חובה לבחור מיקום מודעה");
                }

                var requestedPlacement = new PlacementInfo
                {
                    SlotId = slotId,
                    Size = request.Size,
                    Quarters = request.Quarters,
                    Description = request.PlacementDescription
                };

                var requestedQuarters = NormalizeQuarters(requestedPlacement);
                if (requestedQuarters.Count == 0)
                {
                    return BadRequest("חובה לבחור מיקום מודעה");
                }

                var ads = await _context.Ads
                    .Where(ad => ad.IssueId == id && ad.Placement != null)
                    .ToListAsync();

                var occupiedQuarters = new HashSet<int>();
                foreach (var existingAd in ads)
                {
                    var parsedPlacement = TryParsePlacement(existingAd.Placement);
                    if (parsedPlacement?.SlotId != slotId) continue;
                    foreach (var q in NormalizeQuarters(parsedPlacement)) occupiedQuarters.Add(q);
                }

                if (occupiedQuarters.Count == 0)
                {
                    var fullyOccupiedByLegacy = await _context.Adplacements.AnyAsync(ap =>
                        ap.SlotId == slotId
                        && (ap.StartDate == null || ap.StartDate <= issueDate)
                        && (ap.EndDate == null || issueDate <= ap.EndDate));

                    if (fullyOccupiedByLegacy)
                    {
                        return BadRequest("המקום כבר תפוס בתאריך הגיליון");
                    }
                }

                if (requestedQuarters.Any(q => occupiedQuarters.Contains(q)))
                {
                    return BadRequest("חלק מהמקום כבר תפוס בתאריך הגיליון");
                }

                Advertiser advertiser;
                if (request.AdvertiserId.HasValue && request.AdvertiserId.Value > 0)
                {
                    var foundAdvertiser = await _context.Advertisers
                        .FirstOrDefaultAsync(a => a.AdvertiserId == request.AdvertiserId.Value);
                    if (foundAdvertiser == null)
                    {
                        return NotFound("מפרסם לא נמצא");
                    }

                    advertiser = foundAdvertiser;
                }
                else
                {
                    if (string.IsNullOrWhiteSpace(request.Name))
                    {
                        return BadRequest("שם מפרסם חובה");
                    }

                    advertiser = new Advertiser
                    {
                        Name = request.Name.Trim(),
                        Company = request.Company,
                        Email = request.Email,
                        Phone = request.Phone,
                        JoinDate = DateOnly.FromDateTime(DateTime.UtcNow)
                    };

                    _context.Advertisers.Add(advertiser);
                    await _context.SaveChangesAsync();
                }

                // package קיים או יצירה
                var existingPackage = await _context.Packages
                    .FirstOrDefaultAsync(p => p.AdvertiserId == advertiser.AdvertiserId);

                int packageId;
                if (existingPackage != null)
                {
                    packageId = existingPackage.PackageId;
                }
                else
                {
                    var newPackage = new Package
                    {
                        AdvertiserId = advertiser.AdvertiserId,
                        Name = "חבילה בסיסית",
                        Price = request.Amount ?? 0,
                        StartDate = issueDate,
                        EndDate = issueDate
                    };
                    _context.Packages.Add(newPackage);
                    await _context.SaveChangesAsync();
                    packageId = newPackage.PackageId;
                }

                // יצירת order
                var order = new Adorder
                {
                    AdvertiserId = advertiser.AdvertiserId,
                    PackageId = packageId,
                    OrderDate = DateOnly.FromDateTime(DateTime.UtcNow),
                    Status = (request.PaymentStatus ?? "pending").ToLowerInvariant()
                };
                _context.AdOrders.Add(order);
                await _context.SaveChangesAsync();

                // יצירת placement לתאריך הגיליון
                var placement = new Adplacement
                {
                    OrderId = order.OrderId,
                    SlotId = slotId,
                    StartDate = issueDate,
                    EndDate = issueDate
                };
                _context.Adplacements.Add(placement);

                // תשלום (אופציונלי)
                if (request.Amount.HasValue || !string.IsNullOrWhiteSpace(request.Method) || !string.IsNullOrWhiteSpace(request.PaymentStatus))
                {
                    var payment = new Payment
                    {
                        AdvertiserId = advertiser.AdvertiserId,
                        Amount = request.Amount,
                        Method = request.Method,
                        Status = request.PaymentStatus,
                        Date = DateOnly.FromDateTime(DateTime.UtcNow)
                    };
                    _context.Payments.Add(payment);
                }

                // יצירת Ad עם פרטי המיקום כדי לאפשר תפיסה חלקית
                var placementJson = JsonSerializer.Serialize(requestedPlacement);
                var ad = new Ad
                {
                    AdvertiserId = advertiser.AdvertiserId,
                    IssueId = id,
                    PackageId = packageId,
                    Placement = placementJson,
                    Status = (request.PaymentStatus ?? "pending").ToLowerInvariant()
                };
                _context.Ads.Add(ad);

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    issueId = id,
                    slotId = slotId,
                    advertiserId = advertiser.AdvertiserId,
                    orderId = order.OrderId,
                    adplacementId = placement.AdplacementId
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ שגיאה בהזמנה טלפונית: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { error = "שגיאה פנימית בשרת", details = ex.Message });
            }
        }

        // PUT /api/issues/{id}/slots/{slotId}/booking - עריכת הזמנה קיימת (מנהל)
        // מאפשר:
        // 1) שינוי מקום (Slot) בתוך אותו גיליון
        // 2) שינוי סטטוס תשלום (order.Status)
        [Authorize]
        [HttpPut("{id}/slots/{slotId}/booking")]
        public async Task<IActionResult> UpdateSlotBookingForIssue(int id, int slotId, [FromBody] UpdateSlotBookingRequest request)
        {
            try
            {
                var issue = await _context.Issues.FindAsync(id);
                if (issue == null)
                {
                    return NotFound("גיליון לא נמצא");
                }

                var issueDate = DateOnly.FromDateTime(issue.IssueDate);

                // למצוא את ה-placement שתופס את ה-slot בתאריך של הגיליון
                var placement = await _context.Adplacements
                    .Include(ap => ap.Order)
                    .FirstOrDefaultAsync(ap =>
                        ap.SlotId == slotId
                        && (ap.StartDate == null || ap.StartDate <= issueDate)
                        && (ap.EndDate == null || issueDate <= ap.EndDate));

                if (placement == null)
                {
                    return NotFound("לא נמצאה הזמנה למקום הזה בתאריך הגיליון");
                }

                // עריכה מותרת רק להזמנה חד-שבועית/חד-תאריך כדי שלא נזיז טווחים בטעות
                if (placement.StartDate != issueDate || placement.EndDate != issueDate)
                {
                    return BadRequest("לא ניתן לערוך הזמנה רב-שבועית דרך מסך זה");
                }

                // שינוי מקום
                if (request.TargetSlotId.HasValue && request.TargetSlotId.Value > 0 && request.TargetSlotId.Value != slotId)
                {
                    var targetSlot = await _context.Slots.FindAsync(request.TargetSlotId.Value);
                    if (targetSlot == null)
                    {
                        return NotFound("מקום פרסום יעד לא נמצא");
                    }

                    var targetOccupied = await _context.Adplacements.AnyAsync(ap =>
                        ap.AdplacementId != placement.AdplacementId
                        && ap.SlotId == request.TargetSlotId.Value
                        && (ap.StartDate == null || ap.StartDate <= issueDate)
                        && (ap.EndDate == null || issueDate <= ap.EndDate));

                    if (targetOccupied)
                    {
                        return BadRequest("מקום היעד כבר תפוס בתאריך הגיליון");
                    }

                    placement.SlotId = request.TargetSlotId.Value;
                }

                // שינוי סטטוס תשלום
                if (!string.IsNullOrWhiteSpace(request.PaymentStatus) && placement.Order != null)
                {
                    placement.Order.Status = request.PaymentStatus.Trim().ToLowerInvariant();
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    issueId = id,
                    fromSlotId = slotId,
                    toSlotId = placement.SlotId,
                    orderId = placement.OrderId,
                    adplacementId = placement.AdplacementId,
                    paymentStatus = placement.Order != null ? placement.Order.Status : null
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ שגיאה בעריכת הזמנה: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { error = "שגיאה פנימית בשרת", details = ex.Message });
            }
        }

        // PUT /api/issues/{id}/slots/{slotId}/placement - עדכון חלוקת מיקום (מנהל)
        [Authorize]
        [HttpPut("{id}/slots/{slotId}/placement")]
        public async Task<IActionResult> UpdateSlotPlacementForIssue(int id, int slotId, [FromBody] UpdateSlotPlacementRequest request)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return Unauthorized("לא מאומת");
                }

                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return NotFound("משתמש לא נמצא");
                }

                if (user.Role != "Admin" && user.Role != "admin")
                {
                    return Forbid("רק מנהל יכול לעדכן חלוקת מיקום");
                }

                if (request.OrderId <= 0)
                {
                    return BadRequest("חובה להזין מזהה הזמנה תקין");
                }

                var issue = await _context.Issues.FindAsync(id);
                if (issue == null)
                {
                    return NotFound("גיליון לא נמצא");
                }

                var slot = await _context.Slots.FindAsync(slotId);
                if (slot == null)
                {
                    return NotFound("מקום פרסום לא נמצא");
                }

                var order = await _context.AdOrders.FindAsync(request.OrderId);
                if (order == null)
                {
                    return NotFound("הזמנה לא נמצאה");
                }

                if (string.IsNullOrWhiteSpace(request.Size) || request.Quarters == null || request.Quarters.Count == 0)
                {
                    return BadRequest("חובה לבחור מיקום מודעה");
                }

                var placement = new PlacementInfo
                {
                    SlotId = slotId,
                    Size = request.Size,
                    Quarters = request.Quarters,
                    Description = request.Description
                };

                var normalized = NormalizeQuarters(placement);
                if (normalized.Count == 0)
                {
                    return BadRequest("חובה לבחור מיקום מודעה");
                }

                var placementJson = JsonSerializer.Serialize(placement);

                var existingAd = await _context.Ads
                    .FirstOrDefaultAsync(ad => ad.IssueId == id && ad.AdvertiserId == order.AdvertiserId);

                if (existingAd == null)
                {
                    var ad = new Ad
                    {
                        AdvertiserId = order.AdvertiserId,
                        IssueId = id,
                        PackageId = order.PackageId,
                        Placement = placementJson,
                        Status = order.Status ?? "approved"
                    };
                    _context.Ads.Add(ad);
                }
                else
                {
                    existingAd.Placement = placementJson;
                }

                await _context.SaveChangesAsync();

                return Ok(new { message = "חלוקת מיקום עודכנה בהצלחה" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ שגיאה בעדכון חלוקת מיקום: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { error = "שגיאה פנימית בשרת", details = ex.Message });
            }
        }

        }
    }