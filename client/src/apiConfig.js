const hostname = window.location.hostname;

export const API_BASE_URL = 
  (hostname === "localhost" || hostname === "127.0.0.1")
    ? "http://localhost:5000/api"  // 🏠 Local: Use Port 5000
    : "/api";                      // ☁️ Vercel: Use relative path (No Port)

export const STATIC_BASE_URL = 
  (hostname === "localhost" || hostname === "127.0.0.1")
    ? "http://localhost:5000"
    : "";