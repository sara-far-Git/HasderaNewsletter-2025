import api from './api';

// קבלת כל הקטגוריות
export const getSections = async () => {
  const response = await api.get('/sections');
  return response.data;
};

// קבלת קטגוריה ספציפית
export const getSection = async (id) => {
  const response = await api.get(`/sections/${id}`);
  return response.data;
};

// יצירת קטגוריה חדשה (Admin)
export const createSection = async (sectionData) => {
  const response = await api.post('/sections', sectionData);
  return response.data;
};

// עדכון קטגוריה (Admin)
export const updateSection = async (id, sectionData) => {
  const response = await api.put(`/sections/${id}`, sectionData);
  return response.data;
};

// מחיקת קטגוריה (Admin)
export const deleteSection = async (id) => {
  const response = await api.delete(`/sections/${id}`);
  return response.data;
};

// קבלת תוכן של קטגוריה
export const getSectionContents = async (sectionId, publishedOnly = true) => {
  const response = await api.get(`/sections/${sectionId}/contents`, {
    params: { publishedOnly }
  });
  return response.data;
};

// קבלת תוכן ספציפי
export const getContent = async (contentId) => {
  const response = await api.get(`/sections/contents/${contentId}`);
  return response.data;
};

// יצירת תוכן חדש (Admin)
export const createContent = async (sectionId, contentData) => {
  const response = await api.post(`/sections/${sectionId}/contents`, contentData);
  return response.data;
};

// עדכון תוכן (Admin)
export const updateContent = async (contentId, contentData) => {
  const response = await api.put(`/sections/contents/${contentId}`, contentData);
  return response.data;
};

// מחיקת תוכן (Admin)
export const deleteContent = async (contentId) => {
  const response = await api.delete(`/sections/contents/${contentId}`);
  return response.data;
};

// הוספת תגובה
export const addComment = async (contentId, commentData) => {
  const response = await api.post(`/sections/contents/${contentId}/comments`, commentData);
  return response.data;
};

// קבלת תגובות
export const getComments = async (contentId) => {
  const response = await api.get(`/sections/contents/${contentId}/comments`);
  return response.data;
};

// הוספת/הסרת לייק
export const toggleLike = async (contentId) => {
  const response = await api.post(`/sections/contents/${contentId}/like`);
  return response.data;
};

