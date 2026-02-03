const hostname = window.location.hostname;

export const API_BASE_URL = 
  (hostname === "localhost" || hostname === "127.0.0.1")
    ? "http://localhost:5000/api"
    : (hostname.startsWith("192.168") || hostname.startsWith("10.") || hostname.startsWith("172."))
      ? `http://${hostname}:5000/api`  // 📲 Mobile/Network: Use dynamic IP + Port 5000
      : "/api";                       // ☁️ Vercel: Relative path

export const STATIC_BASE_URL = 
  (hostname === "localhost" || hostname === "127.0.0.1")
    ? "http://localhost:5000"
    : (hostname.startsWith("192.168") || hostname.startsWith("10.") || hostname.startsWith("172."))
      ? `http://${hostname}:5000`      // 📲 Mobile/Network: Use dynamic IP + Port 5000
      : "";