// src/Services/Login.js
import { api } from "./api";

export async function login(email, password) {
  const res = await api.post("/auth/login", { email, password });
  return res.data; // { token, user }
}

export async function register(fullName, email, password, role) {
  const res = await api.post("/auth/register", {
    fullName,
    email,
    password,
    role,
  });
  return res.data;
}

export async function loginWithGoogle(idToken) {
  const res = await api.post("/auth/google", { idToken });
  return res.data;
}

export async function fetchMe() {
  const res = await api.get("/auth/me");
  return res.data;
}

export async function forgotPassword(email) {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data;
}

export async function resetPassword(token, newPassword) {
  const res = await api.post("/auth/reset-password", { token, newPassword });
  return res.data;
}
