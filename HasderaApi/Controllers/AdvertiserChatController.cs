using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;

namespace HasderaApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdvertiserChatController : ControllerBase
    {
        private readonly ILogger<AdvertiserChatController> _logger;
        private readonly string _pythonScriptPath;
        private readonly string _pythonWorkingDirectory;

        public AdvertiserChatController(ILogger<AdvertiserChatController> logger, IWebHostEnvironment env)
        {
            _logger = logger;
            
            // נתיב לסקריפט Python
            // ContentRootPath הוא תיקיית HasderaApi, אז צריך לעלות רמה אחת למעלה
            var projectRoot = Path.GetFullPath(Path.Combine(env.ContentRootPath, ".."));
            _pythonScriptPath = Path.Combine(projectRoot, "analytics-python", "scripts", "advertiser_chat_agent.py");
            _pythonWorkingDirectory = Path.Combine(projectRoot, "analytics-python");
            
            // בדיקה שהתיקייה קיימת
            if (!System.IO.Directory.Exists(_pythonWorkingDirectory))
            {
                _logger.LogWarning("Python working directory not found: {Dir}, trying alternative path", _pythonWorkingDirectory);
                // ניסיון חלופי - אולי ContentRootPath כבר בתיקיית הפרויקט
                projectRoot = env.ContentRootPath;
                _pythonScriptPath = Path.Combine(projectRoot, "analytics-python", "scripts", "advertiser_chat_agent.py");
                _pythonWorkingDirectory = Path.Combine(projectRoot, "analytics-python");
            }
            
            // לוגים לבדיקה
            _logger.LogInformation("ContentRootPath: {Path}", env.ContentRootPath);
            _logger.LogInformation("Project root: {Path}", projectRoot);
            _logger.LogInformation("Python script path: {Path}", _pythonScriptPath);
            _logger.LogInformation("Python working directory: {Dir}", _pythonWorkingDirectory);
            _logger.LogInformation("Script exists: {Exists}", System.IO.File.Exists(_pythonScriptPath));
            _logger.LogInformation("Working directory exists: {Exists}", System.IO.Directory.Exists(_pythonWorkingDirectory));
        }

        [HttpPost]
        public async Task<IActionResult> Chat([FromBody] ChatRequest request)
        {
            if (string.IsNullOrWhiteSpace(request?.Query))
            {
                return BadRequest(new { error = "Query is required" });
            }

            try
            {
                // בדיקה שהתיקייה קיימת
                if (!System.IO.Directory.Exists(_pythonWorkingDirectory))
                {
                    _logger.LogError("Python working directory not found: {Dir}", _pythonWorkingDirectory);
                    return StatusCode(500, new { error = $"Python working directory not found: {_pythonWorkingDirectory}" });
                }
                
                // בדיקה שהסקריפט קיים
                if (!System.IO.File.Exists(_pythonScriptPath))
                {
                    _logger.LogError("Python script not found at: {Path}", _pythonScriptPath);
                    return StatusCode(500, new { error = $"Python script not found at: {_pythonScriptPath}" });
                }

                // הפעלת סקריפט Python
                // ניסיון למצוא את Python - קודם python, אחר כך python3
                // ב-Windows, בדרך כלל זה "python"
                string pythonCommand = "python";
                
                // בדיקה אם python קיים
                try
                {
                    var testProcess = new ProcessStartInfo
                    {
                        FileName = "python",
                        Arguments = "--version",
                        UseShellExecute = false,
                        RedirectStandardOutput = true,
                        RedirectStandardError = true,
                        CreateNoWindow = true
                    };
                    using (var test = Process.Start(testProcess))
                    {
                        if (test == null)
                        {
                            pythonCommand = "python3";
                        }
                        else
                        {
                            test.WaitForExit();
                            if (test.ExitCode != 0)
                            {
                                pythonCommand = "python3";
                            }
                        }
                    }
                }
                catch
                {
                    pythonCommand = "python3";
                }
                
                _logger.LogInformation("Detected Python command: {Command}", pythonCommand);

                // בדיקה אם יש venv - אם כן, נשתמש ב-Python מה-venv
                var venvPythonPath = Path.Combine(_pythonWorkingDirectory, "venv", "Scripts", "python.exe");
                if (System.IO.File.Exists(venvPythonPath))
                {
                    pythonCommand = venvPythonPath;
                    _logger.LogInformation("Using venv Python: {Path}", pythonCommand);
                }
                else
                {
                    // בדיקה אם יש venv ב-Linux/Mac
                    venvPythonPath = Path.Combine(_pythonWorkingDirectory, "venv", "bin", "python");
                    if (System.IO.File.Exists(venvPythonPath))
                    {
                        pythonCommand = venvPythonPath;
                        _logger.LogInformation("Using venv Python: {Path}", pythonCommand);
                    }
                }

                var processInfo = new ProcessStartInfo
                {
                    FileName = pythonCommand,
                    Arguments = $"\"{_pythonScriptPath}\"",
                    WorkingDirectory = _pythonWorkingDirectory,
                    UseShellExecute = false,
                    RedirectStandardInput = true,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    CreateNoWindow = true,
                    StandardOutputEncoding = Encoding.UTF8,
                    StandardErrorEncoding = Encoding.UTF8
                };
                
                _logger.LogInformation("Using Python command: {Command}", pythonCommand);

                _logger.LogInformation("Starting Python process with query: {Query}", request.Query);
                _logger.LogInformation("Python script path: {Path}", _pythonScriptPath);
                _logger.LogInformation("Working directory: {Dir}", _pythonWorkingDirectory);
                
                using var process = new Process { StartInfo = processInfo };
                
                try
                {
                    process.Start();
                }
                catch (Exception startEx)
                {
                    _logger.LogError(startEx, "Failed to start Python process");
                    return StatusCode(500, new { 
                        error = $"Failed to start Python process: {startEx.Message}",
                        pythonCommand = pythonCommand,
                        scriptPath = _pythonScriptPath,
                        workingDirectory = _pythonWorkingDirectory
                    });
                }

                // בניית JSON לשליחה ל-Python (עם query ו-user_profile אם יש)
                var pythonInput = new Dictionary<string, object>
                {
                    ["query"] = request.Query
                };
                
                if (request.UserProfile != null)
                {
                    var profileDict = new Dictionary<string, object>();
                    
                    if (!string.IsNullOrEmpty(request.UserProfile.BusinessType))
                        profileDict["businessType"] = request.UserProfile.BusinessType;
                    if (!string.IsNullOrEmpty(request.UserProfile.BusinessName))
                        profileDict["businessName"] = request.UserProfile.BusinessName;
                    if (request.UserProfile.PreferredSizes != null && request.UserProfile.PreferredSizes.Count > 0)
                        profileDict["preferredSizes"] = request.UserProfile.PreferredSizes;
                    if (!string.IsNullOrEmpty(request.UserProfile.BudgetLevel))
                        profileDict["budgetLevel"] = request.UserProfile.BudgetLevel;
                    if (request.UserProfile.PastPlacements != null && request.UserProfile.PastPlacements.Count > 0)
                        profileDict["pastPlacements"] = request.UserProfile.PastPlacements;
                    if (!string.IsNullOrEmpty(request.UserProfile.TargetAudience))
                        profileDict["targetAudience"] = request.UserProfile.TargetAudience;
                    if (!string.IsNullOrEmpty(request.UserProfile.StylePreference))
                        profileDict["stylePreference"] = request.UserProfile.StylePreference;
                    if (!string.IsNullOrEmpty(request.UserProfile.Goals))
                        profileDict["goals"] = request.UserProfile.Goals;
                    if (!string.IsNullOrEmpty(request.UserProfile.SpecialRequests))
                        profileDict["specialRequests"] = request.UserProfile.SpecialRequests;
                    
                    pythonInput["user_profile"] = profileDict;
                }
                
                var pythonInputJson = JsonSerializer.Serialize(pythonInput, new JsonSerializerOptions
                {
                    Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
                });
                
                // שליחת ה-JSON ל-Python
                await process.StandardInput.WriteLineAsync(pythonInputJson);
                process.StandardInput.Close();

                // קריאת פלט
                var output = await process.StandardOutput.ReadToEndAsync();
                var error = await process.StandardError.ReadToEndAsync();

                await process.WaitForExitAsync();
                
                _logger.LogInformation("Python process exited with code: {Code}", process.ExitCode);
                _logger.LogInformation("Python output length: {Length}", output?.Length ?? 0);
                _logger.LogInformation("Python error length: {Length}", error?.Length ?? 0);
                if (!string.IsNullOrWhiteSpace(error))
                {
                    _logger.LogWarning("Python stderr: {Error}", error);
                }

                // בדיקת שגיאות
                if (process.ExitCode != 0)
                {
                    // בדיקה אם זו שגיאה אמיתית או רק DEBUG logs
                    bool hasRealError = !string.IsNullOrWhiteSpace(error) && 
                                       (error.Contains("Error") || 
                                        error.Contains("Traceback") || 
                                        error.Contains("Exception") ||
                                        (!error.Trim().StartsWith("DEBUG") && error.Length > 10));

                    if (hasRealError)
                    {
                        _logger.LogError("Python script error (exit code {Code}): {Error}", process.ExitCode, error);
                        return BadRequest(new { error = $"Python script error: {error.Trim()}" });
                    }
                    else if (!string.IsNullOrWhiteSpace(error))
                    {
                        _logger.LogWarning("Python script warning (exit code {Code}): {Error}", process.ExitCode, error);
                    }
                }

                // ניסיון לפרסר JSON
                if (string.IsNullOrWhiteSpace(output))
                {
                    _logger.LogError("No output from Python script. Exit code: {Code}, Error: {Error}", process.ExitCode, error);
                    if (!string.IsNullOrWhiteSpace(error))
                    {
                        return BadRequest(new { error = $"No output from Python script. Error: {error.Trim()}" });
                    }
                    return BadRequest(new { error = "No output from Python script. Please check the Python script and ensure it outputs JSON." });
                }

                try
                {
                    var options = new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true,
                        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
                    };

                    var chatResponse = JsonSerializer.Deserialize<ChatResponse>(output, options);
                    
                    if (chatResponse == null || string.IsNullOrWhiteSpace(chatResponse.Reply))
                    {
                        return BadRequest(new { error = "Invalid response from Python script" });
                    }

                    return Ok(chatResponse);
                }
                catch (JsonException ex)
                {
                    _logger.LogError(ex, "Failed to parse Python output as JSON");
                    return BadRequest(new { error = $"Failed to parse response: {output}" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing Python script: {Message}\nStackTrace: {StackTrace}", ex.Message, ex.StackTrace);
                return StatusCode(500, new { 
                    error = $"Internal server error: {ex.Message}",
                    details = ex.StackTrace,
                    pythonScriptPath = _pythonScriptPath,
                    pythonWorkingDirectory = _pythonWorkingDirectory
                });
            }
        }
    }

    public class ChatRequest
    {
        [JsonPropertyName("query")]
        public string Query { get; set; } = "";
        
        [JsonPropertyName("user_profile")]
        public UserProfile? UserProfile { get; set; }
    }

    public class UserProfile
    {
        [JsonPropertyName("businessType")]
        public string? BusinessType { get; set; }

        [JsonPropertyName("businessName")]
        public string? BusinessName { get; set; }

        [JsonPropertyName("preferredSizes")]
        public List<string>? PreferredSizes { get; set; }

        [JsonPropertyName("budgetLevel")]
        public string? BudgetLevel { get; set; }

        [JsonPropertyName("pastPlacements")]
        public List<object>? PastPlacements { get; set; }

        [JsonPropertyName("targetAudience")]
        public string? TargetAudience { get; set; }

        [JsonPropertyName("stylePreference")]
        public string? StylePreference { get; set; }

        [JsonPropertyName("goals")]
        public string? Goals { get; set; }

        [JsonPropertyName("specialRequests")]
        public string? SpecialRequests { get; set; }
    }

    public class ChatResponse
    {
        [JsonPropertyName("reply")]
        public string Reply { get; set; } = "";
    }
}

