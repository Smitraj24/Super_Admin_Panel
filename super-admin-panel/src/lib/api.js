import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

API.interceptors.request.use((req) => {
  if (typeof window !== "undefined") {
    // Try sessionStorage first (tab-specific), fallback to localStorage
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");

    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
  }

  return req;
});

export default API;