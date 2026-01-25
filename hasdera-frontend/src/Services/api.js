// src/services/api.js
import axios from "axios";
import axiosRetry from 'axios-retry';

const DEFAULT_PROD_API_BASEURL = "https://hasderanewsletter-2025.onrender.com/api";
const DEFAULT_DEV_API_BASEURL = "http://localhost:5055/api";

// Version stamp to verify which bundle is running in production.
// Keep this in sync with the latest deployment commit when debugging.
export const API_CLIENT_VERSION = "reader-32";
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

const withCredentials = String(import.meta.env.VITE_WITH_CREDENTIALS || "false").toLowerCase() === "true";

// יצירת אינסטנס עם baseURL
// שימוש ב-VITE_API_URL אם קיים, אחרת localhost לפיתוח
const getApiBaseUrl = () => {
  // בדיקה אם אנחנו ב-production (לא localhost)
  const isProduction = window.location.hostname !== 'localhost' && 
                       !window.location.hostname.includes('127.0.0.1') &&
                       !window.location.hostname.includes('192.168.');
  
  // בדיקה אם אנחנו ב-Cloudflare Pages
  const isCloudflarePages = window.location.hostname.includes('pages.dev') || 
                           window.location.hostname.includes('cloudflarepages.com');

  const effectiveDefaultBaseUrl = import.meta.env.PROD ? DEFAULT_PROD_API_BASEURL : DEFAULT_DEV_API_BASEURL;

  // אם אנחנו ב-Cloudflare Pages, נשתמש ב-relative URLs כדי שה-functions יוכלו לתפוס אותם
  if (isCloudflarePages) {
    return ""; // יחזיר empty string, ואז הקוד יבנה relative URLs
  }

  // אם יש VITE_API_URL, נשתמש בו (אחרי נרמול). אם הוא ריק/לא תקין - ניפול לברירת מחדל.
  const rawEnvUrl = import.meta.env.VITE_API_URL;
  const normalizedEnvUrl = normalizeApiBaseUrl(rawEnvUrl, "");

  if (normalizedEnvUrl) {
    try {
      const envHost = new URL(normalizedEnvUrl).hostname;
      const currentHost = window.location.hostname;
      const isPagesOrigin = currentHost.endsWith(".pages.dev");
      const isSameHost = envHost === currentHost;

      if (isSameHost) {
        console.warn('⚠️ VITE_API_URL points to the frontend origin; ignoring to avoid /api issues.');
      } else {
        console.log('✅ Using VITE_API_URL:', normalizedEnvUrl);
        return normalizedEnvUrl;
      }
    } catch {
      console.log('✅ Using VITE_API_URL:', normalizedEnvUrl);
      return normalizedEnvUrl;
    }
  }
  
  // אם אנחנו ב-production, נשתמש ב-Render API
  if (isProduction) {
    return DEFAULT_PROD_API_BASEURL;
  }
  
  // בפיתוח מקומי, נשתמש ב-localhost
  return DEFAULT_DEV_API_BASEURL;
};

const apiBaseUrl = getApiBaseUrl();
// ב-Cloudflare Pages, אם apiBaseUrl ריק, נשאיר אותו ריק (לא ננרמל עם fallback)
let resolvedApiBaseUrl = apiBaseUrl === "" ? "" : normalizeApiBaseUrl(apiBaseUrl, EFFECTIVE_DEFAULT_BASEURL);
if (!resolvedApiBaseUrl && apiBaseUrl !== "") {
  const hardFallback = import.meta.env.PROD ? DEFAULT_PROD_API_BASEURL : DEFAULT_DEV_API_BASEURL;
  const normalizedFallback = normalizeApiBaseUrl(hardFallback, hardFallback);
  resolvedApiBaseUrl = normalizedFallback || hardFallback;
  console.warn('⚠️ API baseURL empty after normalization; forcing hard fallback:', resolvedApiBaseUrl);
}
console.log('🔍 Final API baseURL:', resolvedApiBaseUrl || "(relative)");

export const api = axios.create({
  baseURL: resolvedApiBaseUrl,
  headers: {
    "Content-Type": "application/json"
  },
  // Default off; enable explicitly only when using cookie auth.
  withCredentials,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT_MS || 30000),
});

try {
  // Expose effective baseURL for production debugging: window.__HASDERA_API_BASEURL
  window.__HASDERA_API_BASEURL = resolvedApiBaseUrl;
} catch {
  // ignore (non-browser)
}

// ——— REQUEST INTERCEPTOR ———
api.interceptors.request.use((config) => {
  // בדיקה אם אנחנו ב-Cloudflare Pages
  const isCloudflarePages = typeof window !== 'undefined' && (
    window.location.hostname.includes('pages.dev') || 
    window.location.hostname.includes('cloudflarepages.com')
  );

  const url = String(config.url ?? "");
  const isAbsoluteUrl = /^https?:\/\//i.test(url);

  // Cloudflare Pages: תמיד ננתב דרך /api/* כדי שה-Functions יתפסו את הבקשה.
  // חשוב: לא חוזרים מוקדם כאן, כי אחרת לא נוסיף Authorization token!
  if (!isAbsoluteUrl && isCloudflarePages) {
    // שמירה על baseURL ריק כדי שהבקשה תהיה relative
    config.baseURL = undefined;

    // אם כבר מתחיל ב-/api נשאיר; אחרת נקדים /api
    if (url.startsWith("/") && !url.startsWith("/api/")) {
      config.url = "/api" + url;
    }
  } else if (!isAbsoluteUrl) {
    // Failsafe: אם baseURL ריק/חסר/שגוי, נכפה URL מוחלט כדי שלא נשלח ל-pages.dev
    const effectiveDefaultBaseUrl = EFFECTIVE_DEFAULT_BASEURL;
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

  const token = localStorage.getItem("hasdera_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Let the browser set multipart boundaries for FormData.
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    if (typeof config.headers?.delete === "function") {
      config.headers.delete("Content-Type");
      config.headers.delete("content-type");
    } else {
      delete config.headers?.["Content-Type"];
      delete config.headers?.["content-type"];
    }
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
    const method = (error.config?.method || "get").toLowerCase();
    const canRetry = method === "get" || method === "head" || method === "options";
    return (
      canRetry &&
      (axiosRetry.isNetworkOrIdempotentRequestError(error) || error.code === "ECONNABORTED")
    );
  }
});

// פונקציה מרכזית לטיפול בשגיאות
export function handleError(action, err) {
  console.error(`❌ שגיאה ב-${action}:`, err);
  throw err;
}
