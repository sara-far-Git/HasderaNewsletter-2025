using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HasderaApi.Data;
using HasderaApi.Models;
using Amazon.S3;
using Amazon.S3.Model;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using System.IO;

namespace HasderaApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class CreativesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IAmazonS3 _s3;
        private readonly IConfiguration _configuration;

        public CreativesController(AppDbContext context, IAmazonS3 s3, IConfiguration configuration)
        {
            _context = context;
            _s3 = s3;
            _configuration = configuration;
        }

        // POST /api/creatives/upload
        [Authorize]
        [HttpPost("upload")]
        public async Task<IActionResult> UploadCreative(IFormFile file, int? orderId = null)
        {
            try
            {
                // קבלת userId מה-JWT token
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return Unauthorized("לא מאומת");
                }

                // מציאת user ואז advertiser דרך AdvertiserId
                var user = await _context.Users
                    .Include(u => u.Advertiser)
                    .FirstOrDefaultAsync(u => u.Id == userId);
                
                if (user == null || user.AdvertiserId == null)
                {
                    return NotFound("מפרסם לא נמצא");
                }

                var advertiser = user.Advertiser;
                if (advertiser == null)
                {
                    advertiser = await _context.Advertisers
                        .FirstOrDefaultAsync(a => a.AdvertiserId == user.AdvertiserId);
                    
                    if (advertiser == null)
                    {
                        return NotFound("מפרסם לא נמצא");
                    }
                }

                if (file == null || file.Length == 0)
                {
                    return BadRequest("קובץ לא הועלה");
                }

                // בדיקת סוג קובץ
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".pdf", ".gif", ".webp" };
                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(fileExtension))
                {
                    return BadRequest("סוג קובץ לא נתמך. אנא העלה תמונה (jpg, png, gif, webp) או PDF");
                }

                // יצירת order אם לא קיים
                Adorder order;
                if (orderId.HasValue && orderId.Value > 0)
                {
                    order = await _context.AdOrders
                        .FirstOrDefaultAsync(o => o.OrderId == orderId.Value && o.AdvertiserId == advertiser.AdvertiserId);
                    if (order == null)
                    {
                        return NotFound("הזמנה לא נמצאה");
                    }
                }
                else
                {
                    // מציאת package קיים למפרסם או יצירת אחד חדש
                    var existingPackage = await _context.Packages
                        .FirstOrDefaultAsync(p => p.AdvertiserId == advertiser.AdvertiserId);
                    
                    int packageId;
                    if (existingPackage != null)
                    {
                        packageId = existingPackage.PackageId;
                    }
                    else
                    {
                        var newPackage = new Package
                        {
                            AdvertiserId = advertiser.AdvertiserId,
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
                    order = new Adorder
                    {
                        AdvertiserId = advertiser.AdvertiserId,
                        PackageId = packageId,
                        OrderDate = DateOnly.FromDateTime(DateTime.UtcNow),
                        Status = "pending"
                    };
                    _context.AdOrders.Add(order);
                    await _context.SaveChangesAsync();
                }

                // העלאת קובץ ל-S3
                string fileUrl;
                try
                {
                    var bucketName = _configuration["S3:Bucket"] ?? "hasdera-issues";
                    var prefix = "creatives/";
                    var fileName = $"{Guid.NewGuid()}{fileExtension}";
                    var s3Key = $"{prefix}{fileName}";

                    using var fileStream = file.OpenReadStream();
                    var putRequest = new PutObjectRequest
                    {
                        BucketName = bucketName,
                        Key = s3Key,
                        InputStream = fileStream,
                        ContentType = file.ContentType ?? "application/octet-stream",
                        ServerSideEncryptionMethod = ServerSideEncryptionMethod.AES256
                    };

                    await _s3.PutObjectAsync(putRequest);

                    // יצירת pre-signed URL (תוקף 7 ימים)
                    var generatePreSignedUrls = _configuration.GetValue<bool>("GeneratePreSignedUrls", true);
                    if (generatePreSignedUrls)
                    {
                        var request = new GetPreSignedUrlRequest
                        {
                            BucketName = bucketName,
                            Key = s3Key,
                            Verb = HttpVerb.GET,
                            Expires = DateTime.UtcNow.AddDays(7)
                        };
                        fileUrl = _s3.GetPreSignedURL(request);
                    }
                    else
                    {
                        fileUrl = $"https://{bucketName}.s3.eu-north-1.amazonaws.com/{s3Key}";
                    }
                }
                catch
                {
                    fileUrl = $"pending-upload-{Guid.NewGuid()}";
                }

                // יצירת Creative במסד הנתונים
                var creative = new Creative
                {
                    OrderId = order.OrderId,
                    FileUrl = fileUrl,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Creatives.Add(creative);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    creativeId = creative.CreativeId,
                    orderId = order.OrderId,
                    fileUrl = fileUrl,
                    fileName = file.FileName
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "שגיאה בהעלאת הקובץ", details = ex.Message });
            }
        }

        // GET /api/creatives/order/{orderId}
        [Authorize]
        [HttpGet("order/{orderId}")]
        public async Task<IActionResult> GetCreativesByOrder(int orderId)
        {
            try
            {
                var creatives = await _context.Creatives
                    .Where(c => c.OrderId == orderId)
                    .ToListAsync();

                return Ok(creatives);
            }
            catch
            {
                return StatusCode(500, new { error = "שגיאה בשליפת נתונים" });
            }
        }

        // DELETE /api/creatives/{creativeId}
        [Authorize]
        [HttpDelete("{creativeId}")]
        public async Task<IActionResult> DeleteCreative(int creativeId)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return Unauthorized("לא מאומת");
                }

                var user = await _context.Users
                    .Include(u => u.Advertiser)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null || user.AdvertiserId == null)
                {
                    return NotFound("מפרסם לא נמצא");
                }

                var creative = await _context.Creatives
                    .Include(c => c.Order)
                    .FirstOrDefaultAsync(c => c.CreativeId == creativeId);

                if (creative == null)
                {
                    return NotFound("מודעה לא נמצאה");
                }

                // בדיקה שהמודעה שייכת למפרסם המחובר
                if (creative.Order?.AdvertiserId != user.AdvertiserId)
                {
                    return Forbid("אין הרשאה למחוק מודעה זו");
                }

                _context.Creatives.Remove(creative);
                await _context.SaveChangesAsync();

                return Ok(new { message = "מודעה נמחקה בהצלחה" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "שגיאה במחיקת מודעה", details = ex.Message });
            }
        }

        // PUT /api/creatives/{creativeId}
        [Authorize]
        [HttpPut("{creativeId}")]
        public async Task<IActionResult> UpdateCreative(int creativeId, IFormFile? file)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return Unauthorized("לא מאומת");
                }

                var user = await _context.Users
                    .Include(u => u.Advertiser)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null || user.AdvertiserId == null)
                {
                    return NotFound("מפרסם לא נמצא");
                }

                var creative = await _context.Creatives
                    .Include(c => c.Order)
                    .FirstOrDefaultAsync(c => c.CreativeId == creativeId);

                if (creative == null)
                {
                    return NotFound("מודעה לא נמצאה");
                }

                // בדיקה שהמודעה שייכת למפרסם המחובר
                if (creative.Order?.AdvertiserId != user.AdvertiserId)
                {
                    return Forbid("אין הרשאה לערוך מודעה זו");
                }

                // אם הועלה קובץ חדש, נעדכן אותו
                if (file != null && file.Length > 0)
                {
                    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".pdf", ".gif", ".webp" };
                    var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                    if (!allowedExtensions.Contains(fileExtension))
                    {
                        return BadRequest("סוג קובץ לא נתמך");
                    }

                    // העלאת קובץ חדש ל-S3
                    string fileUrl;
                    try
                    {
                        var bucketName = _configuration["S3:Bucket"] ?? "hasdera-issues";
                        var prefix = "creatives/";
                        var fileName = $"{Guid.NewGuid()}{fileExtension}";
                        var s3Key = $"{prefix}{fileName}";

                        using var fileStream = file.OpenReadStream();
                        var putRequest = new PutObjectRequest
                        {
                            BucketName = bucketName,
                            Key = s3Key,
                            InputStream = fileStream,
                            ContentType = file.ContentType ?? "application/octet-stream",
                            ServerSideEncryptionMethod = ServerSideEncryptionMethod.AES256
                        };

                        await _s3.PutObjectAsync(putRequest);

                        var generatePreSignedUrls = _configuration.GetValue<bool>("GeneratePreSignedUrls", true);
                        if (generatePreSignedUrls)
                        {
                            var request = new GetPreSignedUrlRequest
                            {
                                BucketName = bucketName,
                                Key = s3Key,
                                Verb = HttpVerb.GET,
                                Expires = DateTime.UtcNow.AddDays(7)
                            };
                            fileUrl = _s3.GetPreSignedURL(request);
                        }
                        else
                        {
                            fileUrl = $"https://{bucketName}.s3.eu-north-1.amazonaws.com/{s3Key}";
                        }

                        creative.FileUrl = fileUrl;
                        creative.CreatedAt = DateTime.UtcNow;
                    }
                    catch
                    {
                        return StatusCode(500, new { error = "שגיאה בהעלאת קובץ" });
                    }
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    creativeId = creative.CreativeId,
                    orderId = creative.OrderId,
                    fileUrl = creative.FileUrl
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "שגיאה בעדכון מודעה", details = ex.Message });
            }
        }
    }
}

