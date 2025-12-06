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
                if (!string.IsNullOrEmpty(issue.PdfUrl))
                {
                    issue.PdfUrl = GetFileUrl(issue.PdfUrl);
                }
                if (!string.IsNullOrEmpty(issue.FileUrl))
                {
                    issue.FileUrl = GetFileUrl(issue.FileUrl);
                }

                Console.WriteLine($"✅ גיליון נמצא: {issue.Title}, PDF URL: {issue.PdfUrl}");
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
                var issue = await _context.Issues.FindAsync(id);
                if (issue == null)
                {
                    return NotFound();
                }

                // עדכון פרטי הגיליון
                if (!string.IsNullOrEmpty(request.Title))
                {
                    issue.Title = request.Title;
                }
                if (request.IssueDate.HasValue)
                {
                    issue.IssueDate = request.IssueDate.Value;
                }
                if (!string.IsNullOrEmpty(request.Summary))
                {
                    issue.Summary = request.Summary;
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    issueId = issue.IssueId,
                    title = issue.Title,
                    pdfUrl = issue.PdfUrl
                });
            }
            catch (Exception ex)
            {
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
            public string? Title { get; set; }
            public DateTime? IssueDate { get; set; }
            public string? Summary { get; set; }
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
                
                var localFilePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "issues", fileName);
                
                if (!System.IO.File.Exists(localFilePath))
                {
                    Console.WriteLine($"❌ קובץ טיוטה לא נמצא: {localFilePath}");
                    return NotFound("קובץ טיוטה לא נמצא");
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
                
                // הוספת headers נוספים
                Response.Headers["Content-Type"] = "application/pdf";
                Response.Headers["Content-Disposition"] = $"inline; filename=\"{fileName}\"";
                Response.Headers["Content-Length"] = fileInfo.Length.ToString();
                Response.Headers["Cache-Control"] = "public, max-age=3600";
                Response.Headers["Accept-Ranges"] = "bytes";
                
                Console.WriteLine($"📤 Sending PDF file: {fileName}, Size: {fileInfo.Length} bytes, Content-Type: application/pdf");
                
                // שימוש ב-PhysicalFile עם streaming במקום לטעון את כל הקובץ לזיכרון
                return PhysicalFile(localFilePath, "application/pdf", fileName, enableRangeProcessing: true);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ שגיאה בטעינת קובץ טיוטה: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { error = "שגיאה פנימית בשרת", details = ex.Message });
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

        // יצירת URL חתום - ה-S3 SDK יעשה encode אוטומטית, אז אנחנו לא צריכים לעשות encode ידנית
                var request = new GetPreSignedUrlRequest
                {
                    BucketName = bucketName,
            Key = key, // Key ללא encoding - ה-S3 SDK יעשה את זה אוטומטית
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


    }
}
