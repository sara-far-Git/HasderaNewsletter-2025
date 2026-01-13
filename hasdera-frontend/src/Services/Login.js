// src/Services/Login.js
import { api } from "./api";

export async function login(email, password) {
  const res = await api.post("/User/login", { email, password });
  return res.data; // { token, user }
}

export async function register(fullName, email, password, role) {
  const res = await api.post("/User/register", {
    fullName,
    email,
    password,
    role,
  });
  return res.data;
}

export async function loginWithGoogle(idToken) {
  if (!idToken || typeof idToken !== 'string') {
    throw new Error('Invalid Google token provided');
  }
  
  const res = await api.post("/User/google-login", { idToken });
  return res.data;
}

export async function fetchMe() {
  const res = await api.get("/User/me");
  return res.data;
}

export async function forgotPassword(email) {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data;
}

export async function resetPassword(token, newPassword) {
  const res = await api.post("/auth/reset-password", { token, newPassword });
  return res.data;
}

/**
 * קבלת dashboard של מפרסם
 * @returns {Promise<Object>} נתוני dashboard כולל מודעות וסטטיסטיקות
 */
export async function getAdvertiserDashboard() {
  try {
    const res = await api.get("/User/advertiser/dashboard");
    const ads = res.data?.Ads || res.data?.ads || [];
    return {
      ...res.data,
      ads: ads
    };
  } catch (err) {
    console.error("❌ שגיאה בטעינת dashboard:", err);
    // אם זה 404, נחזיר אובייקט ריק במקום לזרוק שגיאה
    if (err.response?.status === 404) {
      console.warn("⚠️ Dashboard endpoint not found, returning empty data");
      return {
        ads: [],
        stats: {}
      };
    }
    throw err;
  }
}