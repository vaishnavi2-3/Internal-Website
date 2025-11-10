const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const path=require('path');
const fs=require('fs');
const { BlobServiceClient } = require("@azure/storage-blob");
const cron = require("node-cron");

// 🕒 Run every minute
// cron.schedule("* * * * *", () => {
//   console.log("⏰ Cron Job Running Every Minute!");
// });


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



// serve uploaded files statically
//app.use("/uploads", express.static(path.join(__dirname, "uploads")));


dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());
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
app.use("/api", finalRoutes); 
app.use("/api/professionalHr", professionalHrRoutes); 
app.use("/api/holidays", holidayRoutes);

//onsole.log("serevr");
// ✅ Default test route
app.get("/", (req, res) => res.send("Server running OK 🚀"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
