using HasderaApi.Data;
using HasderaApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
            _context.Advertisers.Add(advertiser);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAdvertiser), new { id = advertiser.AdvertiserId }, advertiser);
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
