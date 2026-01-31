import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// --- START OF MOBILE ACCESS FIX ---
// This block automatically redirects "localhost" API calls to your actual network IP
// so the app works on mobile devices without changing any code in your components.

const originalFetch = window.fetch;

window.fetch = async (...args) => {
  let [resource, config] = args;

  // Check if the request is a string (URL) and targets the default localhost backend
  if (typeof resource === 'string' && resource.includes('http://localhost:5000')) {
    
    // 1. Get the current IP/URL from the browser (e.g., http://192.168.0.101:3000)
    const currentOrigin = window.location.origin;
    
    // 2. Change the port from Frontend (3000) to Backend (5000)
    // Result: http://192.168.0.101:5000
    const backendUrl = currentOrigin.replace(':3000', ':5000');
    
    // 3. Replace 'localhost' with the real IP in the request URL
    resource = resource.replace('http://localhost:5000', backendUrl);
    
    // Optional: Log the redirection for debugging
    // console.log(`🔀 Auto-Redirected API to: ${resource}`);
  }

  // Proceed with the request normally
  return originalFetch(resource, config);
};
// --- END OF MOBILE ACCESS FIX ---

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <App />
);