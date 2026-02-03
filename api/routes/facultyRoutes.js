const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const path = require("path");
const fs = require("fs"); 
const crypto = require("crypto"); 
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Timetable = require("../models/Timetable");
const Material = require("../models/Material");
const Course = require("../models/Course");
const Notification = require("../models/Notification");
const Query = require("../models/Query");
const Notice = require("../models/Notice");
const AttendanceSession = require("../models/AttendanceSession"); 

/* =======================
   HELPER: COURSE NORMALIZER
======================= */
const normalizeCourse = (dept) => {
    if (!dept) return "GENERAL";
    const upper = dept.toUpperCase();
    if (upper.includes("BCA") || upper.includes("COMPUTER") || upper.includes("CS")) return "BCA";
    if (upper.includes("BBA") || upper.includes("BUSINESS") || upper.includes("MANAGEMENT")) return "BBA";
    if (upper.includes("BCOM") || upper.includes("COMMERCE") || upper.includes("ACCOUNT")) return "BCOM";
    return upper;
};

/* =======================
   ⚡ HYBRID STORAGE CONFIG (SPEED FIX)
======================= */
// Check if running on Vercel or Production
const isProduction = process.env.VERCEL || process.env.NODE_ENV === "production";

let upload;

if (isProduction) {
  // ☁️ CLOUDINARY (For Vercel/Deployment)
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  const cloudStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "campus_materials",
      allowed_formats: ["pdf", "doc", "docx", "ppt", "pptx", "txt"],
      resource_type: "auto"
    }
  });
  upload = multer({ storage: cloudStorage });
  console.log("🚀 Using Cloudinary Storage (Production)");

} else {
  // 💻 LOCAL STORAGE (For Localhost - Ultra Fast)
  // Ensure directory exists
  const uploadDir = path.join(__dirname, "../uploads/materials");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      // Clean filename to prevent issues
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, "material-" + uniqueSuffix + path.extname(file.originalname));
    }
  });
  upload = multer({ storage: diskStorage });
  console.log("⚡ Using Local Disk Storage (Fast Mode)");
}

/* =======================
   1. GET NOTICES
======================= */
router.get("/notices", async (req, res) => {
  try {
    const notices = await Notice.find({
        $or: [
            { postedBy: { $ne: "Admin" } }, 
            { target: "faculty" },          
            { target: "all" }               
        ]
    }).sort({ date: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notices" });
  }
});

/* =======================
   2. ADD NOTICE
======================= */
router.post("/add-notice", async (req, res) => {
  try {
    const { title, content, target, postedBy, userId } = req.body;
    const finalTarget = target || "student";

    const newNotice = new Notice({
      title, content, target: finalTarget, postedBy
    });
    
    // ✅ PARALLEL EXECUTION (Faster)
    const [savedNotice] = await Promise.all([
        newNotice.save(),
        (async () => {
            let notifyCourse = "STUDENT_ALL"; 
            if (finalTarget === "faculty") notifyCourse = "FACULTY_ALL";
            else if (finalTarget !== "student" && finalTarget !== "all") {
                notifyCourse = normalizeCourse(finalTarget); 
            }

            // Create notification but don't block the main thread unnecessarily
            return Notification.create({
                type: "notice",
                title: "New Notice: " + title,
                message: content.substring(0, 40) + "...", 
                course: notifyCourse,  
                relatedId: newNotice._id,
                relatedModel: "Notice",
                createdBy: userId, 
                createdAt: new Date()
            });
        })()
    ]);

    res.json({ success: true, message: "Notice Posted!" });
  } catch (err) {
    res.status(500).json({ message: "Failed to post notice" });
  }
});

router.delete("/delete-notice/:id", async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: "Error" }); }
});

/* =======================
   3. ATTENDANCE
======================= */
router.post("/generate-qr", async (req, res) => {
  try {
    const { course, subject, facultyId } = req.body;
    const uniqueCode = Math.floor(100000 + Math.random() * 900000).toString();

    await AttendanceSession.deleteMany({ facultyId });

    await new AttendanceSession({
        facultyId,
        subject: subject, 
        token: uniqueCode,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000) 
    }).save();

    const data = {
      course, subject, facultyId,
      code: uniqueCode, 
      timestamp: Date.now(), 
      nonce: crypto.randomBytes(4).toString('hex') 
    };
    
    res.json({ qrData: JSON.stringify(data), code: uniqueCode });

  } catch (err) {
    res.status(500).json({ message: "Error generating QR/Code" });
  }
});

