const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // 1. Get token from header (Format: "Bearer <token>")
  const authHeader = req.header("Authorization");
  const token = authHeader?.split(" ")[1];

  // 2. Check if no token
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  // 3. Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};