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
  timeout: 30000  // הגדלת הטיימאאוט ל-30 שניות
});

// פונקציה מרכזית לטיפול בשגיאות
export function handleError(action, err) {
  console.error(`❌ שגיאה ב-${action}:`, err);
  throw err;
}
