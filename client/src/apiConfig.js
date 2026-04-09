const hostname = window.location.hostname;
// Replace this with your actual Render URL
const RENDER_BACKEND_URL = "https://campus-management-system-2au7.onrender.com";

export const API_BASE_URL = 
  (hostname === "localhost" || hostname === "127.0.0.1")
    ? "http://localhost:5000/api"
    : (hostname.startsWith("192.168") || hostname.startsWith("10.") || hostname.startsWith("172."))
      ? `http://${hostname}:5000/api` 
      : `${RENDER_BACKEND_URL}/api`; // ☁️ Point to Render Backend

export const STATIC_BASE_URL = 
  (hostname === "localhost" || hostname === "127.0.0.1")
    ? "http://localhost:5000"
    : (hostname.startsWith("192.168") || hostname.startsWith("10.") || hostname.startsWith("172."))
      ? `http://${hostname}:5000` 
      : RENDER_BACKEND_URL;