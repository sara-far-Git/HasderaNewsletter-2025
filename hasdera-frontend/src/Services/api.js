// src/services/api.js
import axios from "axios";
import axiosRetry from 'axios-retry';

// יצירת אינסטנס עם baseURL
export const api = axios.create({
  baseURL: "https://localhost:7083/api",
  headers: {
    "Content-Type": "application/json"
  },
  // הגדרות עבור self-signed certificate
  withCredentials: false,
  timeout: 60000  // הגדלת הטיימאאוט ל-60 שניות
});

// הגדרת retry logic
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