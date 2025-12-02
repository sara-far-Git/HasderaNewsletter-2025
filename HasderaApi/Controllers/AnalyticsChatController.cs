/*
 * AnalyticsChatController.cs
 * 
 * זהו ה-Controller שמטפל בבקשות צ'אט אנליטיקות.
 * הוא מקבל שאלות מהמשתמש, מעביר אותן לסקריפט Python שמשתמש ב-AI,
 * ומחזיר את התשובה למשתמש.
 */

using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace HasderaApi.Controllers
{
    // [ApiController] - אומר ל-ASP.NET שזה API controller
    // [Route("api/[controller]")] - מגדיר את הנתיב: /api/AnalyticsChat
    [ApiController]
    [Route("api/[controller]")]
    public class AnalyticsChatController : ControllerBase
    {
        // [HttpPost] - מגדיר שזה endpoint שמקבל POST requests
        // [FromBody] - אומר שהנתונים יגיעו בגוף הבקשה (JSON)
        [HttpPost]
        public IActionResult Chat([FromBody] ChatRequest request)
        {
            try
            {
                // ============================================================
                // שלב 1: בדיקת תקינות הבקשה
                // ============================================================
                
                // מדפיסים לוג כדי לראות מה התקבל (לדיבוג)
                Console.WriteLine($"📥 Received request: Query='{request?.Query}', Session count={request?.Session?.Count ?? 0}");
                
                // בודקים שהבקשה לא null (ריקה)
                if (request == null)
                {
                    Console.WriteLine("❌ Request is null");
                    return BadRequest(new { error = "Request body is null" });
                }
                
                // בודקים שיש שאלה (Query) ולא ריק
                if (string.IsNullOrWhiteSpace(request.Query))
                {
                    Console.WriteLine("❌ Query is null or empty");
                    return BadRequest(new { error = "Query is required and cannot be empty" });
                }

                // ============================================================
                // שלב 2: הגדרת נתיבים לסקריפט Python
                // ============================================================
                
                // הנתיב הבסיסי לתיקיית Python
                var basePath = @"C:\Users\user1\Desktop\Hasdera\HasderaNewsletter-2025\analytics-python";
                // הנתיב לקובץ Python עצמו (ב-venv)
                var pythonPath = Path.Combine(basePath, @"venv\Scripts\python.exe");
                // הנתיב לסקריפט Python שאנחנו רוצים להריץ
                var scriptPath = Path.Combine(basePath, @"scripts\hasdera_chat_agent.py");

                // ============================================================
                // שלב 3: המרת הבקשה ל-JSON כדי לשלוח לפייתון
                // ============================================================
                
                // ממירים את הבקשה (request) ל-JSON string
                var payload = JsonSerializer.Serialize(request);

                // ============================================================
                // שלב 4: הגדרת תהליך Python
                // ============================================================
                
                // יוצרים הגדרות להרצת תהליך Python
                var psi = new ProcessStartInfo
                {
                    FileName = pythonPath,                    // הנתיב לקובץ Python
                    Arguments = $"\"{scriptPath}\"",          // הסקריפט שאנחנו רוצים להריץ
                    WorkingDirectory = basePath,              // תיקיית העבודה - חשוב כדי ש-dotenv ימצא את קובץ .env
                    RedirectStandardInput = true,             // מאפשרים לשלוח נתונים לפייתון (stdin)
                    RedirectStandardOutput = true,           // מאפשרים לקרוא את הפלט של Python (stdout)
                    RedirectStandardError = true,             // מאפשרים לקרוא שגיאות/לוגים של Python (stderr)
                    UseShellExecute = false,                  // לא להשתמש ב-shell (יותר בטוח)
                    CreateNoWindow = true,                    // לא לפתוח חלון חדש
                    StandardOutputEncoding = Encoding.UTF8,   // encoding UTF-8 לפלט (לתמיכה בעברית)
                    StandardErrorEncoding = Encoding.UTF8      // encoding UTF-8 לשגיאות (לתמיכה בעברית)
                };

                // יוצרים תהליך חדש ומתחילים אותו
                var process = new Process();
                process.StartInfo = psi;
                process.Start();

                // ============================================================
                // שלב 5: שליחת הנתונים לפייתון
                // ============================================================
                
                // שולחים את ה-JSON לפייתון דרך stdin (קלט סטנדרטי)
                process.StandardInput.WriteLine(payload);
                // סוגרים את ה-input כדי שה-Python יידע שסיימנו לשלוח
                process.StandardInput.Close();

                // ============================================================
                // שלב 6: קריאת התשובה מה-Python
                // ============================================================
                
                // קוראים את כל הפלט מה-Python (stdout - זה התשובה)
                string output = process.StandardOutput.ReadToEnd();
                // קוראים את כל הלוגים/שגיאות מה-Python (stderr)
                string error = process.StandardError.ReadToEnd();

                // מחכים שהתהליך יסתיים
                process.WaitForExit();

                // ============================================================
                // שלב 7: ניקוי ובדיקת התשובה
                // ============================================================
                
                // מסירים רווחים מיותרים מהתחלה ומהסוף
                output = output?.Trim();
                error = error?.Trim();

                // מדפיסים לוגים לדיבוג
                Console.WriteLine($"📤 Python output: {output}");
                Console.WriteLine($"⚠️ Python stderr: {error}");
                Console.WriteLine($"🔢 Exit code: {process.ExitCode}");

                // בודקים את קוד היציאה (exit code)
                // 0 = הצלחה, כל מספר אחר = שגיאה
                if (process.ExitCode != 0)
                {
                    Console.WriteLine($"❌ Python script exited with code {process.ExitCode}");
                    return BadRequest(new { error = $"Python script error (exit code {process.ExitCode}): {error ?? "Unknown error"}" });
                }
                
                // ============================================================
                // חשוב: בודקים את הפלט קודם - אם יש פלט תקין, לא נחזיר שגיאה על לוגים
                // ============================================================
                
                // בודקים שיש פלט מה-Python
                if (!string.IsNullOrWhiteSpace(output))
                {
                    // יש פלט תקין - נמשיך הלאה גם אם יש לוגים DEBUG
                    // לוגים DEBUG הם רק מידע, לא שגיאה
                    if (!string.IsNullOrWhiteSpace(error) && error.Trim().StartsWith("DEBUG"))
                    {
                        Console.WriteLine($"ℹ️ Python script completed successfully with DEBUG logs: {error}");
                        // נמשיך הלאה - הפלט תקין, הלוגים הם רק מידע
                    }
                    // נמשיך לשלב פענוח ה-JSON
                }
                else
                {
                    // אין פלט - זה בעיה
                    // בודקים אם יש שגיאה אמיתית או רק לוגים
                    bool hasRealError = false;
                    bool hasOnlyDebugLogs = false;
                    
                    if (!string.IsNullOrWhiteSpace(error))
                    {
                        // בודקים אם זה רק לוגים DEBUG (לא שגיאה)
                        hasOnlyDebugLogs = error.Trim().StartsWith("DEBUG") && 
                                          !error.Contains("Error") && 
                                          !error.Contains("Traceback") && 
                                          !error.Contains("Exception");
                        
                        // בודקים אם זה נראה כמו שגיאה אמיתית (מכיל מילות מפתח של שגיאות)
                        hasRealError = (error.Contains("Error") && !error.StartsWith("DEBUG")) ||
                                      error.Contains("Traceback") ||
                                      error.Contains("Exception") ||
                                      error.Contains("Traceback (most recent call last)") ||
                                      error.Contains("File \"");
                        
                        if (hasRealError)
                        {
                            Console.WriteLine($"❌ Python script error detected in stderr: {error}");
                            return BadRequest(new { error = $"Python script error: {error}" });
                        }
                    }
                    
                    // אין פלט - נחזיר שגיאה
                    if (hasOnlyDebugLogs)
                    {
                        Console.WriteLine($"⚠️ Python script returned no output but has DEBUG logs: {error}");
                        return BadRequest(new { error = $"Python script returned no output. Debug logs: {error}" });
                    }
                    else
                    {
                        Console.WriteLine("❌ Python script returned no output");
                        return BadRequest(new { error = "Python script returned no output" });
                    }
                }

                // ============================================================
                // שלב 8: פענוח התשובה מה-Python
                // ============================================================
                
                // מנסים לפענח את התשובה כ-JSON
                try
                {
                    // הגדרות לפענוח JSON:
                    var options = new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true,              // לא רגיש לאותיות גדולות/קטנות
                        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping  // מאפשר תווים בעברית
                    };
                    // ממירים את ה-JSON לאובייקט C#
                    var result = JsonSerializer.Deserialize<ChatResponse>(output, options);
                    // מחזירים את התשובה למשתמש (200 OK)
                    return Ok(result);
                }
                catch (Exception jsonEx)
                {
                    // אם נכשלנו לפענח JSON, מדפיסים שגיאה ומחזירים את הפלט הגולמי
                    Console.WriteLine($"⚠️ JSON parsing error: {jsonEx.Message}");
                    Console.WriteLine($"Raw output: {output}");
                    // מחזירים את הפלט הגולמי (fallback)
                    return Ok(new { raw = output });
                }
            }
            catch (Exception ex)
            {
                // אם קרתה שגיאה כללית שלא תפסנו, מחזירים שגיאה 500
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }

    // ============================================================
    // מחלקות (Classes) להעברת נתונים
    // ============================================================

    /// <summary>
    /// מחלקה שמייצגת את הבקשה מהמשתמש
    /// </summary>
    public class ChatRequest
    {
        // השאלה שהמשתמש שואל
        [JsonPropertyName("Query")]
        public string Query { get; set; } = "";
        
        // היסטוריית השיחה (כל ההודעות הקודמות)
        [JsonPropertyName("Session")]
        public List<ChatMessage> Session { get; set; } = new();
    }

    /// <summary>
    /// מחלקה שמייצגת הודעה אחת בצ'אט
    /// </summary>
    public class ChatMessage
    {
        // התפקיד: "user" (משתמש) או "assistant" (AI)
        [JsonPropertyName("Role")]
        public string Role { get; set; } = "";
        
        // התוכן של ההודעה
        [JsonPropertyName("Content")]
        public string Content { get; set; } = "";
    }

    /// <summary>
    /// מחלקה שמייצגת את התשובה מה-Python
    /// </summary>
    public class ChatResponse
    {
        // התשובה מה-AI
        [JsonPropertyName("reply")]
        public string Reply { get; set; } = "";
    }
}
