using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HasderaApi.Data;
using HasderaApi.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace HasderaApi.Controllers
{
    public interface ISlotsController
    {
        Task<IActionResult> CreateSlot([FromBody] CreateSlotRequest request);
        Task<IActionResult> DeleteAllSlots();
        Task<IActionResult> DeleteSlot(int id);
        Task<IActionResult> GetSlot(int id);
        Task<IActionResult> GetSlots();
        Task<IActionResult> UpdateSlot(int id, [FromBody] UpdateSlotRequest request);
    }

    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class SlotsController : ControllerBase, ISlotsController
    {
        private readonly AppDbContext _context;

        public SlotsController(AppDbContext context)
        {
            _context = context;
        }

        // GET /api/Slots - קבלת כל מקומות הפרסום
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetSlots()
        {
            try
            {
                var slots = await _context.Slots
                    .OrderBy(s => s.Code)
                    .ToListAsync();

                return Ok(slots);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ שגיאה בקבלת מקומות פרסום: {ex.Message}");
                return StatusCode(500, new { error = "שגיאה פנימית בשרת", details = ex.Message });
            }
        }

        // GET /api/Slots/{id} - קבלת מקום פרסום ספציפי
        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetSlot(int id)
        {
            try
            {
                var slot = await _context.Slots
                    .Include(s => s.Adplacements)
                    .FirstOrDefaultAsync(s => s.SlotId == id);

                if (slot == null)
                {
                    return NotFound("מקום פרסום לא נמצא");
                }

                return Ok(slot);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ שגיאה בקבלת מקום פרסום: {ex.Message}");
                return StatusCode(500, new { error = "שגיאה פנימית בשרת", details = ex.Message });
            }
        }

        // POST /api/Slots - יצירת מקום פרסום חדש
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateSlot([FromBody] CreateSlotRequest request)
        {
            try
            {
                // בדיקת הרשאות - רק מנהל יכול ליצור מקום פרסום
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

                if (user.Role != "Admin" && user.Role != "admin")
                {
                    return Forbid("רק מנהל יכול ליצור מקום פרסום");
                }

                // בדיקת נתונים
                if (string.IsNullOrWhiteSpace(request.Code))
                {
                    return BadRequest("קוד מקום פרסום הוא שדה חובה");
                }

                if (string.IsNullOrWhiteSpace(request.Name))
                {
                    return BadRequest("שם מקום פרסום הוא שדה חובה");
                }

                // בדיקה שהקוד לא קיים כבר
                var existingSlot = await _context.Slots
                    .FirstOrDefaultAsync(s => s.Code == request.Code);

                if (existingSlot != null)
                {
                    return BadRequest("קוד מקום פרסום כבר קיים");
                }

                // יצירת מקום פרסום חדש
                var slot = new Slot
                {
                    Code = request.Code.Trim(),
                    Name = request.Name.Trim(),
                    BasePrice = request.BasePrice,
                    IsExclusive = request.IsExclusive ?? false
                };

                _context.Slots.Add(slot);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetSlot), new { id = slot.SlotId }, slot);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ שגיאה ביצירת מקום פרסום: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { error = "שגיאה פנימית בשרת", details = ex.Message });
            }
        }

        // PUT /api/Slots/{id} - עדכון מקום פרסום
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSlot(int id, [FromBody] UpdateSlotRequest request)
        {
            try
            {
                // בדיקת הרשאות - רק מנהל יכול לעדכן מקום פרסום
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

                if (user.Role != "Admin" && user.Role != "admin")
                {
                    return Forbid("רק מנהל יכול לעדכן מקום פרסום");
                }

                var slot = await _context.Slots.FindAsync(id);
                if (slot == null)
                {
                    return NotFound("מקום פרסום לא נמצא");
                }

                // בדיקת נתונים
                if (!string.IsNullOrWhiteSpace(request.Code))
                {
                    // בדיקה שהקוד לא קיים כבר (אם שונה)
                    if (request.Code.Trim() != slot.Code)
                    {
                        var existingSlot = await _context.Slots
                            .FirstOrDefaultAsync(s => s.Code == request.Code.Trim() && s.SlotId != id);

                        if (existingSlot != null)
                        {
                            return BadRequest("קוד מקום פרסום כבר קיים");
                        }

                        slot.Code = request.Code.Trim();
                    }
                }

                if (!string.IsNullOrWhiteSpace(request.Name))
                {
                    slot.Name = request.Name.Trim();
                }

                if (request.BasePrice.HasValue)
                {
                    slot.BasePrice = request.BasePrice.Value;
                }

                if (request.IsExclusive.HasValue)
                {
                    slot.IsExclusive = request.IsExclusive.Value;
                }

                await _context.SaveChangesAsync();

                return Ok(slot);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ שגיאה בעדכון מקום פרסום: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { error = "שגיאה פנימית בשרת", details = ex.Message });
            }
        }

        // DELETE /api/Slots/{id} - מחיקת מקום פרסום
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSlot(int id)
        {
            try
            {
                // בדיקת הרשאות - רק מנהל יכול למחוק מקום פרסום
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

                if (user.Role != "Admin" && user.Role != "admin")
                {
                    return Forbid("רק מנהל יכול למחוק מקום פרסום");
                }

                var slot = await _context.Slots
                    .Include(s => s.Adplacements)
                    .FirstOrDefaultAsync(s => s.SlotId == id);

                if (slot == null)
                {
                    return NotFound("מקום פרסום לא נמצא");
                }

                // בדיקה אם יש AdPlacements שמשתמשים במקום הפרסום הזה
                if (slot.Adplacements != null && slot.Adplacements.Any())
                {
                    return BadRequest("לא ניתן למחוק מקום פרסום שיש לו פרסומות פעילות. יש למחוק את הפרסומות קודם.");
                }

                _context.Slots.Remove(slot);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ שגיאה במחיקת מקום פרסום: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { error = "שגיאה פנימית בשרת", details = ex.Message });
            }
        }

        [Authorize]
        [HttpDelete]
        public async Task<IActionResult> DeleteAllSlots()
        {
            try
            {
                // בדיקת הרשאות - רק מנהל יכול למחוק מקומות פרסום
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

                if (user.Role != "Admin" && user.Role != "admin")
                {
                    return Forbid("רק מנהל יכול למחוק מקומות פרסום");
                }

                var slots = await _context.Slots
                    .Include(s => s.Adplacements)
                    .ToListAsync();

                foreach (var slot in slots)
                {
                    // בדיקה אם יש AdPlacements שמשתמשים במקום הפרסום הזה
                    if (slot.Adplacements != null && slot.Adplacements.Any())
                    {
                        return BadRequest("לא ניתן למחוק מקום פרסום שיש לו פרסומות פעילות. יש למחוק את הפרסומות קודם.");
                    }
                }

                _context.Slots.RemoveRange(slots);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ שגיאה במחיקת מקומות פרסום: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { error = "שגיאה פנימית בשרת", details = ex.Message });
            }
        }
    }
}
    // DTOs
    public class CreateSlotRequest
    {
        public string Code { get; set; } = null!;
        public string Name { get; set; } = null!;
        public decimal? BasePrice { get; set; }
        public bool? IsExclusive { get; set; }
    }

    public class UpdateSlotRequest
    {
        public string? Code { get; set; }
        public string? Name { get; set; }
        public decimal? BasePrice { get; set; }
        public bool? IsExclusive { get; set; }
    }


