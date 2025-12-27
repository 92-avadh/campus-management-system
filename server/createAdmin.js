const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("./models/User");

// 1. Load Environment Variables
dotenv.config();

// 2. Connect to Database
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    createAdmin();
  })
  .catch((err) => console.error("❌ Connection Error:", err));

const createAdmin = async () => {
  try {
    // 3. Delete Old Admin (to avoid duplicates)
    await User.findOneAndDelete({ userId: "ADMIN01" });
    console.log("🗑️  Old ADMIN01 deleted.");

    // 4. Hash the Password "admin123"
    // CHANGE PASSWORD HERE IF YOU WANT ↓
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // 5. Create the Admin User
    const adminUser = new User({
      name: "Super Admin",
      
      // 👇 CHANGE THIS TO YOUR REAL GMAIL ADDRESS 👇
      email: "dhameliyafashion36@gmail.com", 
      
      phone: "9999999999",
      role: "admin",        
      userId: "ADMIN01",    // <--- Your Login ID
      password: hashedPassword, 
      course: "N/A",
      department: "Administration"
    });

    await adminUser.save();
    console.log("-----------------------------------------");
    console.log("👑 SUCCESS! New Admin Created.");
    console.log("👉 Login ID:  ADMIN01");
    console.log("👉 Password:  admin123");
    console.log("👉 Email:     " + adminUser.email);
    console.log("-----------------------------------------");

    // 6. Close Connection
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error);
  }
};