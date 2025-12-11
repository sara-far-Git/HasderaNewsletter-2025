import axios from "axios";

const API_BASE = "https://localhost:7083/api";

// =============== Analytics API ===============
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

// =============== Issues API ===============
export async function getAllIssues() {
  console.log("📡 שולח בקשת GET ל:", `${API_BASE}/Issues`);
  try {
    const res = await axios.get(`${API_BASE}/Issues`);
    console.log("✅ תשובת GET Issues:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ שגיאה ב-GET Issues:", err);
    throw err;
  }
}

export async function getIssueById(id) {
  console.log("📡 שולח בקשת GET ל:", `${API_BASE}/Issues/${id}`);
  try {
    const res = await axios.get(`${API_BASE}/Issues/${id}`);
    console.log("✅ תשובת GET Issue:", res.data);
    return res.data;
  } catch (err) {
    console.error(`❌ שגיאה ב-GET Issue ${id}:`, err);
    throw err;
  }
}

export async function createIssue(issueData) {
  console.log("📡 שולח בקשת POST ל:", `${API_BASE}/Issues`, "עם נתונים:", issueData);
  try {
    const res = await axios.post(`${API_BASE}/Issues`, issueData);
    console.log("✅ תשובת POST Issue:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ שגיאה ב-POST Issue:", err);
    throw err;
  }
}

export async function updateIssue(id, issueData) {
  console.log("📡 שולח בקשת PUT ל:", `${API_BASE}/Issues/${id}`, "עם נתונים:", issueData);
  try {
    const res = await axios.put(`${API_BASE}/Issues/${id}`, issueData);
    console.log("✅ תשובת PUT Issue:", res.data);
    return res.data;
  } catch (err) {
    console.error(`❌ שגיאה ב-PUT Issue ${id}:`, err);
    throw err;
  }
}

export async function deleteIssue(id) {
  console.log("📡 שולח בקשת DELETE ל:", `${API_BASE}/Issues/${id}`);
  try {
    const res = await axios.delete(`${API_BASE}/Issues/${id}`);
    console.log("✅ תשובת DELETE Issue:", res.data);
    return res.data;
  } catch (err) {
    console.error(`❌ שגיאה ב-DELETE Issue ${id}:`, err);
    throw err;
  }
}
