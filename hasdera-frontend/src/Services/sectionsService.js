import { api } from "./api.js";

// קבלת כל המאמרים במדור
export async function getSectionArticles(sectionId, page = 1, pageSize = 20) {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    const res = await api.get(`/Sections/${sectionId}/articles?${params.toString()}`);
    
    // טיפול בפורמטים שונים של תשובה
    if (res.data && res.data.items && Array.isArray(res.data.items)) {
      return res.data.items;
    }
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error("❌ שגיאה ב-GET Section Articles:", err);
    if (err.response?.status === 404) {
      return [];
    }
    throw err;
  }
}

// קבלת פרטי מדור
export async function getSection(sectionId) {
  try {
    const res = await api.get(`/Sections/${sectionId}`);
    return res.data;
  } catch (err) {
    console.error("❌ שגיאה ב-GET Section:", err);
    throw err;
  }
}

// קבלת כל המדורים
export async function getAllSections() {
  try {
    const res = await api.get(`/Sections`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error("❌ שגיאה ב-GET All Sections:", err);
    // אם אין endpoint, נחזיר את המדורים הקבועים
    return [
      { id: 'recipes', name: 'מתכונים' },
      { id: 'health', name: 'בריאות' },
      { id: 'community', name: 'קהילה' },
      { id: 'home', name: 'בית ומשפחה' },
      { id: 'tips', name: 'טיפים' },
      { id: 'culture', name: 'תרבות' },
    ];
  }
}
