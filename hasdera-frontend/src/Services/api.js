// src/services/api.js
import axios from "axios";
import axiosRetry from 'axios-retry';

// יצירת אינסטנס עם baseURL
export const api = axios.create({
  baseURL: "http://localhost:5055/api",
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
