using HasderaApi.Data;
using HasderaApi.Models;
using HasderaApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HasderaApi.Controllers
{
	/// <summary>
	/// ��� API ����� �� ������� ����� Analytics
	/// ����� CRUD (�����, �����, �����, �����)
	/// ��� Endpoint ���� ����� ������ (Insights) ��������
	/// </summary>
	[ApiController]
	[Route("api/[controller]")]
	public class AnalyticsController : ControllerBase
	{
		private readonly AppDbContext _context;
		private readonly AiService _aiService;

		/// <summary>
		/// ���� � ���� �� ��� ������� ������ �-AI
		/// </summary>
		public AnalyticsController(AppDbContext context, AiService aiService)
		{
			_context = context;
			_aiService = aiService;
		}

		/// <summary>
		/// ����� �� �� ������ ����������
		/// GET: /api/analytics
		/// </summary>
		[HttpGet]
		public async Task<ActionResult<IEnumerable<Analytics>>> GetAllAnalytics()
		{
			return await _context.Analytics.ToListAsync();
		}

		/// <summary>
		/// ����� ����� �������� ��� ����
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
		/// ���� ����� �������� ����
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
		/// ����� ����� �������� �����
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
		/// ���� ����� ��������
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
		/// ����� "������" ���� ������� ����� ������� ����� �-AI (���� Mock)
		/// GET: /api/analytics/insights
		/// </summary>
		[HttpGet("insights")]
		public async Task<ActionResult<string>> GetAnalyticsInsights()
		{
			var data = await _context.Analytics.ToListAsync();

			if (!data.Any())
				return "No data available yet";

			// ����� ����� ���� �-AI
			var summary = string.Join("\n", data.Select(d =>
				$"Page={d.page_name}, Clicks={d.clicks}, Views={d.impressions}, Date={d.created_at:yyyy-MM-dd}"));

			// ����� ������ ������ �-AI
			var insights = await _aiService.GetInsightsAsync($"Analyze this data:\n{summary}");

			return Ok(insights);
		}
	}
}
