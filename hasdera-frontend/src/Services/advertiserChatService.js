// src/services/advertiserChatService.js
import { api, handleError } from "./api.js";

/**
 * שולח שאילתה ל-Advertiser Chat Assistant
 * @param {string} query - השאילתה של המשתמש
 * @param {Object|null} userProfile - פרופיל מפרסם (אופציונלי)
 * @returns {Promise<string>} התשובה מה-Assistant
 */
export async function sendAdvertiserMessage(query, userProfile = null) {
  console.log("📡 POST /AdvertiserChat", { query, userProfile });
  try {
    const requestBody = { query };
    
    // הוספת user_profile אם קיים
    if (userProfile) {
      requestBody.user_profile = userProfile;
    }
    
    const res = await api.post("/AdvertiserChat", requestBody);
    return res.data.reply || "מצטער, לא קיבלתי תשובה.";
  } catch (err) {
    handleError("POST AdvertiserChat", err);
    throw err;
  }
}

