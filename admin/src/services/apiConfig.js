const hostname = window.location.hostname;

export const API_BASE_URL = 
  (hostname === "localhost" || hostname === "127.0.0.1")
    ? "http://localhost:5000/api"
    : "/api";

export const BASE_URL = 
  (hostname === "localhost" || hostname === "127.0.0.1")
    ? "http://localhost:5000"
    : "";

// ✅ FIX: Export STATIC_BASE_URL so the Admin components don't crash
export const STATIC_BASE_URL = BASE_URL;