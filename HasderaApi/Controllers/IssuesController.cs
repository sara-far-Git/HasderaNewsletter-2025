using Microsoft.AspNetCore.Mvc;
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
        public ActionResult<IEnumerable<Issue>> GetAll()
        {
            return _context.Issues.ToList();
        }

        /// <summary>
        /// מחזיר גיליון לפי מזהה
        /// GET: api/Issues/{id}
        /// </summary>
        [HttpGet("{id}")]
        public ActionResult<Issue> GetById(int id)
        {
            var issue = _context.Issues.Find(id);
            if (issue == null)
                return NotFound();

            return issue;
        }

        /// <summary>
        /// יוצר גיליון חדש
        /// POST: api/Issues
        /// </summary>
        [HttpPost]
        public ActionResult<Issue> Create(Issue issue)
        {
            _context.Issues.Add(issue);
            _context.SaveChanges();

            // מחזיר 201 Created עם קישור למשאב החדש
            return CreatedAtAction(nameof(GetById), new { id = issue.IssueId }, issue);
        }
    }
}
