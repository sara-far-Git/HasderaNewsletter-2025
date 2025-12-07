/**
 * advertiserChatService.js
 * שירות לתקשורת עם ה-API של הצ'אט למפרסמים
 */

import { api } from './api';

/**
 * שליחת הודעה לצ'אט
 * @param {string} query - ההודעה מהמשתמש
 * @param {object|null} userProfile - פרופיל המפרסם (אופציונלי)
 * @param {array|null} history - היסטוריית השיחה (אופציונלי)
 * @returns {Promise<{reply: string, actions?: array}>}
 */
export async function sendAdvertiserMessage(query, userProfile = null, history = null) {
  try {
    const requestBody = {
      query: query
    };

    // הוספת פרופיל אם קיים
    if (userProfile) {
      requestBody.user_profile = {
        businessType: userProfile.businessType || userProfile.business_type,
        businessName: userProfile.businessName || userProfile.business_name,
        name: userProfile.name || userProfile.contactName,
        budgetLevel: userProfile.budgetLevel || userProfile.budget,
        targetAudience: userProfile.targetAudience,
        goals: userProfile.goals,
        preferredSizes: userProfile.preferredSizes,
        pastPlacements: userProfile.pastPlacements || userProfile.previousAds
      };
    }

    // 🔥 הוספת היסטוריית שיחה!
    if (history && history.length > 0) {
      requestBody.history = history.map(msg => ({
        text: msg.text,
        isUser: msg.isUser
      }));
    }

    // שימוש ב-api instance שכבר מוגדר עם baseURL ו-interceptors
    // ה-baseURL כבר כולל /api, אז צריך רק /AdvertiserChat
    const response = await api.post(
      '/AdvertiserChat',
      requestBody,
      {
        timeout: 30000 // 30 שניות timeout
      }
    );

    return response.data;

  } catch (error) {
    console.error('❌ Error sending message:', error);
    
    // טיפול בשגיאות ספציפיות
    if (error.response) {
      // השרת החזיר שגיאה
      throw {
        message: error.response.data?.error || 'שגיאה מהשרת',
        status: error.response.status,
        response: error.response
      };
    } else if (error.request) {
      // הבקשה נשלחה אבל אין תשובה
      throw {
        message: 'לא ניתן להתחבר לשרת',
        status: 0
      };
    } else {
      // שגיאה אחרת
      throw {
        message: error.message || 'שגיאה לא צפויה',
        status: -1
      };
    }
  }
}

/**
 * בדיקת חיבור לשרת
 * @returns {Promise<boolean>}
 */
export async function checkConnection() {
  try {
    await api.get('/health', { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

export default {
  sendAdvertiserMessage,
  checkConnection
};