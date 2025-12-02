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
            
            var projectRoot = Path.GetFullPath(Path.Combine(env.ContentRootPath, ".."));
            _pythonScriptPath = Path.Combine(projectRoot, "analytics-python", "scripts", "advertiser_chat_agent.py");
            _pythonWorkingDirectory = Path.Combine(projectRoot, "analytics-python");
            
            if (!System.IO.Directory.Exists(_pythonWorkingDirectory))
            {
                _logger.LogWarning("Python working directory not found: {Dir}, trying alternative path", _pythonWorkingDirectory);
                projectRoot = env.ContentRootPath;
                _pythonScriptPath = Path.Combine(projectRoot, "analytics-python", "scripts", "advertiser_chat_agent.py");
                _pythonWorkingDirectory = Path.Combine(projectRoot, "analytics-python");
            }
            
            _logger.LogInformation("Python script path: {Path}", _pythonScriptPath);
            _logger.LogInformation("Script exists: {Exists}", System.IO.File.Exists(_pythonScriptPath));
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
                if (!System.IO.Directory.Exists(_pythonWorkingDirectory))
                {
                    _logger.LogError("Python working directory not found: {Dir}", _pythonWorkingDirectory);
                    return StatusCode(500, new { error = $"Python working directory not found" });
                }
                
                if (!System.IO.File.Exists(_pythonScriptPath))
                {
                    _logger.LogError("Python script not found at: {Path}", _pythonScriptPath);
                    return StatusCode(500, new { error = $"Python script not found" });
                }

                // מציאת Python
                string pythonCommand = FindPythonCommand();
                
                // בדיקת venv
                var venvPythonPath = Path.Combine(_pythonWorkingDirectory, "venv", "Scripts", "python.exe");
                if (System.IO.File.Exists(venvPythonPath))
                {
                    pythonCommand = venvPythonPath;
                }
                else
                {
                    venvPythonPath = Path.Combine(_pythonWorkingDirectory, "venv", "bin", "python");
                    if (System.IO.File.Exists(venvPythonPath))
                    {
                        pythonCommand = venvPythonPath;
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

                _logger.LogInformation("Starting Python with query: {Query}", request.Query);
                
                using var process = new Process { StartInfo = processInfo };
                
                try
                {
                    process.Start();
                }
                catch (Exception startEx)
                {
                    _logger.LogError(startEx, "Failed to start Python process");
                    return StatusCode(500, new { error = $"Failed to start Python: {startEx.Message}" });
                }

                // בניית JSON לשליחה ל-Python
                var pythonInput = new Dictionary<string, object>
                {
                    ["query"] = request.Query
                };
                
                // הוספת פרופיל משתמש
                if (request.UserProfile != null)
                {
                    var profileDict = new Dictionary<string, object>();
                    
                    if (!string.IsNullOrEmpty(request.UserProfile.BusinessType))
                        profileDict["business_type"] = request.UserProfile.BusinessType;
                    if (!string.IsNullOrEmpty(request.UserProfile.BusinessName))
                        profileDict["business_name"] = request.UserProfile.BusinessName;
                    if (request.UserProfile.PreferredSizes != null && request.UserProfile.PreferredSizes.Count > 0)
                        profileDict["preferred_sizes"] = request.UserProfile.PreferredSizes;
                    if (!string.IsNullOrEmpty(request.UserProfile.BudgetLevel))
                        profileDict["budget"] = request.UserProfile.BudgetLevel;
                    if (request.UserProfile.PastPlacements != null && request.UserProfile.PastPlacements.Count > 0)
                        profileDict["previous_ads"] = request.UserProfile.PastPlacements;
                    if (!string.IsNullOrEmpty(request.UserProfile.TargetAudience))
                        profileDict["target_audience"] = request.UserProfile.TargetAudience;
                    if (!string.IsNullOrEmpty(request.UserProfile.Goals))
                        profileDict["goals"] = request.UserProfile.Goals;
                    if (!string.IsNullOrEmpty(request.UserProfile.Name))
                        profileDict["name"] = request.UserProfile.Name;
                    
                    pythonInput["user_profile"] = profileDict;
                }
                
                // 🔥 הוספת היסטוריית שיחה!
                if (request.History != null && request.History.Count > 0)
                {
                    var historyList = new List<Dictionary<string, object>>();
                    foreach (var msg in request.History)
                    {
                        historyList.Add(new Dictionary<string, object>
                        {
                            ["text"] = msg.Text ?? "",
                            ["isUser"] = msg.IsUser
                        });
                    }
                    pythonInput["history"] = historyList;
                    _logger.LogInformation("Sending {Count} messages in history", request.History.Count);
                }
                
                var pythonInputJson = JsonSerializer.Serialize(pythonInput, new JsonSerializerOptions
                {
                    Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
                });
                
                _logger.LogDebug("Python input: {Input}", pythonInputJson);
                
                await process.StandardInput.WriteLineAsync(pythonInputJson);
                process.StandardInput.Close();

                var output = await process.StandardOutput.ReadToEndAsync();
                var error = await process.StandardError.ReadToEndAsync();

                await process.WaitForExitAsync();
                
                _logger.LogInformation("Python exited with code: {Code}", process.ExitCode);
                
                if (!string.IsNullOrWhiteSpace(error))
                {
                    _logger.LogWarning("Python stderr: {Error}", error);
                }

                if (process.ExitCode != 0)
                {
                    bool hasRealError = !string.IsNullOrWhiteSpace(error) && 
                                       (error.Contains("Error") || 
                                        error.Contains("Traceback") || 
                                        error.Contains("Exception"));

                    if (hasRealError)
                    {
                        _logger.LogError("Python error: {Error}", error);
                        return BadRequest(new { error = $"Python error: {error.Trim()}" });
                    }
                }

                if (string.IsNullOrWhiteSpace(output))
                {
                    _logger.LogError("No output from Python");
                    return BadRequest(new { error = "No output from Python script" });
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
                        return BadRequest(new { error = "Invalid response from Python" });
                    }

                    return Ok(chatResponse);
                }
                catch (JsonException ex)
                {
                    _logger.LogError(ex, "Failed to parse Python output: {Output}", output);
                    return BadRequest(new { error = $"Failed to parse response" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error: {Message}", ex.Message);
                return StatusCode(500, new { error = $"Internal error: {ex.Message}" });
            }
        }
        
        private string FindPythonCommand()
        {
            string pythonCommand = "python";
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
                    if (test == null || test.ExitCode != 0)
                    {
                        pythonCommand = "python3";
                    }
                    test?.WaitForExit();
                }
            }
            catch
            {
                pythonCommand = "python3";
            }
            return pythonCommand;
        }
    }

    // === Models ===
    
    public class ChatRequest
    {
        [JsonPropertyName("query")]
        public string Query { get; set; } = "";
        
        [JsonPropertyName("user_profile")]
        public UserProfile? UserProfile { get; set; }
        
        [JsonPropertyName("history")]
        public List<ChatMessage>? History { get; set; }
    }
    
    public class ChatMessage
    {
        [JsonPropertyName("text")]
        public string? Text { get; set; }
        
        [JsonPropertyName("isUser")]
        public bool IsUser { get; set; }
    }

    public class UserProfile
    {
        [JsonPropertyName("businessType")]
        public string? BusinessType { get; set; }

        [JsonPropertyName("businessName")]
        public string? BusinessName { get; set; }
        
        [JsonPropertyName("name")]
        public string? Name { get; set; }

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
        
        [JsonPropertyName("actions")]
        public List<ChatAction>? Actions { get; set; }
    }
    
    public class ChatAction
    {
        [JsonPropertyName("label")]
        public string? Label { get; set; }
        
        [JsonPropertyName("url")]
        public string? Url { get; set; }
    }
}