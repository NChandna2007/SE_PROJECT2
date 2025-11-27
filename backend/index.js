const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const Content = require("./models/Content");
const AssignmentSubmission = require("./models/AssignmentSubmission");

// Hardcoded users for login
const users = [
  {
    email: "student@test.com",
    password: "1234",
    role: "student",
    redirect: "dashboard.html"
  },
  {
    email: "volunteer@thapar.edu",
    password: "1234",
    role: "volunteer",
    redirect: "volunteer_dashboard.html"
  }
];

// ==================== Multer Storage ====================

// Volunteer content uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subject = req.body.subject;
    const uploadPath = path.join(__dirname, "uploads", subject);
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// Student assignment uploads
const assignmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "uploads", "assignments");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const uploadAssignment = multer({ storage: assignmentStorage });

// ==================== Routes ====================

// Volunteer: Upload content
app.post("/api/upload", upload.fields([{ name: "file" }]), async (req, res) => {
  try {
    const { subject } = req.body;
    const fileData = req.files.file[0];
    const fileUrl = `/uploads/${subject}/${fileData.filename}`;

    const newContent = new Content({
      originalName: fileData.originalname,
      fileName: fileData.filename,
      filePath: fileUrl,
      fileType: fileData.mimetype,
      subject
    });

    await newContent.save();
    res.json({ success: true, message: "File uploaded successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
});

// Student: Upload assignment
app.post("/upload-assignment", uploadAssignment.single("file"), async (req, res) => {
  try {
    const { assignmentName, studentId, studentName } = req.body;

    // ✅ Fix: studentId as string instead of ObjectId
    const submission = new AssignmentSubmission({
      assignmentName,
      studentId: studentId.toString(),
      studentName,
      filePath: `/uploads/assignments/${req.file.filename}`
    });

    await submission.save();
    res.json({ success: true, message: "Assignment submitted successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Upload failed." });
  }
});

// Teacher: View all submissions
app.get("/submissions", async (req, res) => {
  try {
    const submissions = await AssignmentSubmission.find().sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch submissions." });
  }
});

// Teacher: Grade assignment
app.post("/grade-assignment", async (req, res) => {
  try {
    const { id, marks, feedback } = req.body;
    await AssignmentSubmission.findByIdAndUpdate(id, { marks, feedback });
    res.json({ success: true, message: "Grade saved!" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Unable to save grade." });
  }
});

// Get all content
app.get("/api/content", async (req, res) => {
  const content = await Content.find().sort({ uploadedAt: -1 });
  res.json(content);
});

// Get content by subject
app.get("/api/content/:subject", async (req, res) => {
  const { subject } = req.params;
  const data = await Content.find({ subject });
  res.json(data);
});

// ==================== MongoDB ====================
mongoose.connect(
  "mongodb+srv://jkaur8be24_db_user:Jas1-mongo@pratigya.ejm16ng.mongodb.net/pratigya_db"
)
.then(() => console.log("MongoDB Atlas Connected"))
.catch(err => console.log("DB Error:", err));

// ==================== Login ====================
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.email === username);
  if (!user) return res.status(401).json({ message: "Invalid email" });
  if (user.password !== password) return res.status(401).json({ message: "Invalid password" });
  if (user.role === "volunteer" && !user.email.endsWith("@thapar.edu")) {
    return res.status(403).json({ message: "Only @thapar.edu emails are allowed for volunteers" });
  }
  res.json({
    message: "Login successful",
    redirect: user.redirect,
    user: { role: user.role, email: user.email }
  });
});

// ==================== Students ====================
const Student = require("./models/Student");

// Add student
app.post("/students/add", async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json({ message: "Student added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all students
app.get("/students/all", async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

// ==================== Start Server ====================
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
