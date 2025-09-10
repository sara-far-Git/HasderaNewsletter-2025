using HasderaApi.Data;
using HasderaApi.Models;
using HasderaApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HasderaApi.Controllers
{
	/// <summary>
	/// בקר API שמנהל את הנתונים בטבלת Analytics
	/// מאפשר CRUD (יצירה, קריאה, עדכון, מחיקה)
	/// וגם Endpoint נוסף לקבלת תובנות (Insights) מהנתונים
	/// </summary>
	[ApiController]
	[Route("api/[controller]")]
	public class AnalyticsController : ControllerBase
	{
		private readonly AppDbContext _context;
		private readonly AiService _aiService;

		/// <summary>
		/// בנאי – מקבל את מסד הנתונים ושירות ה-AI
		/// </summary>
		public AnalyticsController(AppDbContext context, AiService aiService)
		{
			_context = context;
			_aiService = aiService;
		}

		/// <summary>
		/// מחזיר את כל רשומות האנליטיקות
		/// GET: /api/analytics
		/// </summary>
		[HttpGet]
		public async Task<ActionResult<IEnumerable<Analytics>>> GetAllAnalytics()
		{
			return await _context.Analytics.ToListAsync();
		}

		/// <summary>
		/// מחזיר רשומת אנליטיקה לפי מזהה
		/// GET: /api/analytics/{id}
		/// </summary>
		[HttpGet("{id}")]
		public async Task<ActionResult<Analytics>> GetAnalyticsById(int id)
		{
			var analytics = await _context.Analytics.FindAsync(id);
			if (analytics == null)
				return NotFound();

			return analytics;
		}

		/// <summary>
		/// יוצר רשומת אנליטיקה חדשה
		/// POST: /api/analytics
		/// </summary>
		[HttpPost]
		public async Task<ActionResult<Analytics>> CreateAnalytics(Analytics analytics)
		{
			_context.Analytics.Add(analytics);
			await _context.SaveChangesAsync();

			return CreatedAtAction(nameof(GetAnalyticsById), new { id = analytics.analytics_id }, analytics);
		}

		/// <summary>
		/// מעדכן רשומת אנליטיקה קיימת
		/// PUT: /api/analytics/{id}
		/// </summary>
		[HttpPut("{id}")]
		public async Task<IActionResult> UpdateAnalytics(int id, Analytics analytics)
		{
			if (id != analytics.analytics_id)
				return BadRequest();

			_context.Entry(analytics).State = EntityState.Modified;

			try
			{
				await _context.SaveChangesAsync();
			}
			catch (DbUpdateConcurrencyException)
			{
				if (!_context.Analytics.Any(e => e.analytics_id == id))
					return NotFound();

				throw;
			}

			return NoContent();
		}

		/// <summary>
		/// מוחק רשומת אנליטיקה
		/// DELETE: /api/analytics/{id}
		/// </summary>
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

		/// <summary>
		/// מחזיר "תובנות" מתוך הנתונים בטבלה באמצעות שירות ה-AI (כרגע Mock)
		/// GET: /api/analytics/insights
		/// </summary>
		[HttpGet("insights")]
		public async Task<ActionResult<string>> GetAnalyticsInsights()
		{
			var data = await _context.Analytics.ToListAsync();

			if (!data.Any())
				return "No data available yet";

			// יצירת סיכום קריא ל-AI
			var summary = string.Join("\n", data.Select(d =>
				$"Page={d.page_name}, Clicks={d.clicks}, Views={d.impressions}, Date={d.created_at:yyyy-MM-dd}"));

			// שליחת הסיכום לשירות ה-AI
			var insights = await _aiService.GetInsightsAsync($"Analyze this data:\n{summary}");

			return Ok(insights);
		}
	}
}
