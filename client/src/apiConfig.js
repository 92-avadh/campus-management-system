// admin/src/services/apiConfig.js

const hostname = window.location.hostname;

export const API_BASE_URL = 
  (hostname === "localhost" || hostname === "127.0.0.1")
    ? "http://localhost:5000/api"  // Local: Connect to local backend
    : "/api";                      // Vercel: Connect to relative backend

export const BASE_URL = 
  (hostname === "localhost" || hostname === "127.0.0.1")
    ? "http://localhost:5000"
    : "";