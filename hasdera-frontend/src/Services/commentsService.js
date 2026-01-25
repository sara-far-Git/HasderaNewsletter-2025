import { api } from "./api.js";

// קבלת כל התגובות למדור
export async function getSectionComments(sectionId) {
  try {
    const res = await api.get(`/Sections/${sectionId}/comments`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error("❌ שגיאה ב-GET Section Comments:", err);
    // אם אין endpoint עדיין, נחזיר מערך ריק
    if (err.response?.status === 404) {
      return [];
    }
    throw err;
  }
}

// הוספת תגובה למדור
export async function addSectionComment(sectionId, comment) {
  try {
    const res = await api.post(`/Sections/${sectionId}/comments`, {
      content: comment.content,
      parentCommentId: comment.parentCommentId || null, // לתגובות משנה
    });
    return res.data;
  } catch (err) {
    console.error("❌ שגיאה ב-POST Section Comment:", err);
    throw err;
  }
}

// עדכון תגובה
export async function updateComment(commentId, content) {
  try {
    const res = await api.put(`/Comments/${commentId}`, { content });
    return res.data;
  } catch (err) {
    console.error("❌ שגיאה ב-PUT Comment:", err);
    throw err;
  }
}

// מחיקת תגובה
export async function deleteComment(commentId) {
  try {
    const res = await api.delete(`/Comments/${commentId}`);
    return res.data;
  } catch (err) {
    console.error("❌ שגיאה ב-DELETE Comment:", err);
    throw err;
  }
}

// קבלת תגובות למאמר ספציפי (אם יש)
export async function getArticleComments(articleId) {
  try {
    const res = await api.get(`/Articles/${articleId}/comments`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error("❌ שגיאה ב-GET Article Comments:", err);
    if (err.response?.status === 404) {
      return [];
    }
    throw err;
  }
}

// הוספת תגובה למאמר
export async function addArticleComment(articleId, comment) {
  try {
    const res = await api.post(`/Articles/${articleId}/comments`, {
      content: comment.content,
      parentCommentId: comment.parentCommentId || null,
    });
    return res.data;
  } catch (err) {
    console.error("❌ שגיאה ב-POST Article Comment:", err);
    throw err;
  }
}
