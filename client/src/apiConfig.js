// Automatically detects if you are on localhost or a specific IP (e.g., 192.168.0.101)
const hostname = window.location.hostname;

// Your backend port (Keep this 5000 as per your server setup)
const PORT = 5000; 

export const API_BASE_URL = `http://${hostname}:${PORT}/api`;
export const BASE_URL = `http://${hostname}:${PORT}`; // For file downloads/images