const hostname = window.location.hostname; 

export const API_BASE_URL = `http://${hostname}:5000/api`;
export const STATIC_BASE_URL = `http://${hostname}:5000`; // ✅ Used for files/images