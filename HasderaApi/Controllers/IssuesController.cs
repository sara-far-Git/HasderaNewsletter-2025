using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HasderaApi.Data;
using HasderaApi.Models;
using System;

namespace HasderaApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class IssuesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public IssuesController(AppDbContext context)
        {
            _context = context;
        }

        // === GET: api/issues ===
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Issue>>> GetIssues()
        {
            return await _context.Issues.ToListAsync();
        }

        // === GET: api/issues/5 ===
        [HttpGet("{id}")]
        public async Task<ActionResult<Issue>> GetIssue(int id)
        {
            var issue = await _context.Issues.FindAsync(id);

            if (issue == null)
            {
                return NotFound();
            }

            return issue;
        }

        // === POST: api/issues ===
        [HttpPost]
        public async Task<ActionResult<Issue>> CreateIssue(Issue issue)
        {
            _context.Issues.Add(issue);
            await _context.SaveChangesAsync();

            // מחזיר גם את הכתובת של האובייקט החדש
            return CreatedAtAction(nameof(GetIssue), new { id = issue.IssueId }, issue);
        }

        // === PUT: api/issues/5 ===
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateIssue(int id, Issue issue)
        {
            if (id != issue.IssueId)
            {
                return BadRequest();
            }

            _context.Entry(issue).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Issues.Any(e => e.IssueId == id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // === DELETE: api/issues/5 ===
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteIssue(int id)
        {
            var issue = await _context.Issues.FindAsync(id);
            if (issue == null)
            {
                return NotFound();
            }

            _context.Issues.Remove(issue);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
