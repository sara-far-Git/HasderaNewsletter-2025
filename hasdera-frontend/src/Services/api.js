// src/services/api.js
import axios from "axios";
import axiosRetry from 'axios-retry';

// יצירת אינסטנס עם baseURL
// שימוש ב-VITE_API_URL אם קיים, אחרת localhost לפיתוח
const getApiBaseUrl = () => {
  // אם יש VITE_API_URL, נשתמש בו
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL;
    // וודא שיש /api בסוף אם לא קיים
    const finalUrl = url.endsWith('/api') ? url : url + '/api';
    console.log('🌐 Using VITE_API_URL:', finalUrl);
    return finalUrl;
  }
  
  // בפיתוח מקומי, נשתמש ב-localhost
  if (import.meta.env.DEV) {
    console.log('🌐 Development mode - using localhost:5055');
    return "http://localhost:5055/api";
  }
  
  // ב-production, נשתמש ב-Render API (גיבוי אם לא הוגדר VITE_API_URL)
  const productionUrl = "https://hasderanewsletter-2025.onrender.com/api";
  console.log('🌐 Production mode - using Render API:', productionUrl);
  console.log('⚠️ VITE_API_URL not set! Please set it in Cloudflare Pages Environment Variables');
  return productionUrl;
};

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: true, // נדרש עבור CORS עם credentials
  timeout: 60000 
});

// ——— REQUEST INTERCEPTOR ———
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hasdera_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ——— RESPONSE INTERCEPTOR ———
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // מונע קריסה במקרה ש-response undefined
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem("hasdera_token");
      localStorage.removeItem("hasdera_user");
    }

    return Promise.reject(error);
  }
);

// ——— Retry Logic ———
axiosRetry(api, { 
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
           error.code === 'ECONNABORTED';
  }
});

// פונקציה מרכזית לטיפול בשגיאות
export function handleError(action, err) {
  console.error(`❌ שגיאה ב-${action}:`, err);
  throw err;
}
