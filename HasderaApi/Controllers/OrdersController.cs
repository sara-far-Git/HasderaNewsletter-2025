using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HasderaApi.Data;
using HasderaApi.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using System.Text.Json;

namespace HasderaApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OrdersController(AppDbContext context)
        {
            _context = context;
        }

        // POST /api/Orders/manual - יצירת הזמנה ידנית על ידי מנהל
        [Authorize]
        [HttpPost("manual")]
        public async Task<IActionResult> CreateManualOrder([FromBody] ManualOrderRequest request)
        {
            try
            {
                // בדיקת הרשאות - רק מנהל יכול ליצור הזמנה ידנית
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return Unauthorized("לא מאומת");
                }

                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return NotFound("משתמש לא נמצא");
                }

                // בדיקה שהמשתמש הוא מנהל
                if (user.Role != "Admin" && user.Role != "admin")
                {
                    return Forbid("רק מנהל יכול ליצור הזמנה ידנית");
                }

                // בדיקת נתונים
                if (request.AdvertiserId <= 0)
                {
                    return BadRequest("נא לספק ID מפרסם תקין");
                }

                if (request.IssueId <= 0)
                {
                    return BadRequest("נא לספק ID גיליון תקין");
                }

                if (request.SlotId <= 0)
                {
                    return BadRequest("נא לספק ID מקום פרסום תקין");
                }

                if (request.Placement == null)
                {
                    return BadRequest("נא לספק נתוני מיקום");
                }

                // בדיקה שהמפרסם קיים
                var advertiser = await _context.Advertisers.FindAsync(request.AdvertiserId);
                if (advertiser == null)
                {
                    return NotFound("מפרסם לא נמצא");
                }

                // בדיקה שהגיליון קיים
                var issue = await _context.Issues.FindAsync(request.IssueId);
                if (issue == null)
                {
                    return NotFound("גיליון לא נמצא");
                }

                // בדיקה שמקום הפרסום קיים
                var slot = await _context.Slots.FindAsync(request.SlotId);
                if (slot == null)
                {
                    return NotFound("מקום פרסום לא נמצא");
                }

                // בדיקה שמקום הפרסום לא תפוס כבר בגיליון הזה
                // נבדוק אם יש Ads בגיליון הזה שמקושרים ל-AdOrders עם Adplacements שמשתמשים ב-Slot הזה
                var occupiedSlots = await _context.Ads
                    .Where(ad => ad.IssueId == request.IssueId)
                    .SelectMany(ad => _context.AdOrders
                        .Where(order => order.AdvertiserId == ad.AdvertiserId)
                        .SelectMany(order => order.Adplacements)
                        .Where(ap => ap.SlotId == request.SlotId))
                    .AnyAsync();

                if (occupiedSlots)
                {
                    return BadRequest("מקום הפרסום תפוס כבר בגיליון זה");
                }

                // מציאת package קיים למפרסם או יצירת אחד חדש
                var existingPackage = await _context.Packages
                    .FirstOrDefaultAsync(p => p.AdvertiserId == request.AdvertiserId);
                
                int packageId;
                if (existingPackage != null)
                {
                    packageId = existingPackage.PackageId;
                }
                else
                {
                    var newPackage = new Package
                    {
                        AdvertiserId = request.AdvertiserId,
                        Name = "חבילה בסיסית",
                        Price = 0,
                        StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
                        EndDate = DateOnly.FromDateTime(DateTime.UtcNow.AddYears(1))
                    };
                    _context.Packages.Add(newPackage);
                    await _context.SaveChangesAsync();
                    packageId = newPackage.PackageId;
                }

                // יצירת order חדש
                var order = new Adorder
                {
                    AdvertiserId = request.AdvertiserId,
                    PackageId = packageId,
                    OrderDate = DateOnly.FromDateTime(DateTime.UtcNow),
                    Status = "approved" // הזמנה ידנית מאושרת אוטומטית
                };
                _context.AdOrders.Add(order);
                await _context.SaveChangesAsync();

                // יצירת Adplacement עם ה-SlotId
                var adPlacement = new Adplacement
                {
                    OrderId = order.OrderId,
                    SlotId = request.SlotId,
                    StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
                    EndDate = DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(1)) // ברירת מחדל חודש
                };
                _context.Adplacements.Add(adPlacement);
                await _context.SaveChangesAsync();

                // יצירת Ad המקשר בין הגיליון למפרסם
                var placementJson = JsonSerializer.Serialize(request.Placement);
                var ad = new Ad
                {
                    AdvertiserId = request.AdvertiserId,
                    IssueId = request.IssueId,
                    PackageId = packageId,
                    Placement = placementJson,
                    Status = "approved" // מודעה מאושרת אוטומטית
                };
                _context.Ads.Add(ad);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    orderId = order.OrderId,
                    adPlacementId = adPlacement.AdplacementId,
                    adId = ad.AdId,
                    message = "הזמנה נוצרה בהצלחה"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ שגיאה ביצירת הזמנה ידנית: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { error = "שגיאה פנימית בשרת", details = ex.Message });
            }
        }

        // GET /api/Orders - קבלת רשימת הזמנות
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetOrders([FromQuery] int? advertiserId = null)
        {
            try
            {
                var query = _context.AdOrders
                    .Include(o => o.Advertiser)
                    .Include(o => o.Package)
                    .Include(o => o.Adplacements)
                    .ThenInclude(ap => ap.Slot)
                    .AsQueryable();

                if (advertiserId.HasValue)
                {
                    query = query.Where(o => o.AdvertiserId == advertiserId.Value);
                }

                var orders = await query.ToListAsync();

                return Ok(orders);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ שגיאה בשליפת הזמנות: {ex.Message}");
                return StatusCode(500, new { error = "שגיאה פנימית בשרת", details = ex.Message });
            }
        }
    }

    // DTO ליצירת הזמנה ידנית
    public class ManualOrderRequest
    {
        public int AdvertiserId { get; set; }
        public int IssueId { get; set; }
        public int SlotId { get; set; }
        public int? PageNumber { get; set; }
        public PlacementData? Placement { get; set; }
    }

    public class PlacementData
    {
        public string? Size { get; set; } // 'full', 'half', 'quarter'
        public List<int>? Quarters { get; set; } // [1,2,3,4]
        public string? Description { get; set; }
    }
}

