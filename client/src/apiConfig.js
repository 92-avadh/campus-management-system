const hostname = window.location.hostname;

export const API_BASE_URL = 
  (hostname === "localhost" || hostname === "127.0.0.1")
    ? "http://localhost:5000/api"  // Local Development
    : "/api";                      // Vercel Production

export const STATIC_BASE_URL = 
  (hostname === "localhost" || hostname === "127.0.0.1")
    ? "http://localhost:5000"      // Local Images
    : "";                          // Vercel (Images load from Cloudinary)