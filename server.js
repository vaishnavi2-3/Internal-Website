const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const path=require('path');
const fs=require('fs');
const { BlobServiceClient } = require("@azure/storage-blob");
const cron = require("node-cron");
const { setupSwagger } = require("./config/swagger"); // adjust path if needed
const http = require("http");
const { Server } = require("socket.io");

// Create HTTP server manually

// 🕒 Run every minute
// cron.schedule("* * * * *", () => {
//   console.log("⏰ Cron Job Running Every Minute!");
// });
// console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Loaded" : "Not Loaded");


// ✅ Import routes
const personalDetailsRoutes = require("./routes/personalDetailsRoutes");
const educationRoutes = require("./routes/educationRoutes");
const authRoutes = require("./routes/authRoutes");
const professionalRoutes = require("./routes/professionalRoutes");
const leaveRoutes=require('./routes/leaveRoutes');
const timesheetRoutes = require("./routes/timesheetRoutes");
const taskRoutes = require("./routes/taskRoutes");
const finalRoutes = require("./routes/finalRoutes"); // <-- your employee routes file
const professionalHrRoutes = require("./routes/professionalHrRoutes");
const holidayRoutes = require("./routes/holidayRoutes");
const mergeRoutes = require("./routes/mergeRoutes");
const projectRoutes = require("./routes/projectTimelineRoutes");
const trainingRoutes = require("./routes/trainingRoutes");
const certificationRoutes = require("./routes/certificationRoutes");
const jobRoutes = require("./routes/jobRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");  // ✅ NEW
const reminderRoutes = require("./routes/reminderRoutes");



// serve uploaded files statically
//app.use("/uploads", express.static(path.join(__dirname, "uploads")));


dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For form-data support
// app.use(cors({
//   origin: (origin, callback) => {
//     callback(null, origin || "*"); // allow all origins
//   },
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true
// }));
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST","PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true

  }
});
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  // When user disconnects
  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });

  // Receive event from client
  socket.on("sendMessage", (data) => {
    console.log("Message Received:", data);

    // Broadcast to other clients
    io.emit("receiveMessage", data);
  });
});


setupSwagger(app);   // 👈 MUST BE HERE


app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }


// ✅ Mount routes properly
app.use("/api/auth", authRoutes);
app.use("/api/personal", personalDetailsRoutes);
app.use("/api/education", educationRoutes);
app.use("/api/professional", professionalRoutes);
app.use("/api/leaves",leaveRoutes);
app.use("/api/timesheet", timesheetRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/employee", finalRoutes); 
app.use("/api/professionalHr", professionalHrRoutes); 
app.use("/api/holidays", holidayRoutes);
app.use("/api", mergeRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/training", require("./routes/trainingRoutes"));
app.use("/api/certifications", certificationRoutes);
app.use("/api/hrleaves", require("./routes/HrLeavesRoutes"));
app.use("/api", jobRoutes);
app.use("/api/hr", require("./routes/hrDashboardRoutes"));        // HR Dashboard APIs
app.use("/api/birthdays", require("./routes/birthdayRoutes"));   // Birthdays of this week
app.use("/api/employees", require("./routes/employeeRoutes"));
app.use("/debug", require("./routes/debug"));
app.use("/api/attendance", attendanceRoutes);   // ⭐ IMPORTANT
app.use("/api/reminder", reminderRoutes);
require("./cron/reminderCleaner");   // <-- ★ IMPORTANT



//console.log("serevr");
//onsole.log("serevr");
// ✅ Default test route
app.get("/", (req, res) => res.send("Server running OK 🚀"));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
module.exports = { io };
