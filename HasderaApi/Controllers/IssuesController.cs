using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HasderaApi.Data;
using HasderaApi.Models;
using Dapper;
using Amazon.S3;
using Amazon.S3.Model;
using Amazon;
using Npgsql;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using System.IO;
using System.Linq;
using System.Text.Json.Serialization;

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
                
                // אם publishedOnly=true, נסנן רק גליונות שפורסמו (לא pending-upload ולא /uploads/ ולא draft-file)
                // גיליון נחשב פורסם רק אם הוא ב-S3 (בתיקיית issues/ או pdfs/)
                // חשוב: נבדוק את ה-URL המקורי לפני כל עיבוד
                // גיליון פורסם = לא pending-upload ולא /uploads/ ולא draft-file ו-URL מכיל amazonaws.com
                if (publishedOnly)
                {
                    query = query.Where(i => 
                        i.PdfUrl != null 
                        // 🔧 שלב 1: שלילת טיוטות - גליונות שלא פורסמו
                        && !i.PdfUrl.StartsWith("pending-upload-")
                        && !i.PdfUrl.StartsWith("/uploads/")
                        && !i.PdfUrl.StartsWith("/api/issues/draft-file/")
                        // 🔧 שלב 2: וידוא שזה ב-S3 (בתיקיית issues/ או pdfs/)
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
                var issue = await _context.Issues.FindAsync(id);

                if (issue == null)
                {
                    Console.WriteLine($"❌ גיליון לא נמצא: ID {id}");
                    return NotFound();
                }

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

        // POST /api/issues/upload-pdf - העלאת PDF (שמירה זמנית בשרת עד לפרסום)
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

                // שמירה זמנית בשרת - לא ב-S3 עד לפרסום
                var tempFileName = $"pending-upload-{Guid.NewGuid()}.pdf";
                var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "issues");
                
                // יצירת תיקייה אם לא קיימת
                Directory.CreateDirectory(uploadsPath);
                
                var filePath = Path.Combine(uploadsPath, tempFileName);
                
                // שמירת הקובץ בשרת
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(fileStream);
                }

                // בדיקה שהקובץ נשמר כראוי ושהוא PDF תקין
                var savedFileInfo = new FileInfo(filePath);
                if (!savedFileInfo.Exists || savedFileInfo.Length == 0)
                {
                    Console.WriteLine($"❌ הקובץ לא נשמר כראוי: {filePath}");
                    return StatusCode(500, "שגיאה בשמירת הקובץ");
                }

                // בדיקה שה-bytes הראשונים הם %PDF
                var savedFileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
                if (savedFileBytes.Length < 4 || 
                    savedFileBytes[0] != 0x25 || // %
                    savedFileBytes[1] != 0x50 || // P
                    savedFileBytes[2] != 0x44 || // D
                    savedFileBytes[3] != 0x46)   // F
                {
                    // נבדוק אם יש BOM או תווים נוספים בהתחלה
                    bool isValidPdf = false;
                    for (int i = 0; i < Math.Min(10, savedFileBytes.Length - 4); i++)
                    {
                        if (savedFileBytes[i] == 0x25 && 
                            savedFileBytes[i + 1] == 0x50 && 
                            savedFileBytes[i + 2] == 0x44 && 
                            savedFileBytes[i + 3] == 0x46)
                        {
                            isValidPdf = true;
                            break;
                        }
                    }
                    
                    if (!isValidPdf)
                    {
                        Console.WriteLine($"❌ הקובץ שנשמר לא נראה כמו PDF תקין: {filePath}");
                        Console.WriteLine($"ראשית הקובץ (hex): {BitConverter.ToString(savedFileBytes.Take(20).ToArray())}");
                        // נמחק את הקובץ הפגום
                        try { System.IO.File.Delete(filePath); } catch { }
                        return StatusCode(500, "הקובץ שהועלה אינו בפורמט PDF תקין");
                    }
                }

                Console.WriteLine($"✅ קובץ PDF נשמר בהצלחה: {tempFileName}, גודל: {savedFileInfo.Length} bytes");

                // יצירת URL זמני לשרת
                var fileUrl = $"pending-upload-{tempFileName}";

                // יצירת Issue במסד הנתונים עם סטטוס draft
                var issue = new Issue
                {
                    Title = title ?? $"גיליון {DateTime.UtcNow:yyyy-MM-dd}",
                    IssueDate = issueDate ?? DateTime.UtcNow,
                    PdfUrl = fileUrl, // URL זמני - לא ב-S3
                    FileUrl = fileUrl
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
                    pdfUrl = issue.PdfUrl, // URL זמני
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
                }
                else if (links != null || animations != null || metadata.Count > 0)
                {
                    // שמירת metadata כ-JSON - נעדכן גם אם יש קישורים או אנימציות (גם אם ריקים)
                    issue.Summary = System.Text.Json.JsonSerializer.Serialize(metadata);
                    Console.WriteLine($"💾 Saving Summary with metadata: {issue.Summary}");
                }
                else
                {
                    Console.WriteLine($"⚠️ No links, animations, or metadata to save");
                }

                await _context.SaveChangesAsync();
                
                Console.WriteLine($"✅ Issue {id} updated successfully");
                Console.WriteLine($"✅ Summary length: {issue.Summary?.Length ?? 0}");
                Console.WriteLine($"✅ Summary content: {(string.IsNullOrEmpty(issue.Summary) ? "null/empty" : issue.Summary.Substring(0, Math.Min(200, issue.Summary.Length)))}");

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

                // אם הקובץ עדיין לא ב-S3 (טיוטה), נעלה אותו עכשיו
                if (issue.PdfUrl != null && issue.PdfUrl.StartsWith("pending-upload-"))
                {
                    var bucketName = _cfg["S3:Bucket"] ?? "hasdera-issues";
                    var prefix = "issues/";
                    var fileName = $"{issue.IssueId}_{Guid.NewGuid()}.pdf";
                    var s3Key = $"{prefix}{fileName}";

                    // נתיב לקובץ הזמני בשרת
                    var tempFileName = issue.PdfUrl.Replace("pending-upload-", "");
                    var localFilePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "issues", tempFileName);
                    
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
                }

                // עדכון תאריך פרסום להיום
                issue.IssueDate = DateTime.UtcNow;

                await _context.SaveChangesAsync();

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
                
                Console.WriteLine($"📤 Sending PDF file: {fileName}, Size: {fileInfo.Length} bytes, Content-Type: application/pdf");
                
                // שימוש ב-PhysicalFile עם streaming - הוא מטפל אוטומטית ב-Range requests
                // enableRangeProcessing: true מאפשר תמיכה ב-Range requests עבור PDF streaming
                // PhysicalFile יוסיף אוטומטית את Content-Type, Content-Length, Accept-Ranges ו-Content-Range לפי הצורך
                return PhysicalFile(localFilePath, "application/pdf", fileName, enableRangeProcessing: true);
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

                // אם זה טיוטה (pending-upload), נטען מהשרת המקומי
                if (issue.PdfUrl.StartsWith("pending-upload-"))
                {
                    var tempFileName = issue.PdfUrl.Replace("pending-upload-", "");
                    var localFilePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "issues", tempFileName);
                    
                    if (System.IO.File.Exists(localFilePath))
                    {
                        var fileBytes = await System.IO.File.ReadAllBytesAsync(localFilePath);
                        return File(fileBytes, "application/pdf", $"{issue.Title}.pdf");
                    }
                    else
                    {
                        return NotFound("קובץ טיוטה לא נמצא בשרת");
                    }
                }

                // אם זה קובץ שפורסם, נטען מ-S3
                var pdfUrl = GetFileUrl(issue.PdfUrl);

                // טעינת ה-PDF מ-S3
                using var httpClient = new HttpClient();
                var response = await httpClient.GetAsync(pdfUrl);
                
                if (!response.IsSuccessStatusCode)
                {
                    return StatusCode(500, "שגיאה בטעינת PDF מ-S3");
                }

                var pdfBytes = await response.Content.ReadAsByteArrayAsync();
                
                return File(pdfBytes, "application/pdf", $"{issue.Title}.pdf");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ שגיאה בטעינת PDF: {ex.Message}");
                return StatusCode(500, "שגיאה פנימית בשרת");
            }
        }

        private string GetFileUrl(string? fileUrl)
        {
    if (string.IsNullOrWhiteSpace(fileUrl))
                return fileUrl ?? string.Empty;

    // 1) טיוטה - pending-upload-xxxx.pdf
            if (fileUrl.StartsWith("pending-upload-"))
            {
                var tempFileName = fileUrl.Replace("pending-upload-", "");
                return $"/api/issues/draft-file/{tempFileName}";
            }

    // 2) קובץ שמור בשרת
            if (fileUrl.StartsWith("/uploads/"))
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

            // קבלת כל ה-Slots הקיימים
            var allSlots = await _context.Slots.ToListAsync();

            // קבלת כל ה-AdPlacements הקשורים לגיליון הזה דרך Ads
            // Ad -> IssueId, Ad -> AdvertiserId -> Adorder -> Adplacement -> SlotId
            var occupiedSlots = await _context.Ads
                .Where(ad => ad.IssueId == id)
                .SelectMany(ad => _context.AdOrders
                    .Where(order => order.AdvertiserId == ad.AdvertiserId)
                    .SelectMany(order => order.Adplacements)
                    .Select(ap => new
                    {
                        SlotId = ap.SlotId,
                        Slot = ap.Slot,
                        AdvertiserId = ad.AdvertiserId,
                        Advertiser = ad.Advertiser,
                        AdplacementId = ap.AdplacementId,
                        StartDate = ap.StartDate,
                        EndDate = ap.EndDate
                    }))
                .ToListAsync();

            // יצירת רשימת מקומות עם סטטוס
            var slotsWithStatus = allSlots.Select(slot => new
            {
                SlotId = slot.SlotId,
                Code = slot.Code,
                Name = slot.Name,
                BasePrice = slot.BasePrice,
                IsExclusive = slot.IsExclusive,
                IsOccupied = occupiedSlots.Any(os => os.SlotId == slot.SlotId),
                OccupiedBy = occupiedSlots
                    .Where(os => os.SlotId == slot.SlotId)
                    .Select(os => new
                    {
                        AdvertiserId = os.AdvertiserId,
                        AdvertiserName = os.Advertiser != null ? os.Advertiser.Company ?? os.Advertiser.Name ?? os.Advertiser.Email ?? "לא ידוע" : "לא ידוע",
                        AdplacementId = os.AdplacementId,
                        StartDate = os.StartDate,
                        EndDate = os.EndDate
                    })
                    .FirstOrDefault()
            }).ToList();

            return Ok(new
            {
                IssueId = id,
                IssueTitle = issue.Title,
                Slots = slotsWithStatus,
                TotalSlots = allSlots.Count,
                OccupiedSlots = occupiedSlots.Count,
                AvailableSlots = allSlots.Count - occupiedSlots.Select(os => os.SlotId).Distinct().Count()
            });
            }
            catch (Exception ex)
            {
            Console.WriteLine($"❌ שגיאה בקבלת מקומות פרסום: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return StatusCode(500, new { error = "שגיאה פנימית בשרת", details = ex.Message });
        }
            }

        }
    }