// src/services/api.js
import axios from "axios";
import axiosRetry from 'axios-retry';

const DEFAULT_PROD_API_BASEURL = "https://hasderanewsletter-2025.onrender.com/api";
const DEFAULT_DEV_API_BASEURL = "http://localhost:5055/api";

// יצירת אינסטנס עם baseURL
// שימוש ב-VITE_API_URL אם קיים, אחרת localhost לפיתוח
const getApiBaseUrl = () => {
  console.log('🔍 getApiBaseUrl called');
  console.log('🔍 window.location.hostname:', window.location.hostname);
  console.log('🔍 import.meta.env.VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.log('🔍 import.meta.env.DEV:', import.meta.env.DEV);
  console.log('🔍 import.meta.env.MODE:', import.meta.env.MODE);
  console.log('🔍 import.meta.env.PROD:', import.meta.env.PROD);
  
  // בדיקה אם אנחנו ב-production (לא localhost)
  const isProduction = window.location.hostname !== 'localhost' && 
                       !window.location.hostname.includes('127.0.0.1') &&
                       !window.location.hostname.includes('192.168.');
  
  console.log('🔍 isProduction:', isProduction);
  
  // אם יש VITE_API_URL, נשתמש בו
  if (import.meta.env.VITE_API_URL) {
    let url = import.meta.env.VITE_API_URL.trim();

    // אם המשתנה קיים אבל ריק/רווחים, נחשב אותו כלא מוגדר
    if (!url) {
      console.error('❌ VITE_API_URL is set but empty. Falling back to default API URL.');
      const productionUrl = DEFAULT_PROD_API_BASEURL;
      console.log('✅ Falling back to Render API:', productionUrl);
      return productionUrl;
    }
    
    // בדיקה שה-URL לא יחסי (לא מתחיל ב-/)
    if (url.startsWith('/')) {
      console.error('❌ VITE_API_URL is relative! It should be a full URL like https://hasderanewsletter-2025.onrender.com');
      console.error('❌ Current VITE_API_URL:', url);
      // נשתמש ב-production URL במקום
      const productionUrl = DEFAULT_PROD_API_BASEURL;
      console.log('✅ Falling back to Render API:', productionUrl);
      return productionUrl;
    }

    // בדיקה שה-URL מוחלט וכולל scheme (http/https)
    if (!/^https?:\/\//i.test(url)) {
      console.error('❌ VITE_API_URL is missing http/https scheme! It should be a full URL like https://hasderanewsletter-2025.onrender.com');
      console.error('❌ Current VITE_API_URL:', url);
      const productionUrl = DEFAULT_PROD_API_BASEURL;
      console.log('✅ Falling back to Render API:', productionUrl);
      return productionUrl;
    }
    
    // וודא שיש /api בסוף אם לא קיים
    url = url.replace(/\/+$/, ''); // הסרת / בסוף כדי לא לקבל //api
    const finalUrl = url.endsWith('/api') ? url : url + '/api';
    console.log('✅ Using VITE_API_URL:', finalUrl);
    return finalUrl;
  }
  
  // אם אנחנו ב-production, נשתמש ב-Render API
  if (isProduction) {
    const productionUrl = DEFAULT_PROD_API_BASEURL;
    console.log('✅ Production mode - using Render API:', productionUrl);
    console.log('⚠️ VITE_API_URL not set! Please set it in Cloudflare Pages Environment Variables');
    return productionUrl;
  }
  
  // בפיתוח מקומי, נשתמש ב-localhost
  console.log('✅ Development mode - using localhost:5055');
  return DEFAULT_DEV_API_BASEURL;
};

const apiBaseUrl = getApiBaseUrl();
console.log('🔍 Final API baseURL:', apiBaseUrl);

export const api = axios.create({
  baseURL: apiBaseUrl || (import.meta.env.PROD ? DEFAULT_PROD_API_BASEURL : DEFAULT_DEV_API_BASEURL),
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: true, // נדרש עבור CORS עם credentials
  timeout: 60000 
});

// ——— REQUEST INTERCEPTOR ———
api.interceptors.request.use((config) => {
  // Failsafe: אם baseURL ריק/חסר, נכפה אותו כדי שלא נשלח ל-pages.dev
  const effectiveDefaultBaseUrl = import.meta.env.PROD ? DEFAULT_PROD_API_BASEURL : DEFAULT_DEV_API_BASEURL;
  if (!api.defaults.baseURL) {
    api.defaults.baseURL = effectiveDefaultBaseUrl;
  }
  if (!config.baseURL) {
    config.baseURL = api.defaults.baseURL || effectiveDefaultBaseUrl;
  }

  // לוג כדי לוודא שה-baseURL נכון
  console.log('🔍 API Request:', config.method?.toUpperCase(), config.baseURL + config.url);
  
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
