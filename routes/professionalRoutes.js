const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
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
router.get("/:empId", getProfessionalDetailsByEmpId);

module.exports = router;
