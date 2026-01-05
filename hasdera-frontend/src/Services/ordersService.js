// src/services/ordersService.js
import { api, handleError } from "./api.js";

/**
 * יצירת הזמנה ידנית על ידי מנהל
 * @param {Object} orderData - נתוני ההזמנה
 * @param {number} orderData.advertiserId - ID של המפרסם
 * @param {number} orderData.issueId - ID של הגיליון
 * @param {number} orderData.slotId - ID של מקום הפרסום
 * @param {Object} orderData.placement - נתוני המיקום והגודל
 * @param {string} orderData.placement.size - גודל המודעה ('full', 'half', 'quarter')
 * @param {Array<number>} orderData.placement.quarters - רבעים שנבחרו
 * @returns {Promise<Object>} ההזמנה שנוצרה
 */
export async function createManualOrder(orderData) {
  console.log("📡 POST /api/Orders/manual", orderData);
  try {
    const res = await api.post("/Orders/manual", orderData);
    return res.data;
  } catch (err) {
    handleError("POST Manual Order", err);
    throw err;
  }
}

/**
 * קבלת רשימת הזמנות
 * @param {number} advertiserId - ID של המפרסם (אופציונלי)
 * @returns {Promise<Array>} רשימת הזמנות
 */
export async function getOrders(advertiserId = null) {
  console.log("📡 GET /api/Orders", advertiserId);
  try {
    const url = advertiserId ? `/Orders?advertiserId=${advertiserId}` : "/Orders";
    const res = await api.get(url);
    return res.data;
  } catch (err) {
    handleError("GET Orders", err);
    throw err;
  }
}

