import { api } from "./api.js";

// 📚 קבלת כל הגיליונות האחרונים
export async function getIssues() {
  try {
    const res = await api.get("/issues");
    return res.data.items;
  } catch (err) {
    console.error("❌ שגיאה ב-GET Issues:", err);
    throw err;
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
  
  
