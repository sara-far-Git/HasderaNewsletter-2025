/**
 * announcementsService.js
 * שירות לניהול הודעות חגיגיות ומבצעים
 */

import { api } from "./api.js";

/**
 * קבלת כל ההודעות הפעילות (לקוראים)
 */
export const getActiveAnnouncements = async () => {
  try {
    const response = await api.get("/Announcements");
    return response.data;
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return [];
  }
};

/**
 * קבלת כל ההודעות (לניהול)
 */
export const getAllAnnouncements = async () => {
  try {
    const response = await api.get("/Announcements/admin");
    return response.data;
  } catch (error) {
    console.error("Error fetching all announcements:", error);
    throw error;
  }
};

/**
 * קבלת הודעה לפי מזהה
 */
export const getAnnouncementById = async (id) => {
  try {
    const response = await api.get(`/Announcements/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching announcement:", error);
    throw error;
  }
};

/**
 * יצירת הודעה חדשה
 */
export const createAnnouncement = async (data) => {
  try {
    const response = await api.post("/Announcements", data);
    return response.data;
  } catch (error) {
    console.error("Error creating announcement:", error);
    throw error;
  }
};

/**
 * עדכון הודעה
 */
export const updateAnnouncement = async (id, data) => {
  try {
    const response = await api.put(`/Announcements/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating announcement:", error);
    throw error;
  }
};

/**
 * מחיקת הודעה
 */
export const deleteAnnouncement = async (id) => {
  try {
    const response = await api.delete(`/Announcements/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting announcement:", error);
    throw error;
  }
};

/**
 * הפעלה/כיבוי הודעה
 */
export const toggleAnnouncement = async (id) => {
  try {
    const response = await api.patch(`/Announcements/${id}/toggle`);
    return response.data;
  } catch (error) {
    console.error("Error toggling announcement:", error);
    throw error;
  }
};

// סוגי הודעות זמינים
export const ANNOUNCEMENT_TYPES = [
  { value: 'news', label: 'חדשות', icon: '📰', color: '#3b82f6' },
  { value: 'promotion', label: 'מבצע', icon: '🏷️', color: '#f59e0b' },
  { value: 'holiday', label: 'חג', icon: '🎉', color: '#10b981' },
  { value: 'update', label: 'עדכון', icon: '🔔', color: '#8b5cf6' },
];

// צבעי רקע מומלצים
export const BACKGROUND_COLORS = [
  { value: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', label: 'ירוק' },
  { value: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', label: 'כחול' },
  { value: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', label: 'כתום' },
  { value: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', label: 'סגול' },
  { value: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', label: 'אדום' },
  { value: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', label: 'ורוד' },
];

// אייקונים נפוצים
export const ANNOUNCEMENT_ICONS = [
  '🎉', '🎊', '🎁', '🏷️', '📰', '🔔', '⭐', '💫', 
  '🌟', '✨', '🎯', '📢', '💡', '🚀', '❤️', '🎈'
];

