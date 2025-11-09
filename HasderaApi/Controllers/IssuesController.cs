using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HasderaApi.Data;
using HasderaApi.Models;
using Dapper;
using Amazon.S3;
using Amazon;
using Npgsql;

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

        // GET /api/issues?q=...&page=1&pageSize=20
        [HttpGet]
        public async Task<ActionResult<PagedResult<IssueDto>>> Get(
            [FromQuery] string? q,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;
            var offset = (page - 1) * pageSize;

            try 
            {
                var param = new
                {
                    Q = string.IsNullOrWhiteSpace(q) ? null : $"%{q}%",
                    Limit = pageSize,
                    Offset = offset
                };

                var sql = @"
                    WITH FilteredIssues AS (
                        SELECT issue_id, title, issue_date, file_url, pdf_url
                        FROM public.issues
                        WHERE (@Q IS NULL OR title ILIKE @Q)
                    )
                    SELECT *
                    FROM FilteredIssues
                    ORDER BY issue_date DESC, issue_id DESC
                    LIMIT @Limit OFFSET @Offset;

                    SELECT COUNT(*) 
                    FROM FilteredIssues;";

                // הגדרת Command Timeout ארוך יותר
                var commandDefinition = new CommandDefinition(
                    sql,
                    param,
                    commandTimeout: 60  // 60 שניות timeout
                );

                using var connection = new NpgsqlConnection(_db.ConnectionString);
                await connection.OpenAsync();
                using var multi = await connection.QueryMultipleAsync(commandDefinition);
                var items = (await multi.ReadAsync<IssueDto>()).ToList();
                var total = await multi.ReadFirstAsync<int>();

                return Ok(new PagedResult<IssueDto>(total, page, pageSize, items));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ שגיאה בשליפת גיליונות: {ex.Message}");
                return StatusCode(500, "שגיאה בהתחברות לבסיס הנתונים");
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

        // DELETE /api/issues/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteIssue(int id)
        {
            var issue = await _context.Issues.FindAsync(id);
            if (issue == null)
                return NotFound();

            _context.Issues.Remove(issue);
            await _context.SaveChangesAsync();

            return NoContent();
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

                // טעינת ה-PDF מ-S3
                using var httpClient = new HttpClient();
                var response = await httpClient.GetAsync(issue.PdfUrl);
                
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
    }
}
