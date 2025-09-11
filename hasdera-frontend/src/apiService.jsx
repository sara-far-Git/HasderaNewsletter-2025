import axios from "axios";

const API_BASE = "https://localhost:7083/api";

export async function getAnalytics() {
  console.log("📡 שולח בקשת GET ל:", `${API_BASE}/Analytics`);
  try {
    const res = await axios.get(`${API_BASE}/Analytics`);
    console.log("✅ תשובת GET:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ שגיאה ב-GET Analytics:", err);
    throw err;
  }
}

export async function createDemoAnalytics() {
  const demoRecord = {
    clicksTotal: 10,
    uniqueReaders: 5,
    ctr: 0.5,
    reportDate: new Date().toISOString().split("T")[0]
  };

  console.log("📡 שולח בקשת POST ל:", `${API_BASE}/Analytics`, "עם נתונים:", demoRecord);
  try {
    const res = await axios.post(`${API_BASE}/Analytics`, demoRecord);
    console.log("✅ תשובת POST:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ שגיאה ב-POST Analytics:", err);
    throw err;
  }
}
