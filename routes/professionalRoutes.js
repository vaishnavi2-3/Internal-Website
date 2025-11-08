const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
// console.log("🔥 Professional route loaded");

const {
  saveProfessionalDetails,
  getAllProfessionalDetails,
  getProfessionalDetailsByEmpId,
} = require("../controllers/professionalController");

// 📂 Multer Storage
const storage = multer.memoryStorage(); // Use memory for Azure upload
const upload = multer({ storage });

// 🧾 Routes
router.post("/save", upload.any(), saveProfessionalDetails); // upload.any() accepts all files
router.get("/", getAllProfessionalDetails);
router.get("/test", (req, res) => {
  console.log("✅ Route file is active");
  res.send("Route OK");
});

router.get("/:employeeId", getProfessionalDetailsByEmpId);

module.exports = router;
