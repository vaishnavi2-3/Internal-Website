const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const path=require('path');
const fs=require('fs');
const { BlobServiceClient } = require("@azure/storage-blob");


// ✅ Import routes
const personalDetailsRoutes = require("./routes/personalDetailsRoutes");
const educationRoutes = require("./routes/educationRoutes");
const authRoutes = require("./routes/authRoutes");
const professionalRoutes = require("./routes/professionalRoutes");
const leaveRoutes=require('./routes/leaveRoutes');
const timesheetRoutes = require("./routes/timesheetRoutes");
const taskRoutes = require("./routes/taskRoutes");
const professionalHrRoutes = require("./routes/professionalHrRoutes");

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
<<<<<<< HEAD

//

app.use("/api/professionalHr", professionalHrRoutes);

console.log("serevr");
=======
//onsole.log("serevr");
>>>>>>> 5cca2c4f1c5151d4826fc7de1b1b5621e622d63b
// ✅ Default test route
app.get("/", (req, res) => res.send("Server running OK 🚀"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
