import { api } from "./api.js";

export async function getChat() {
  console.log("📡 GET /AnalyticsChat");
 
}

export async function sendMessage(queryText, sessionArray) {
    console.log("📡 POST /AnalyticsChat");
    console.log("📡 Query:", queryText);
    console.log("📡 Session:", sessionArray);
    
    // וידוא שה-Query לא ריק
    if (!queryText || !queryText.trim()) {
      throw new Error("השאלה לא יכולה להיות ריקה");
    }
  
    try {
      const requestBody = {
        Query: queryText.trim(),
        Session: sessionArray || []
      };
      
      console.log("📡 Request body:", JSON.stringify(requestBody, null, 2));
      
      const res = await api.post("/AnalyticsChat", requestBody);
  
      console.log("✅ תשובת POST AnalyticsChat:", res.data);
      
      // השרת מחזיר אובייקט, צריך לחלץ את הטקסט
      if (res.data && typeof res.data === 'object') {
        // הסקריפט Python מחזיר {"reply": "..."}
        if (res.data.reply) {
          return res.data.reply;
        }
        // אם השרת מחזיר raw (כשלא מצליח לפרש JSON)
        if (res.data.raw) {
          return res.data.raw;
        }
        // אם יש שדה אחר
        if (res.data.response) {
          return res.data.response;
        }
        if (res.data.answer) {
          return res.data.answer;
        }
        // אם זה string ישירות
        if (typeof res.data === 'string') {
          return res.data;
        }
        // אחרת, נחזיר את כל האובייקט כ-JSON
        return JSON.stringify(res.data, null, 2);
      }
      
      return res.data || "לא התקבלה תשובה";
    } catch (err) {
      console.error("❌ שגיאה ב-POST AnalyticsChat:", err);
      console.error("❌ פרטי השגיאה:", {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        headers: err.response?.headers
      });
      
      // הדפסת כל המידע על השגיאה
      if (err.response?.data) {
        console.error("❌ Response data:", JSON.stringify(err.response.data, null, 2));
      }
      
      // מחזירים הודעת שגיאה ידידותית
      if (err.response?.data?.error) {
        const errorMsg = typeof err.response.data.error === 'string' 
          ? err.response.data.error 
          : JSON.stringify(err.response.data.error);
        throw new Error(errorMsg);
      }
      throw new Error(`שגיאה בתקשורת עם השרת (${err.response?.status || 'unknown'}): ${err.message}`);
    }
  }
  
  
export function handleError(action, err) {
    console.error(`❌ שגיאה ב-${action}:`, err);
    throw err;
  }
  