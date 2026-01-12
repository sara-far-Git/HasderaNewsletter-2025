// src/services/api.js
import axios from "axios";
import axiosRetry from 'axios-retry';

function normalizeBaseUrl(url) {
  if (!url) return url;
  // remove trailing slash to avoid double slashes when calling api.get("/User/me")
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

const DEFAULT_DEV_API_BASE_URL = "http://localhost:5055/api";
const DEFAULT_PROD_API_BASE_URL = "/api";

const baseURL = normalizeBaseUrl(
  import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV ? DEFAULT_DEV_API_BASE_URL : DEFAULT_PROD_API_BASE_URL)
);

if (import.meta.env.PROD && !import.meta.env.VITE_API_BASE_URL) {
  // eslint-disable-next-line no-console
  console.warn(
    "[Hasdera] VITE_API_BASE_URL is not set for production; falling back to '/api'. " +
      "Set VITE_API_BASE_URL to your backend, e.g. https://your-api.example.com/api"
  );
}

const withCredentials = String(import.meta.env.VITE_WITH_CREDENTIALS || "false").toLowerCase() === "true";

// יצירת אינסטנס עם baseURL
export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json"
  },
  // Default off; enable explicitly only when using cookie auth.
  withCredentials,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT_MS || 15000),
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
