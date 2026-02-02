const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const Notice = require("./models/Notice");
const Course = require("./models/Course");

dotenv.config();

// Connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Database Connected. Building structure...");
    seedData();
  })
  .catch(err => console.log(err));

const seedData = async () => {
  try {
    // 1. CLEAR OLD DATA (Optional - Keeps it clean)
    await Notice.deleteMany({});
    await Course.deleteMany({});
    // We do NOT delete Users here to keep your login safe!

    // 2. CREATE COURSES (Now with Subjects)
    await Course.insertMany([
      { 
        name: "BCA", 
        duration: "3 Years", 
        fees: 45000, 
        hod: "Dr. Sharma",
        subjects: ["C Programming", "Web Development", "Database Management", "Mathematics", "Communication Skills"]
      },
      { 
        name: "BBA", 
        duration: "3 Years", 
        fees: 40000, 
        hod: "Prof. Mehta",
        subjects: ["Principles of Management", "Financial Accounting", "Marketing", "Business Statistics", "Economics"] 
      },
      { 
        name: "B.Com", 
        duration: "3 Years", 
        fees: 30000, 
        hod: "Dr. Patel",
        subjects: ["Accounting", "Corporate Law", "Auditing", "Taxation", "Banking & Finance"] 
      }
    ]);
    console.log("📚 Courses Table Created with Subjects.");

    // 3. CREATE NOTICES
    await Notice.insertMany([
      { title: "Diwali Holidays", content: "College closed from 1st to 5th Nov.", target: "all" },
      { title: "Exam Schedule", content: "Mid-sem exams start next Monday.", target: "student" },
      { title: "Faculty Meeting", content: "Urgent meeting in Conf Room.", target: "faculty" }
    ]);
    console.log("📢 Notices Table Created.");

    // 4. ENSURE USERS EXIST (Just logging counts)
    const studentCount = await User.countDocuments({ role: "student" });
    const facultyCount = await User.countDocuments({ role: "faculty" });
    const adminCount = await User.countDocuments({ role: "admin" });

    console.log("---------------------------------------");
    console.log("✅ DATABASE STRUCTURE UPDATED SUCCESSFULLY");
    console.log(`👤 Users Table:  ${studentCount} Students, ${facultyCount} Faculty, ${adminCount} Admins`);
    console.log(`📚 Courses Table: Created`);
    console.log(`📢 Notices Table: Created`);
    console.log("---------------------------------------");

    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error);
  }
};