namespace HasderaApi.Services
{
    /// <summary>
    /// שירות המדמה חיבור ל-AI לצורך הפקת תובנות מתוך נתוני אנליטיקות
    /// בעתיד נוכל להחליף את ה-Mock הזה בקריאה אמיתית ל-OpenAI API או שירות AI אחר
    /// </summary>
    public class AiService
    {
        /// <summary>
        /// מקבל טקסט (Prompt) שמכיל את הנתונים הגולמיים,
        /// ומחזיר מחרוזת עם "תובנות" – כרגע מדובר במימוש מדומה (Mock)
        /// </summary>
        /// <param name="prompt">טקסט שמתאר את הנתונים</param>
        /// <returns>תובנות בסיסיות מטקסט הנתונים</returns>
        public async Task<string> GetInsightsAsync(string prompt)
        {
            // מחכים מעט כדי לדמות קריאה לשרת חיצוני
            await Task.Delay(200);

            // מחזירים תשובה בסיסית (כרגע Mock)
            return $"[AI MOCK] Insights generated for prompt: {prompt.Substring(0, Math.Min(120, prompt.Length))}...";
        }
    }
}
