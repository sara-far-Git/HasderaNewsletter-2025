// src/services/analyticsService.js
import { api, handleError } from "./api.js";

export async function getAnalytics() {
  console.log("📡 GET /Analytics");
  try {
    const res = await api.get("/Analytics");
    return res.data;
  } catch (err) {
    handleError("GET Analytics", err);
  }
}

export async function createDemoAnalytics() {
  const demoRecord = {
    clicksTotal: 10,
    uniqueReaders: 5,
    ctr: 0.5,
    reportDate: new Date().toISOString().split("T")[0]
  };

  console.log("📡 POST /Analytics", demoRecord);
  try {
    const res = await api.post("/Analytics", demoRecord);
    return res.data;
  } catch (err) {
    handleError("POST Analytics", err);
  }
}

/**
 * קבלת אנליטיקות למפרסם ספציפי
 * @param {number} advertiserId - מזהה מפרסם
 * @param {number} [days=30] - מספר ימים אחורה
 * @returns {Promise<Object>} אובייקט עם analytics ו-ads
 */
export async function getAdvertiserAnalytics(advertiserId, days = 30) {
  console.log(`📡 GET /Analytics/advertiser/${advertiserId}?days=${days}`);
  
  try {
    const res = await api.get(`/Analytics/advertiser/${advertiserId}`, {
      params: { days }
    });
    return res.data;
  } catch (err) {
    handleError("GET Advertiser Analytics", err);
    throw err;
  }
}

/**
 * קבלת אנליטיקות למודעה ספציפית
 * @param {number} adId - מזהה מודעה
 * @param {number} [issueId] - מזהה גיליון (אופציונלי)
 * @param {number} [days=30] - מספר ימים אחורה
 * @returns {Promise<Array>} רשימת אנליטיקות
 */
export async function getAdAnalytics(adId, issueId = null, days = 30) {
  console.log(`📡 GET /Analytics/ad/${adId}`, { issueId, days });
  
  try {
    const params = { days };
    if (issueId) {
      params.issue_id = issueId;
    }
    
    const res = await api.get(`/Analytics/ad/${adId}`, { params });
    return res.data.analytics || res.data || [];
  } catch (err) {
    handleError("GET Ad Analytics", err);
    throw err;
  }
}