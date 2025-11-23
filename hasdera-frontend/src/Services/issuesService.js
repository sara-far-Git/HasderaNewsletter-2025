import { api } from "./api.js";

// 📚 קבלת כל הגיליונות האחרונים
export async function getIssues() {
  try {
    const res = await api.get("/Issues");
    // ה-API מחזיר PagedResult עם items
    if (res.data && res.data.items) {
      return res.data.items;
    }
    // אם אין items, נחזיר את הנתונים ישירות (תואם לאחור)
    return res.data || [];
  } catch (err) {
    console.error("❌ שגיאה ב-GET Issues:", err);
    // במקרה של שגיאה, נחזיר מערך ריק במקום לזרוק שגיאה
    console.error("פרטי השגיאה:", err.response?.data || err.message);
    return [];
  }
}

// יצירת גיליון חדש
export async function createIssue(issue) {
  try {
    const res = await api.post("/issues", issue);
    return res.data;
  } catch (err) {
    console.error("❌ שגיאה ב-POST Issue:", err);
    throw err;
  }
}
// קבלת קובץ PDF לפי ID
export async function getIssuePdf(id) {
  try {
    const res = await api.get(`/issues/${id}/pdf`, {
      responseType: "blob", // חשוב! כדי שהקובץ יגיע כ-Binary ולא כטקסט
    });
    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    return url;
  } catch (err) {
    console.error("❌ שגיאה ב-GET Issue PDF:", err);
    throw err;
  }
}

// קבלת גיליון לפי ID
export async function getIssueById(id) {
  try {
    const res = await api.get(`/issues/${id}`);
    return res.data;
  } catch (err) {
    console.error("❌ שגיאה ב-GET Issue by ID:", err);
    throw err;
  }
}
  
  
