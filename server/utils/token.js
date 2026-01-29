const crypto = require("crypto");

module.exports.generateToken = () => {
  return crypto.randomBytes(16).toString("hex");
};
