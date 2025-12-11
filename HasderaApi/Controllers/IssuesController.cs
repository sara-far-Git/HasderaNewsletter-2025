using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HasderaApi.Data;
using HasderaApi.Models;

namespace HasderaApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class IssuesController : ControllerBase
    {
        private readonly AppDbContext _context;

        // הזרקת ה־DbContext דרך ה־Constructor
        public IssuesController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// מחזיר את כל הגיליונות
        /// GET: api/Issues
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Issue>>> GetAll()
        {
            try
            {
                return await _context.Issues.ToListAsync();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Database error: {ex.Message}");
            }
        }

        /// <summary>
        /// מחזיר גיליון לפי מזהה
        /// GET: api/Issues/{id}
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<Issue>> GetById(int id)
        {
            try
            {
                var issue = await _context.Issues.FindAsync(id);
                if (issue == null)
                    return NotFound($"Issue with ID {id} not found");

                return issue;
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Database error: {ex.Message}");
            }
        }

        /// <summary>
        /// יוצר גיליון חדש
        /// POST: api/Issues
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<Issue>> Create(Issue issue)
        {
            if (issue == null)
            {
                return BadRequest("Issue data is required");
            }

            try
            {
                _context.Issues.Add(issue);
                await _context.SaveChangesAsync();

                // מחזיר 201 Created עם קישור למשאב החדש
                return CreatedAtAction(nameof(GetById), new { id = issue.IssueId }, issue);
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"Database error while creating issue: {ex.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Unexpected error: {ex.Message}");
            }
        }
    }
}
