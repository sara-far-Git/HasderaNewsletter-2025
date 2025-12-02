using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using HasderaApi.Data;
using HasderaApi.Models;
using HasderaApi.Services;
using Google.Apis.Auth;
using Amazon.S3;
using Amazon.S3.Model;

namespace HasderaApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IAuthService _authService;
        private readonly IAmazonS3 _s3;
        private readonly IConfiguration _configuration;

        public UserController(AppDbContext context, IAuthService authService, IAmazonS3 s3, IConfiguration configuration)
        {
            _context = context;
            _authService = authService;
            _s3 = s3;
            _configuration = configuration;
        }

        // 📌 הרשמה
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                return BadRequest("מייל כבר קיים במערכת");

            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                Role = dto.Role,
                PasswordHash = _authService.HashPassword(dto.Password)
            };

            // במידה וזה מפרסם — ניצור עסק
            if (dto.Role == "Advertiser")
            {
                var adv = new Advertiser
                {
                    Name = dto.FullName,
                    Company = dto.FullName,
                    Email = dto.Email
                };

                _context.Advertisers.Add(adv);
                await _context.SaveChangesAsync();

                user.AdvertiserId = adv.AdvertiserId;
            }

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var token = _authService.GenerateJwtToken(user);
            return Ok(new { token, user });
        }

        // 📌 התחברות רגילה
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null) return Unauthorized("משתמש לא נמצא");

            if (!_authService.VerifyPassword(dto.Password, user.PasswordHash))
                return Unauthorized("סיסמה שגויה");

            var token = _authService.GenerateJwtToken(user);
            return Ok(new { token, user });
        }

        // 📌 כניסה עם Google
        [HttpPost("google-login")]
        public async Task<IActionResult> LoginWithGoogle([FromBody] GoogleLoginDto dto, [FromServices] IConfiguration config)
        {
            // לוג לבדיקה שהטוקן הגיע
            Console.WriteLine($"Received Google login request. idToken is null/empty: {string.IsNullOrEmpty(dto.idToken)}");
            Console.WriteLine($"idToken length: {dto.idToken?.Length ?? 0}");
            
            // בדיקה נוספת - אם dto null
            if (dto == null)
            {
                return BadRequest("Request body is required");
            }
            
            if (string.IsNullOrEmpty(dto.idToken))
            {
                return BadRequest("idToken is required");
            }

            var clientId = config["GoogleAuth:ClientId"];
            if (string.IsNullOrEmpty(clientId))
            {
                return BadRequest("GoogleAuth:ClientId not configured");
            }

            // נסה לפענח את הטוקן כדי לראות מה יש בו (ללא validation)
            try
            {
                // נסה לפענח את הטוקן כדי לראות את ה-audience שלו
                var parts = dto.idToken.Split('.');
                if (parts.Length >= 2)
                {
                    // פענוח ה-payload (base64url)
                    var payloadPart = parts[1];
                    // הוסף padding אם צריך
                    var padding = payloadPart.Length % 4;
                    if (padding > 0)
                    {
                        payloadPart += new string('=', 4 - padding);
                    }
                    payloadPart = payloadPart.Replace('-', '+').Replace('_', '/');
                    var payloadBytes = Convert.FromBase64String(payloadPart);
                    var payloadJson = System.Text.Encoding.UTF8.GetString(payloadBytes);
                    Console.WriteLine($"Token payload (decoded): {payloadJson}");
                }
            }
            catch (Exception decodeEx)
            {
                Console.WriteLine($"Could not decode token for inspection: {decodeEx.Message}");
            }

            // בדיקת זמן השרת
            var serverTime = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            Console.WriteLine($"Server UTC time (Unix): {serverTime}");
            Console.WriteLine($"Server UTC time (DateTime): {DateTimeOffset.UtcNow:yyyy-MM-dd HH:mm:ss} UTC");
            
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { clientId },
                // טולרנטיות זמן - מאפשר הבדל של עד 10 דקות בין השרת למחשב של המשתמש
                // הגדלנו ל-10 דקות כדי לכסות גם את ה-nbf (Not Before)
                ExpirationTimeClockTolerance = TimeSpan.FromMinutes(10),
                IssuedAtClockTolerance = TimeSpan.FromMinutes(10)
            };

            GoogleJsonWebSignature.Payload payload;

            try
            {
                // לוג לבדיקה
                Console.WriteLine($"Attempting to validate Google token. ClientId: {clientId}");
                Console.WriteLine($"Token length: {dto.idToken?.Length ?? 0}");
                Console.WriteLine($"Token preview: {dto.idToken?.Substring(0, Math.Min(50, dto.idToken?.Length ?? 0))}...");
                
                payload = await GoogleJsonWebSignature.ValidateAsync(dto.idToken, settings);
                
                Console.WriteLine($"Token validated successfully. Email: {payload.Email}, Name: {payload.Name}");
            }
            catch (InvalidJwtException jwtEx)
            {
                // לוג מפורט לשגיאת JWT
                Console.WriteLine($"❌ Google JWT validation error:");
                Console.WriteLine($"   Type: {jwtEx.GetType().Name}");
                Console.WriteLine($"   Message: {jwtEx.Message}");
                Console.WriteLine($"   Inner exception: {jwtEx.InnerException?.Message}");
                Console.WriteLine($"   ClientId used: {clientId}");
                Console.WriteLine($"   Token length: {dto.idToken?.Length ?? 0}");
                
                // החזרת שגיאה מפורטת יותר
                var errorMessage = $"Google token validation failed: {jwtEx.Message}";
                if (jwtEx.InnerException != null)
                {
                    errorMessage += $" ({jwtEx.InnerException.Message})";
                }
                return BadRequest(errorMessage);
            }
            catch (Exception ex)
            {
                // לוג מפורט לשגיאה כללית
                Console.WriteLine($"❌ Google token validation error:");
                Console.WriteLine($"   Type: {ex.GetType().Name}");
                Console.WriteLine($"   Message: {ex.Message}");
                Console.WriteLine($"   Inner exception: {ex.InnerException?.Message}");
                Console.WriteLine($"   Stack trace: {ex.StackTrace}");
                Console.WriteLine($"   ClientId used: {clientId}");
                Console.WriteLine($"   Token length: {dto.idToken?.Length ?? 0}");
                
                // החזרת שגיאה מפורטת יותר
                var errorMessage = $"Google token validation failed: {ex.Message}";
                if (ex.InnerException != null)
                {
                    errorMessage += $" ({ex.InnerException.Message})";
                }
                return BadRequest(errorMessage);
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == payload.Email);

            if (user == null)
            {
                user = new User
                {
                    FullName = payload.Name,
                    Email = payload.Email,
                    GoogleId = payload.Subject,
                    Role = "Advertiser", // ⚠️ כל הברנץ' הזה מיועד למפרסמים בלבד
                    PasswordHash = "" // כי אין סיסמה מקומית
                };

                // במידה וזה מפרסם — ניצור עסק
                var adv = new Advertiser
                {
                    Name = payload.Name,
                    Company = payload.Name,
                    Email = payload.Email
                };

                _context.Advertisers.Add(adv);
                await _context.SaveChangesAsync();

                user.AdvertiserId = adv.AdvertiserId;

                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }
            else if (user.Role != "Advertiser")
            {
                // אם המשתמש קיים אבל לא מפרסם, נחזיר שגיאה
                return Unauthorized("רק מפרסמים יכולים להיכנס למערכת");
            }

            var token = _authService.GenerateJwtToken(user);
            return Ok(new { token, user });
        }

        // 📌 קבלת פרטי המשתמש הנוכחי
        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized("לא מאומת");
            }

            var user = await _context.Users
                .Include(u => u.Advertiser)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return NotFound("משתמש לא נמצא");

            return Ok(user);
        }

        // 📌 איזור אישי של מפרסם
        [Authorize(Roles = "Advertiser")]
        [HttpGet("advertiser/dashboard")]
        public async Task<IActionResult> GetAdvertiserDashboard()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return Unauthorized("לא מאומת");
                }

                var user = await _context.Users
                   .Include(a => a.Advertiser)
                   .FirstOrDefaultAsync(u => u.Id == userId);
                
                // ניקוי ה-collections מה-Advertiser כדי למנוע circular references ב-serialization
                if (user?.Advertiser != null)
                {
                    user.Advertiser.Adorders = null;
                    user.Advertiser.Ads = null;
                    user.Advertiser.AdvertiserPackages = null;
                    user.Advertiser.Advertisercontacts = null;
                    user.Advertiser.Packages = null;
                    user.Advertiser.Payments = null;
                }

                if (user == null || user.AdvertiserId == null)
                {
                    return BadRequest("לא נמצא עסק");
                }

                // קבלת כל ה-Orders של המפרסם עם Creatives
                var orders = await _context.AdOrders
                    .Include(o => o.Creatives)
                    .Where(o => o.AdvertiserId == user.AdvertiserId)
                    .OrderByDescending(o => o.OrderDate ?? DateOnly.MinValue)
                    .ToListAsync();

                // קבלת AdPlacements (אם יש)
                var adPlacements = await _context.AdPlacements
                    .Include(x => x.Order)
                    .Include(x => x.Slot)
                    .Where(x => x.Order.AdvertiserId == user.AdvertiserId)
                    .OrderByDescending(x => x.StartDate ?? DateOnly.MinValue)
                    .ToListAsync();
                
                // טעינת Creatives בנפרד לכל Order
                foreach (var placement in adPlacements)
                {
                    if (placement.Order != null)
                    {
                        await _context.Entry(placement.Order)
                            .Collection(o => o.Creatives)
                            .LoadAsync();
                    }
                }

                // בניית רשימה משולבת של כל המודעות עם תאריך למיון
                var adsWithDate = new List<(object ad, DateOnly sortDate)>();
                
                // הוספת AdPlacements (מודעות עם מיקום)
                foreach (var placement in adPlacements)
                {
                    var sortDate = placement.StartDate ?? placement.Order?.OrderDate ?? DateOnly.MinValue;
                    var creative = placement.Order?.Creatives?.FirstOrDefault();
                    adsWithDate.Add((new
                    {
                        adplacementId = placement.AdplacementId,
                        orderId = placement.OrderId,
                        slotId = placement.SlotId,
                        slot = placement.Slot != null ? new
                        {
                            slotId = placement.Slot.SlotId,
                            name = placement.Slot.Name,
                            code = placement.Slot.Code
                        } : null,
                        startDate = placement.StartDate?.ToString(),
                        endDate = placement.EndDate?.ToString(),
                        order = placement.Order != null ? new
                        {
                            orderId = placement.Order.OrderId,
                            orderDate = placement.Order.OrderDate?.ToString(),
                            status = placement.Order.Status
                        } : null,
                        creative = creative != null ? new
                        {
                            creativeId = creative.CreativeId,
                            fileUrl = GetFileUrl(creative.FileUrl),
                            createdAt = creative.CreatedAt.HasValue ? creative.CreatedAt.Value.ToString("yyyy-MM-ddTHH:mm:ss") : null
                        } : null,
                        hasPlacement = true
                    }, sortDate));
                }
                
                // הוספת Orders עם Creatives שאין להם AdPlacement (מודעות ללא מיקום עדיין)
                var ordersWithPlacements = adPlacements.Select(ap => ap.OrderId).ToHashSet();
                
                foreach (var order in orders)
                {
                    // אם אין AdPlacement ל-order הזה, נוסיף את ה-creatives שלו
                    if (!ordersWithPlacements.Contains(order.OrderId) && order.Creatives != null && order.Creatives.Any())
                    {
                        var sortDate = order.OrderDate ?? DateOnly.MinValue;
                        foreach (var creative in order.Creatives)
                        {
                            adsWithDate.Add((new
                            {
                                creativeId = creative.CreativeId,
                                orderId = order.OrderId,
                                order = new
                                {
                                    orderId = order.OrderId,
                                    orderDate = order.OrderDate?.ToString(),
                                    status = order.Status
                                },
                                creative = new
                                {
                                    creativeId = creative.CreativeId,
                                    fileUrl = GetFileUrl(creative.FileUrl),
                                    createdAt = creative.CreatedAt.HasValue ? creative.CreatedAt.Value.ToString("yyyy-MM-ddTHH:mm:ss") : null
                                },
                                hasPlacement = false,
                                status = "pending_placement" // ממתין לבחירת מיקום
                            }, sortDate));
                        }
                    }
                }
                
                // מיון לפי תאריך
                var sortedAds = adsWithDate
                    .OrderByDescending(x => x.sortDate)
                    .Take(50)
                    .Select(x => x.ad)
                    .ToList();

                // יצירת אובייקט Business ללא circular references
                object businessData = null;
                if (user.Advertiser != null)
                {
                    try
                    {
                        businessData = new
                        {
                            advertiserId = user.Advertiser.AdvertiserId,
                            name = user.Advertiser.Name ?? "",
                            company = user.Advertiser.Company ?? "",
                            email = user.Advertiser.Email ?? "",
                            phone = user.Advertiser.Phone ?? "",
                            joinDate = user.Advertiser.JoinDate.HasValue ? user.Advertiser.JoinDate.Value.ToString() : null
                        };
                    }
                    catch
                    {
                        businessData = new
                        {
                            advertiserId = user.Advertiser.AdvertiserId,
                            name = "",
                            company = "",
                            email = "",
                            phone = "",
                            joinDate = (string?)null
                        };
                    }
                }

                return Ok(new
                {
                    Business = businessData,
                    Ads = sortedAds
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "שגיאה בטעינת נתוני הדשבורד", details = ex.Message });
            }
        }

        // 📌 רק מנהל יכול לראות את כל המשתמשים
        [Authorize(Policy = "AdminOnly")]
        [HttpGet("all")]
        public async Task<IActionResult> GetAllUsers()
        {
            return Ok(await _context.Users.ToListAsync());
        }

        // פונקציה עזר ליצירת pre-signed URL או החזרת URL קיים
        private string GetFileUrl(string? fileUrl)
        {
            if (string.IsNullOrEmpty(fileUrl) || fileUrl.StartsWith("pending-upload-"))
            {
                return fileUrl ?? "";
            }

            // אם זה כבר pre-signed URL (מכיל signature), נחזיר אותו כמו שהוא
            if (fileUrl.Contains("X-Amz-Signature") || fileUrl.Contains("AWSAccessKeyId"))
            {
                return fileUrl;
            }

            // אם זה URL רגיל של S3, ניצור pre-signed URL
            try
            {
                var bucketName = _configuration["S3:Bucket"] ?? "hasdera-issues";
                if (fileUrl.Contains(bucketName) && fileUrl.Contains("s3.eu-north-1.amazonaws.com"))
                {
                    // חילוץ ה-key מה-URL
                    var uri = new Uri(fileUrl);
                    var s3Key = uri.AbsolutePath.TrimStart('/');
                    
                    // בדיקה שה-key לא ריק
                    if (string.IsNullOrEmpty(s3Key))
                    {
                        return fileUrl;
                    }
                    
                    var request = new GetPreSignedUrlRequest
                    {
                        BucketName = bucketName,
                        Key = s3Key,
                        Verb = HttpVerb.GET,
                        Expires = DateTime.UtcNow.AddDays(7)
                    };
                    
                    var preSignedUrl = _s3.GetPreSignedURL(request);
                    
                    // בדיקה שה-URL נוצר בהצלחה
                    if (!string.IsNullOrEmpty(preSignedUrl))
                    {
                        return preSignedUrl;
                    }
                }
            }
            catch (Exception ex)
            {
                // אם יש שגיאה, נחזיר את ה-URL המקורי
                // אפשר להוסיף logging כאן אם צריך
            }

            // אם משהו לא עבד, נחזיר את ה-URL המקורי
            return fileUrl;
        }
    }
}
