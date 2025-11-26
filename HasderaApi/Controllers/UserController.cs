using Google.Apis.Auth;
using HasderaApi.Data;
using HasderaApi.Models;
using HasderaApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HasderaApi.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IAuthService _authService;
        private readonly IConfiguration _config;

        public UserController(AppDbContext context, IAuthService authService, IConfiguration config)
        {
            _context = context;
            _authService = authService;
            _config = config;
        }

        // ========== Google Login ==========
        [HttpPost("google")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginDto dto)
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { _config["GoogleAuth:ClientId"] }
            };

            GoogleJsonWebSignature.Payload payload;

            try
            {
                payload = await GoogleJsonWebSignature.ValidateAsync(dto.idToken, settings);
            }
            catch
            {
                return BadRequest("Invalid Google token");
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == payload.Email);

            if (user == null)
            {
                user = new User
                {
                    FullName = payload.Name,
                    Email = payload.Email,
                    GoogleId = payload.Subject,
                    Role = "Subscriber"
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }

            var token = _authService.GenerateJwtToken(user);

            return Ok(new { token, user });
        }

        // ========== Register ==========
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                return BadRequest("Email already exists");

            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                PasswordHash = _authService.HashPassword(dto.Password),
                Role = dto.Role ?? "User"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var token = _authService.GenerateJwtToken(user);

            return Ok(new { token, user });
        }

        // ========== Login ==========
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null) return Unauthorized("Wrong email or password");

            if (!_authService.VerifyPassword(dto.Password, user.PasswordHash))
                return Unauthorized("Wrong email or password");

            var token = _authService.GenerateJwtToken(user);
            return Ok(new { token, user });
        }

        // ========== Me ==========
        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            var idStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(idStr, out int id))
                return Unauthorized();

            var user = await _context.Users.FindAsync(id);
            if (user == null) return Unauthorized();

            return Ok(user);
        }
    }
}
