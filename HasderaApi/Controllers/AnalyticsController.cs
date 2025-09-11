using HasderaApi.Data;
using HasderaApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HasderaApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnalyticsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AnalyticsController(AppDbContext context)
        {
            _context = context;
        }

        // === GET: /api/analytics ===
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Analytics>>> GetAllAnalytics()
        {
            return await _context.Analytics.ToListAsync();
        }

        // === GET: /api/analytics/{id} ===
        [HttpGet("{id}")]
        public async Task<ActionResult<Analytics>> GetAnalyticsById(int id)
        {
            var analytics = await _context.Analytics.FindAsync(id);

            if (analytics == null)
                return NotFound();

            return analytics;
        }

        // === POST: /api/analytics ===
        [HttpPost]
        public async Task<ActionResult<Analytics>> CreateAnalytics(Analytics analytics)
        {
            _context.Analytics.Add(analytics);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAnalyticsById),
                new { id = analytics.AnalyticsId }, analytics);
        }

        // === PUT: /api/analytics/{id} ===
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAnalytics(int id, Analytics analytics)
        {
            if (id != analytics.AnalyticsId)
                return BadRequest();

            _context.Entry(analytics).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Analytics.Any(e => e.AnalyticsId == id))
                    return NotFound();

                throw;
            }

            return NoContent();
        }

        // === DELETE: /api/analytics/{id} ===
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAnalytics(int id)
        {
            var analytics = await _context.Analytics.FindAsync(id);
            if (analytics == null)
                return NotFound();

            _context.Analytics.Remove(analytics);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
