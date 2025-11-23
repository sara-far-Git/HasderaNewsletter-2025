// src/services/advertisersService.js
import { api, handleError } from "./api.js";

export async function getAdvertisers() {
  console.log("📡 GET /Advertisers");
  try {
    const res = await api.get("/Advertisers");
    return res.data;
  } catch (err) {
    handleError("GET Advertisers", err);
  }
}

export async function createAdvertiser(advertiser) {
  console.log("📡 POST /Advertisers", advertiser);
  try {
    const res = await api.post("/Advertisers", advertiser);
    return res.data;
  } catch (err) {
    handleError("POST Advertiser", err);
  }
}

export async function updateAdvertiser(id, advertiser) {
  console.log(`📡 PUT /Advertisers/${id}`, advertiser);
  try {
    await api.put(`/Advertisers/${id}`, advertiser);
  } catch (err) {
    handleError("PUT Advertiser", err);
  }
}

export async function deleteAdvertiser(id) {
  console.log(`📡 DELETE /Advertisers/${id}`);
  try {
    await api.delete(`/Advertisers/${id}`);
  } catch (err) {
    handleError("DELETE Advertiser", err);
  }
}
