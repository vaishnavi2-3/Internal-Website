// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const path = require("path");
// // console.log("🔥 Professional route loaded");

// const {
  
//   saveProfessionalDetails,
//   getAllProfessionalDetails,
//   getProfessionalDetailsByEmpId,
// } = require("../controllers/professionalController");

// // 📂 Multer Storage
// const storage = multer.memoryStorage(); // Use memory for Azure upload
// const upload = multer({ storage });

// // 🧾 Routes
// router.post("/save", upload.any(), saveProfessionalDetails); // upload.any() accepts all files
// router.get("/", getAllProfessionalDetails);
// router.get("/test", (req, res) => {
//   console.log("✅ Route file is active");
//   res.send("Route OK");
// });

// router.get("/:employeeId", getProfessionalDetailsByEmpId);

// module.exports = router;
const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const storage = multer.memoryStorage(); // Use memory for Azure upload
const upload = multer({ storage });

const {
  saveProfessionalDetails,
  getMyProfessionalDetails,
  getProfessionalDetailsByEmail,
  getAllProfessionalDetails,
  getProfessionalDetailsByEmployeeId,
    updateProfessionalDetails,
  partialUpdateProfessionalDetails,
  deleteProfessionalDetails

} = require("../controllers/professionalController");

// Save / Update
router.post(
  "/save",
  verifyToken,
  upload.any(),   // because experience files have dynamic field names
  saveProfessionalDetails
);

// Logged-in user details
router.get("/me", verifyToken, getMyProfessionalDetails);

// Get by email (admin)
router.get("/:email", verifyToken, getProfessionalDetailsByEmail);
router.put("/", verifyToken, upload.any(), updateProfessionalDetails);

// PARTIAL UPDATE
router.patch("/", verifyToken, upload.any(), partialUpdateProfessionalDetails);

// DELETE
router.delete("/", verifyToken, deleteProfessionalDetails);

// Get all (admin)
router.get("/all",  getAllProfessionalDetails);
router.get("/id/:employeeId", getProfessionalDetailsByEmployeeId);


module.exports = router;
