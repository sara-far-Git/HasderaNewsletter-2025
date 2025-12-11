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
            try
            {
                return await _context.Analytics.ToListAsync();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Database error: {ex.Message}");
            }
        }

        // === GET: /api/analytics/{id} ===
        [HttpGet("{id}")]
        public async Task<ActionResult<Analytics>> GetAnalyticsById(int id)
        {
            try
            {
                var analytics = await _context.Analytics.FindAsync(id);

                if (analytics == null)
                    return NotFound($"Analytics with ID {id} not found");

                return analytics;
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Database error: {ex.Message}");
            }
        }

        // === POST: /api/analytics ===
        [HttpPost]
        public async Task<ActionResult<Analytics>> CreateAnalytics(Analytics analytics)
        {
            if (analytics == null)
            {
                return BadRequest("Analytics data is required");
            }

            try
            {
                _context.Analytics.Add(analytics);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetAnalyticsById),
                    new { id = analytics.AnalyticsId }, analytics);
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"Database error while creating analytics: {ex.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Unexpected error: {ex.Message}");
            }
        }

        // === PUT: /api/analytics/{id} ===
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAnalytics(int id, Analytics analytics)
        {
            if (analytics == null)
            {
                return BadRequest("Analytics data is required");
            }

            if (id != analytics.AnalyticsId)
            {
                return BadRequest($"ID mismatch: URL ID ({id}) does not match body ID ({analytics.AnalyticsId})");
            }

            _context.Entry(analytics).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Analytics.Any(e => e.AnalyticsId == id))
                    return NotFound($"Analytics with ID {id} not found");

                return StatusCode(500, "Concurrency error: The record was modified by another user");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Database error while updating analytics: {ex.Message}");
            }

            return NoContent();
        }

        // === DELETE: /api/analytics/{id} ===
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAnalytics(int id)
        {
            try
            {
                var analytics = await _context.Analytics.FindAsync(id);
                if (analytics == null)
                    return NotFound($"Analytics with ID {id} not found");

                _context.Analytics.Remove(analytics);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"Database error while deleting analytics: {ex.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Unexpected error: {ex.Message}");
            }
        }
    }
}
