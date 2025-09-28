// src/services/api.js
import axios from "axios";

// יצירת אינסטנס עם baseURL
export const api = axios.create({
  baseURL: "https://localhost:7083/api",
  headers: {
    "Content-Type": "application/json"
  },
  // הגדרות עבור self-signed certificate
  withCredentials: false,
  timeout: 10000
});

// פונקציה מרכזית לטיפול בשגיאות
export function handleError(action, err) {
  console.error(`❌ שגיאה ב-${action}:`, err);
  throw err;
}
