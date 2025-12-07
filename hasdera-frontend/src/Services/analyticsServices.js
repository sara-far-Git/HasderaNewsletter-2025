// src/services/analyticsService.js
import { api } from "./api.js";
import axiosRetry from 'axios-retry';
axiosRetry(api, { 
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
           error.code === 'ECONNABORTED';
  }
});
export function handleError(action, err) {
  console.error(`❌ שגיאה ב-${action}:`, err);
  throw err;
}

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