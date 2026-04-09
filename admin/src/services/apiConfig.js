const hostname = window.location.hostname;

// 🔗 Your live Render Backend URL
const RENDER_BACKEND_URL = "https://campus-management-system-x8v5.onrender.com";

export const API_BASE_URL = 
  (hostname === "localhost" || hostname === "127.0.0.1")
    ? "http://localhost:5000/api"
    : (hostname.startsWith("192.168") || hostname.startsWith("10.") || hostname.startsWith("172."))
      ? `http://${hostname}:5000/api`  // 📲 Mobile/Network: Use dynamic IP + Port 5000
      : `${RENDER_BACKEND_URL}/api`;   // ☁️ Vercel: Point to Render Backend

export const BASE_URL = 
  (hostname === "localhost" || hostname === "127.0.0.1")
    ? "http://localhost:5000"
    : (hostname.startsWith("192.168") || hostname.startsWith("10.") || hostname.startsWith("172."))
      ? `http://${hostname}:5000`      // 📲 Mobile/Network: Use dynamic IP + Port 5000
      : RENDER_BACKEND_URL;            // ☁️ Vercel: Point to Render Backend

// ✅ FIX: Export STATIC_BASE_URL so the Admin components don't crash
export const STATIC_BASE_URL = BASE_URL;