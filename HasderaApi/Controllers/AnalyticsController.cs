using HasderaApi.Data;
using HasderaApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net.Http;
using System.Text.Json;
using System;

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

        // === GET: /api/analytics/advertiser/{advertiserId} ===
        [HttpGet("advertiser/{advertiserId}")]
        public async Task<IActionResult> GetAdvertiserAnalytics(int advertiserId)
        {
            try
            {
                // קריאה לשירות Python
                using var httpClient = new HttpClient();
                var pythonServiceUrl = Environment.GetEnvironmentVariable("PYTHON_ANALYTICS_SERVICE_URL") ?? "http://localhost:5001";
                
                var response = await httpClient.GetAsync($"{pythonServiceUrl}/analytics/advertiser/{advertiserId}");
                
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    return Ok(JsonSerializer.Deserialize<object>(content));
                }
                
                // אם השירות Python לא זמין, נחזיר מהמסד נתונים
                var analytics = await _context.Analytics
                    .Where(a => a.AdId != null && _context.AdPlacements
                        .Any(ap => ap.AdplacementId == a.AdId && ap.Order.AdvertiserId == advertiserId))
                    .ToListAsync();
                
                return Ok(analytics);
            }
            catch (Exception)
            {
                // אם יש שגיאה, נחזיר מהמסד נתונים
                var analytics = await _context.Analytics
                    .Where(a => a.AdId != null && _context.AdPlacements
                        .Any(ap => ap.AdplacementId == a.AdId && ap.Order.AdvertiserId == advertiserId))
                    .ToListAsync();
                
                return Ok(analytics);
            }
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
