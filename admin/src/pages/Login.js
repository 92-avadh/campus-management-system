import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 1. Grab the token and user data from the URL (sent from Port 3000)
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    const userString = queryParams.get("user");

    if (token && userString) {
      try {
        const user = JSON.parse(userString);
        const sessionData = { ...user, token };

        // 2. Save it to Admin's LocalStorage securely
        localStorage.setItem("adminUser", JSON.stringify(sessionData));

        // 3. Remove the token from the URL for security and redirect to Dashboard
        navigate("/", { replace: true }); 

      } catch (error) {
        console.error("Failed to parse user data", error);
        window.location.href = "http://localhost:3000/login";
      }
    } else {
      // 4. If someone tries to visit localhost:3001/login directly without a token,
      // kick them back to the main login portal on Port 3000.
      window.location.href = "http://localhost:3000/login";
    }
  }, [navigate, location]);

  // Provide a tiny loading screen while the redirect happens
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white font-sans">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <h2 className="text-xl font-bold animate-pulse">Authenticating Admin...</h2>
      </div>
    </div>
  );
};

export default Login;