/* =======================
   4. STUDENTS & SUBJECTS
======================= */
router.get("/students", async (req, res) => {
  try {
    const { department } = req.query;
    const students = await User.find({
      role: "student",
      $or: [
        { department: { $regex: department, $options: "i" } },
        { course: { $regex: department, $options: "i" } }
      ]
    }).select("-password");
    res.json(students);
  } catch (err) { res.status(500).json({ message: "Error" }); }
});

router.get("/subjects/:courseName", async (req, res) => {
  const course = await Course.findOne({
    name: { $regex: new RegExp(req.params.courseName, "i") }
  });
  if (!course) return res.json({ subjects: [] });
  res.json({ subjects: course.subjects });
});

/* =======================
   5. MATERIAL OPERATIONS (OPTIMIZED)
======================= */
router.post("/upload-material", upload.single("material"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const { title, course, subject, uploadedBy } = req.body;
    
    // Determine path based on storage type
    const filePath = isProduction ? req.file.path : `uploads/materials/${req.file.filename}`;

    const newMaterial = new Material({
      title, course, subject, uploadedBy,
      filePath: filePath, 
      fileName: req.file.originalname,
      fileSize: req.file.size
    });
    
    // ✅ PARALLEL DB WRITES: Saves ~200ms
    const [saved] = await Promise.all([
        newMaterial.save(),
        Notification.create({
            type: "material",
            title: "New Material Uploaded",
            message: `${title} (${subject})`,
            course: normalizeCourse(course),
            createdBy: uploadedBy
        })
    ]);

    res.status(201).json(saved);
  } catch (err) { 
    console.error(err);
    res.status(500).json({ message: "Error uploading file" }); 
  }
});

router.get("/my-materials/:facultyId", async (req, res) => {
  const materials = await Material.find({ uploadedBy: req.params.facultyId }).sort({ uploadDate: -1 });
  res.json(materials);
});

router.delete("/material/:materialId", async (req, res) => {
  try {
    const material = await Material.findById(req.params.materialId);
    if (material) {
        // If local file, delete it from disk
        if (!isProduction && material.filePath && !material.filePath.startsWith("http")) {
            const absolutePath = path.join(__dirname, "..", material.filePath);
            if (fs.existsSync(absolutePath)) {
                fs.unlinkSync(absolutePath);
            }
        }
        // Cloudinary deletion is usually handled via Admin API or ignored to save bandwidth
        await Material.findByIdAndDelete(req.params.materialId);
    }
    res.json({ message: "Deleted" });
  } catch(err) {
    res.status(500).json({ message: "Error deleting material" });
  }
});

/* =======================
   6. DOUBTS
======================= */
router.get("/doubts/:facultyId", async (req, res) => {
  try {
    const doubts = await Query.find({ faculty: req.params.facultyId }).sort({ createdAt: -1 }); 
    res.json(doubts);
  } catch (err) { res.status(500).json({ message: "Error" }); }
});

router.put("/answer-doubt/:id", async (req, res) => {
  try {
    const { answer } = req.body;
    const updatedQuery = await Query.findByIdAndUpdate(req.params.id, {
      answer, status: "Resolved", resolvedAt: Date.now()
    }, { new: true });

    if (!updatedQuery) return res.status(404).json({ success: false, message: "Not found" });

    // Parallel Notification
    Notification.create({
      type: "query",
      title: "Doubt Answered",
      message: `Your question in ${updatedQuery.subject} was answered.`,
      course: "PERSONAL",
      recipients: [{ studentId: updatedQuery.student, read: false }] 
    }).catch(err => console.error("Notification Error:", err)); // Fire & Forget

    res.json({ success: true, message: "Answer sent!" });
  } catch (err) { res.status(500).json({ success: false }); }
});

