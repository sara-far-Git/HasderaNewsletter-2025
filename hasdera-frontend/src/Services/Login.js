// src/Services/Login.js
import { api } from "./api";

// עוטף שגיאות עם הודעות ידידותיות למשתמש
function wrapLoginError(error, defaultMsg) {
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    const customError = new Error('השרת לא מגיב. נסה שוב מאוחר יותר.');
    customError.isTimeout = true;
    customError.originalError = error;
    throw customError;
  }
  if (error.code === 'ERR_NETWORK' || !error.response) {
    const customError = new Error('בעיית חיבור לשרת. בדוק את חיבור האינטרנט.');
    customError.isNetwork = true;
    customError.originalError = error;
    throw customError;
  }
  throw error;
}

export async function login(email, password) {
  try {
    const res = await api.post("/User/login", { email, password });
    return res.data; // { token, user }
  } catch (error) {
    wrapLoginError(error, 'שגיאה בהתחברות');
  }
}

export async function register(fullName, email, password, role) {
  try {
    const res = await api.post("/User/register", {
      fullName,
      email,
      password,
      role,
    });
    return res.data;
  } catch (error) {
    wrapLoginError(error, 'שגיאה בהרשמה');
  }
}

export async function loginWithGoogle(idToken) {
  if (!idToken || typeof idToken !== 'string') {
    throw new Error('לא התקבל טוקן מגוגל');
  }

  try {
    const res = await api.post("/User/google-login", { idToken });
    return res.data;
  } catch (error) {
    wrapLoginError(error, 'שגיאה בהתחברות עם גוגל');
  }
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
    throw err;
  }
}