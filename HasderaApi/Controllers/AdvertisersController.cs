using HasderaApi.Data;
using HasderaApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace HasderaApi.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class AdvertisersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdvertisersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Advertiser>>> GetAdvertisers()
        {
            return await _context.Advertisers.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Advertiser>> GetAdvertiser(int id)
        {
            var advertiser = await _context.Advertisers.FindAsync(id);

            if (advertiser == null)
                return NotFound();

            return advertiser;
        }

        [HttpPost]
        public async Task<ActionResult<Advertiser>> CreateAdvertiser(Advertiser advertiser)
        {
            // אם לא נשלח JoinDate – נגדיר היום
            advertiser.JoinDate ??= DateOnly.FromDateTime(DateTime.UtcNow);
            _context.Advertisers.Add(advertiser);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAdvertiser), new { id = advertiser.AdvertiserId }, advertiser);
        }

        // GET /api/advertisers/{id}/payments - רשימת תשלומים למפרסם
        [Authorize]
        [HttpGet("{id}/payments")]
        public async Task<IActionResult> GetAdvertiserPayments(int id)
        {
            var advertiserExists = await _context.Advertisers.AnyAsync(a => a.AdvertiserId == id);
            if (!advertiserExists)
                return NotFound("מפרסם לא נמצא");

            var payments = await _context.Payments
                .AsNoTracking()
                .Where(p => p.AdvertiserId == id)
                .OrderByDescending(p => p.Date ?? DateOnly.MinValue)
                .ThenByDescending(p => p.PaymentId)
                .Select(p => new
                {
                    paymentId = p.PaymentId,
                    advertiserId = p.AdvertiserId,
                    amount = p.Amount,
                    method = p.Method,
                    status = p.Status,
                    date = p.Date
                })
                .ToListAsync();

            return Ok(payments);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAdvertiser(int id, Advertiser advertiser)
        {
            if (id != advertiser.AdvertiserId)
                return BadRequest();

            _context.Entry(advertiser).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAdvertiser(int id)
        {
            var advertiser = await _context.Advertisers.FindAsync(id);
            if (advertiser == null)
                return NotFound();

            _context.Advertisers.Remove(advertiser);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
