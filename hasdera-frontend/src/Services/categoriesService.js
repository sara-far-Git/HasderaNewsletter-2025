import { api } from "./api.js";

// 📂 קבלת כל המדורים
export async function getCategories() {
  try {
    const res = await api.get("/Categories");
    console.log(`📂 getCategories - Found ${res.data?.length || 0} categories`);
    return res.data || [];
  } catch (err) {
    console.error("❌ שגיאה ב-GET Categories:", err);
    return [];
  }
}

// 📂 קבלת מדור לפי ID
export async function getCategoryById(id) {
  try {
    const res = await api.get(`/Categories/${id}`);
    return res.data;
  } catch (err) {
    console.error(`❌ שגיאה ב-GET Category ${id}:`, err);
    throw err;
  }
}

// 📂 יצירת מדור חדש
export async function createCategory(name) {
  try {
    const res = await api.post("/Categories", { name });
    console.log(`✅ Created category: ${name}`);
    return res.data;
  } catch (err) {
    console.error("❌ שגיאה ב-POST Category:", err);
    // Handle conflict (duplicate name)
    if (err.response?.status === 409) {
      throw new Error("מדור עם שם זה כבר קיים");
    }
    throw err;
  }
}

// 📂 עדכון מדור
export async function updateCategory(id, name) {
  try {
    const res = await api.put(`/Categories/${id}`, { name });
    console.log(`✅ Updated category ${id}: ${name}`);
    return res.data;
  } catch (err) {
    console.error(`❌ שגיאה ב-PUT Category ${id}:`, err);
    // Handle conflict (duplicate name)
    if (err.response?.status === 409) {
      throw new Error("מדור עם שם זה כבר קיים");
    }
    throw err;
  }
}

// 📂 מחיקת מדור
export async function deleteCategory(id) {
  try {
    const res = await api.delete(`/Categories/${id}`);
    console.log(`✅ Deleted category ${id}`);
    return res.data;
  } catch (err) {
    console.error(`❌ שגיאה ב-DELETE Category ${id}:`, err);
    throw err;
  }
}

// 📂 קבלת כתבות של מדור
export async function getCategoryArticles(id) {
  try {
    const res = await api.get(`/Categories/${id}/articles`);
    return res.data || [];
  } catch (err) {
    console.error(`❌ שגיאה ב-GET Category Articles ${id}:`, err);
    return [];
  }
}
