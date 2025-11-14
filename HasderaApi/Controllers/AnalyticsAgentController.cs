using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Text.Json;

namespace HasderaApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnalyticsAgentController : ControllerBase
    {
        [HttpGet("{issueId}")]
        public IActionResult RunAgent(int issueId)
        {
            // הנתיבים למערכת שלך — שימי בדיוק כמו אצלך
            var pythonPath = @"C:\Users\user1\Desktop\Hasdera\HasderaNewsletter-2025\analytics-python\venv\Scripts\python.exe";
            var scriptPath = @"C:\Users\user1\Desktop\Hasdera\HasderaNewsletter-2025\analytics-python\scripts\hasdera_agent.py";

            var psi = new ProcessStartInfo
            {
                FileName = pythonPath,
                Arguments = $"\"{scriptPath}\" {issueId}",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true,
            };

            var process = new Process { StartInfo = psi };
            process.Start();

            string output = process.StandardOutput.ReadToEnd();
            string err = process.StandardError.ReadToEnd();

            process.WaitForExit();

            if (!string.IsNullOrWhiteSpace(err))
            {
                return BadRequest(new { error = err });
            }

            try
            {
                // התוצאה מפייתון היא JSON — אז אנחנו מחזירים JSON
                var result = JsonSerializer.Deserialize<object>(output);
                return Ok(result);
            }
            catch
            {
                // fallback אם זה לא JSON
                return Ok(new { raw = output });
            }
        }
    }
}
