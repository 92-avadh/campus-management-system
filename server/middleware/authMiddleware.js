const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // 1. Get token from the header
  // Client should send header: "x-auth-token": "YOUR_TOKEN_HERE"
const token = req.header("Authorization")?.split(" ")[1];
  // 2. Check if no token
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  // 3. Verify token
  try {
    // Decodes the token using your secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach the user payload (id, role) to the request object
    req.user = decoded.user;
    
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};