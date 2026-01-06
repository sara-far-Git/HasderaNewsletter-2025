// src/services/api.js
import axios from "axios";
import axiosRetry from 'axios-retry';

const DEFAULT_PROD_API_BASEURL = "https://hasderanewsletter-2025.onrender.com/api";
const DEFAULT_DEV_API_BASEURL = "http://localhost:5055/api";

// Version stamp to verify which bundle is running in production.
// Keep this in sync with the latest deployment commit when debugging.
export const API_CLIENT_VERSION = "9f55435";
try {
  // Expose for quick checks in DevTools: window.__HASDERA_API_CLIENT_VERSION
  window.__HASDERA_API_CLIENT_VERSION = API_CLIENT_VERSION;
} catch {
  // ignore (non-browser)
}
console.log('🧩 api.js version:', API_CLIENT_VERSION);

const EFFECTIVE_DEFAULT_BASEURL = import.meta.env.PROD ? DEFAULT_PROD_API_BASEURL : DEFAULT_DEV_API_BASEURL;

const normalizeApiBaseUrl = (rawUrl, fallbackUrl) => {
  const fallback = String(fallbackUrl ?? "").trim();
  const raw = typeof rawUrl === "string" ? rawUrl.trim() : "";

  if (!raw) return fallback;
  if (raw.startsWith('/')) return fallback;
  if (!/^https?:\/\//i.test(raw)) return fallback;

  const trimmed = raw.replace(/\/+$/, "");
  return trimmed.endsWith('/api') ? trimmed : trimmed + '/api';
};

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

  const effectiveDefaultBaseUrl = import.meta.env.PROD ? DEFAULT_PROD_API_BASEURL : DEFAULT_DEV_API_BASEURL;

  // אם יש VITE_API_URL, נשתמש בו (אחרי נרמול). אם הוא ריק/לא תקין - ניפול לברירת מחדל.
  const rawEnvUrl = import.meta.env.VITE_API_URL;
  const normalizedEnvUrl = normalizeApiBaseUrl(rawEnvUrl, "");

  if (typeof rawEnvUrl === 'string' && rawEnvUrl.length > 0 && !normalizedEnvUrl) {
    console.error('❌ VITE_API_URL is set but empty/invalid. Falling back to default API URL.');
  }

  if (normalizedEnvUrl) {
    console.log('✅ Using VITE_API_URL:', normalizedEnvUrl);
    return normalizedEnvUrl;
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
const resolvedApiBaseUrl = normalizeApiBaseUrl(apiBaseUrl, EFFECTIVE_DEFAULT_BASEURL);
console.log('🔍 Final API baseURL:', resolvedApiBaseUrl);

export const api = axios.create({
  baseURL: resolvedApiBaseUrl,
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: true, // נדרש עבור CORS עם credentials
  timeout: 60000 
});

// Hard failsafe: ensure relative URLs never go to pages.dev (or any current origin)
// by converting them to absolute backend URLs before Axios runs interceptors.
const _originalRequest = api.request.bind(api);
api.request = (config) => {
  let normalizedConfig = config;

  // Axios supports api.request(urlString)
  if (typeof normalizedConfig === "string") {
    normalizedConfig = { url: normalizedConfig };
  }

  try {
    const url = String(normalizedConfig?.url ?? "");
    const isAbsoluteUrl = /^https?:\/\//i.test(url);

    if (!isAbsoluteUrl && url) {
      const base = normalizeApiBaseUrl(api.defaults.baseURL, EFFECTIVE_DEFAULT_BASEURL).replace(/\/+$/, "");
      const path = url.startsWith("/") ? url : "/" + url;

      if (base) {
        normalizedConfig = { ...(normalizedConfig ?? {}) };
        normalizedConfig.baseURL = undefined;
        normalizedConfig.url = base + path;
      }
    }
  } catch {
    // ignore
  }

  return _originalRequest(normalizedConfig);
};

// ——— REQUEST INTERCEPTOR ———
api.interceptors.request.use((config) => {
  // Failsafe: אם baseURL ריק/חסר/שגוי, נכפה URL מוחלט כדי שלא נשלח ל-pages.dev
  const effectiveDefaultBaseUrl = EFFECTIVE_DEFAULT_BASEURL;

  const url = String(config.url ?? "");
  const isAbsoluteUrl = /^https?:\/\//i.test(url);

  if (!isAbsoluteUrl) {
    // אל תסמוך רק על baseURL של axios; נרמול + בניית URL מוחלט תמיד.
    const candidateBase = config.baseURL ?? api.defaults.baseURL ?? resolvedApiBaseUrl;
    const normalizedBase = normalizeApiBaseUrl(candidateBase, effectiveDefaultBaseUrl).replace(/\/+$/, "");
    const normalizedPath = url.startsWith("/") ? url : "/" + url;

    if (normalizedBase) {
      // כדי להימנע ממצב בו axios מתעלם מ-baseURL/משאיר request יחסי,
      // נבנה URL מוחלט ישירות.
      config.baseURL = undefined;
      config.url = normalizedBase + normalizedPath;
    } else {
      console.error('❌ Could not resolve API baseURL; request will be relative!', { url, candidateBase, effectiveDefaultBaseUrl });
    }
  }

  // לוג כדי לוודא שה-URL הסופי נכון
  const logUrl = String(config.baseURL ? config.baseURL + (config.url ?? "") : (config.url ?? ""));
  console.log('🔍 API Request:', config.method?.toUpperCase(), logUrl);
  
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
