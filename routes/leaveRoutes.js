// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const path = require("path");
// const { createLeave, getLeaves } = require("../controllers/leaveController");

// // ✅ Multer config (temporary local save before uploading to Azure)
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/leaves/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const upload = multer({ storage });

// // ✅ Routes
// router.post("/create", upload.single("file"), createLeave);
// router.get("/", getLeaves);

// module.exports = router;
const express = require("express");
const router = express.Router();
const multer = require("multer");
const { createLeave, getLeaves } = require("../controllers/leaveController");

// ✅ Memory storage (Vercel-compatible)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Routes
router.post("/create", upload.single("file"), createLeave);
router.get("/", getLeaves);

module.exports = router;
