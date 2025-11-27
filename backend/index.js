const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());


mongoose.connect(
  "mongodb+srv://jkaur8be24_db_user:Jas1-mongo@pratigya.ejm16ng.mongodb.net/"
)
.then(() => console.log(" MongoDB Atlas Connected"))
.catch(err => console.log(" DB Error:", err));



const Student = require("./models/Student");



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



app.post("/login", (req, res) => {
  const { username, password, rolePage } = req.body;

  console.log("LOGIN ATTEMPT:", username, password);

  const user = users.find(u => u.email === username);

  if (!user) {
    return res.status(401).json({ message: "Invalid email" });
  }

  if (user.password !== password) {
    return res.status(401).json({ message: "Invalid password" });
  }

  if (user.role === "volunteer" && !user.email.endsWith("@thapar.edu")) {
    return res.status(403).json({
      message: "Only @thapar.edu emails are allowed for volunteers"
    });
  }

  res.json({
    message: "Login successful",
    redirect: user.redirect,
    user: {
      role: user.role,
      email: user.email
    }
  });
});



app.post("/students/add", async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json({ message: "Student added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



app.get("/students/all", async (req, res) => {
  const students = await Student.find();
  res.json(students);
});


app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