/* =======================
   7. TIMETABLE (UPDATED NOTIFICATIONS)
======================= */
router.post("/upload-timetable", async (req, res) => {
  try {
    const { department, schedule, date } = req.body;
    let safeDate = date ? new Date(`${date}T12:00:00Z`) : new Date();
    safeDate.setHours(12, 0, 0, 0); 

    const startOfDay = new Date(safeDate); startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(safeDate); endOfDay.setHours(23,59,59,999);

    const existing = await Timetable.findOne({
      department,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    const savePromise = existing 
      ? (async () => { existing.schedule = schedule; existing.date = safeDate; return existing.save(); })()
      : new Timetable({ department, date: safeDate, schedule }).save();

    // Parallel Notification
    const [saved] = await Promise.all([
        savePromise,
        Notification.create({
            type: "alert",
            title: "📅 Timetable Updated",
            message: `New timetable uploaded for ${department} (${new Date(safeDate).toLocaleDateString()}).`,
            course: normalizeCourse(department),
            createdAt: new Date()
        })
    ]);

    res.json({ success: true, message: "Timetable Published!" });
  } catch (err) {
    res.status(500).json({ message: "Error uploading timetable" });
  }
});

router.get("/timetable", async (req, res) => {
    try {
        const { department } = req.query;
        const startOfDay = new Date(); 
        startOfDay.setHours(0,0,0,0);
        
        const timetables = await Timetable.find({
            department,
            date: { $gte: startOfDay }
        }).sort({ date: 1 });
        
        const flatSchedule = timetables.reduce((acc, curr) => {
            const rawDate = curr.date;
            const slots = curr.schedule.map(s => ({ ...s.toObject(), rawDate }));
            return acc.concat(slots);
        }, []);
        
        res.json(flatSchedule);
    } catch (err) { res.status(500).json({ message: "Error fetching" }); }
});

router.post("/cancel-class", async (req, res) => {
    try {
        const { department, date, slotId } = req.body;
        let safeDate = new Date(date); 
        const startOfDay = new Date(safeDate); startOfDay.setHours(0,0,0,0);
        const endOfDay = new Date(safeDate); endOfDay.setHours(23,59,59,999);
        
        const timetable = await Timetable.findOne({
            department,
            date: { $gte: startOfDay, $lte: endOfDay }
        });
        
        if (!timetable) return res.status(404).json({ message: "Timetable not found" });
        
        const slot = timetable.schedule.id(slotId);
        if (!slot) return res.status(404).json({ message: "Slot not found" });
        
        slot.isCancelled = !slot.isCancelled; 
        
        const promises = [timetable.save()];

        if (slot.isCancelled) {
            promises.push(Notification.create({
                type: "alert",
                title: `🚨 Class Cancelled: ${slot.subject}`,
                message: `The ${slot.subject} class at ${slot.time} has been cancelled.`,
                course: normalizeCourse(department),
                createdAt: new Date()
            }));
        }

        await Promise.all(promises);
        res.json({ success: true, message: slot.isCancelled ? "Class Cancelled" : "Class Restored" });
        
    } catch (err) {
        res.status(500).json({ message: "Error cancelling class" });
    }
});

router.post("/delete-class-slot", async (req, res) => {
  try {
    const { department, date, slotId } = req.body;
    let safeDate = new Date(date);
    const startOfDay = new Date(safeDate); startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(safeDate); endOfDay.setHours(23,59,59,999);

    const timetable = await Timetable.findOne({
      department,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (timetable) {
      const slot = timetable.schedule.id(slotId);
      const subjectName = slot ? slot.subject : "A class";

      timetable.schedule.pull({ _id: slotId }); 
      
      const promises = [];
      if (timetable.schedule.length === 0) {
        promises.push(Timetable.findByIdAndDelete(timetable._id));
      } else {
        promises.push(timetable.save());
      }

      promises.push(Notification.create({
          type: "alert",
          title: "🗑️ Class Removed",
          message: `${subjectName} has been removed from the schedule.`,
          course: normalizeCourse(department),
          createdAt: new Date()
      }));

      await Promise.all(promises);
      res.json({ success: true, message: "Class deleted!" });
    } else {
      res.status(404).json({ message: "Not found" });
    }
  } catch(err) {
    res.status(500).json({ message: "Error deleting" });
  }
});

// Profile Routes
router.get("/profile/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        res.json(user);
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

router.put("/update-profile/:id", async (req, res) => {
  try {
    const { email, phone, address, dob } = req.body;
    await User.findByIdAndUpdate(req.params.id, { email, phone, address, dob });
    res.json({ success: true, message: "Profile updated!" });
  } catch (err) { res.status(500).json({ success: false }); }
});

router.put("/change-password/:id", async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false });
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ success: false });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true, message: "Password changed!" });
  } catch (err) { res.status(500).json({ success: false }); }
});

module.exports = router;