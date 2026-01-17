// src/services/creativesService.js
import { api, handleError } from "./api.js";

/**
 * העלאת creative (קובץ מודעה) לשרת
 * @param {File} file - קובץ להעלאה
 * @param {number} [orderId] - מזהה הזמנה (אופציונלי)
 * @returns {Promise<Object>} נתוני ה-creative שנוצר
 */
export async function uploadCreative(file, orderId = null) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (orderId) {
      formData.append('orderId', orderId);
    }

    const res = await api.post("/Creatives/upload", formData);
    
    return res.data;
  } catch (err) {
    handleError("POST Creative upload", err);
    throw err;
  }
}

/**
 * העלאת creative עבור מנהל (הזמנה טלפונית)
 * @param {File} file - קובץ להעלאה
 * @param {number} advertiserId - מזהה מפרסם
 * @param {number} [orderId] - מזהה הזמנה (אופציונלי)
 */
export async function adminUploadCreative(file, advertiserId, orderId = null) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('advertiserId', advertiserId);
    if (orderId) {
      formData.append('orderId', orderId);
    }

    const res = await api.post('/Creatives/admin-upload', formData);

    return res.data;
  } catch (err) {
    handleError('POST Creative admin-upload', err);
    throw err;
  }
}

/**
 * קבלת creatives לפי orderId
 * @param {number} orderId - מזהה הזמנה
 * @returns {Promise<Array>} רשימת creatives
 */
export async function getCreativesByOrder(orderId) {
  try {
    const res = await api.get(`/Creatives/order/${orderId}`);
    return res.data;
  } catch (err) {
    handleError("GET Creatives by order", err);
    throw err;
  }
}

/**
 * מחיקת creative (מודעה)
 * @param {number} creativeId - מזהה ה-creative למחיקה
 * @returns {Promise<Object>} הודעת אישור
 */
export async function deleteCreative(creativeId) {
  try {
    const res = await api.delete(`/Creatives/${creativeId}`);
    return res.data;
  } catch (err) {
    handleError("DELETE Creative", err);
    throw err;
  }
}

/**
 * עדכון creative (מודעה)
 * @param {number} creativeId - מזהה ה-creative לעדכון
 * @param {File} [file] - קובץ חדש (אופציונלי)
 * @returns {Promise<Object>} נתוני ה-creative המעודכן
 */
export async function updateCreative(creativeId, file = null) {
  try {
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }

    const res = await api.put(`/Creatives/${creativeId}`, formData);
    
    return res.data;
  } catch (err) {
    handleError("PUT Creative", err);
    throw err;
  }
}

