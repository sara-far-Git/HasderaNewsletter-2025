// src/services/analyticsService.js
import { api, handleError } from "./api.js";

export async function getAnalytics() {
  console.log("📡 GET /Analytics");
  try {
    const res = await api.get("/Analytics");
    return res.data;
  } catch (err) {
    handleError("GET Analytics", err);
  }
}

export async function createDemoAnalytics() {
  const demoRecord = {
    clicksTotal: 10,
    uniqueReaders: 5,
    ctr: 0.5,
    reportDate: new Date().toISOString().split("T")[0]
  };

  console.log("📡 POST /Analytics", demoRecord);
  try {
    const res = await api.post("/Analytics", demoRecord);
    return res.data;
  } catch (err) {
    handleError("POST Analytics", err);
  }
}
