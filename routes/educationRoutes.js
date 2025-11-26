const express = require("express");
const multer = require("multer");

const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
// const upload = require("../middleware/upload");
//  Multer setup (memory storage)
const upload = multer({ storage: multer.memoryStorage() });

const {
  saveEducationDetails,
  getEducationByOfficialEmail,
  getMyEducationDetails,
  updateEducationDetails,
  partialUpdateEducationDetails,
  deleteEducationDetails

} = require("../controllers/educationController");

// ➕ Create or Update Education (using token email)
router.post(
  "/save",
  verifyToken,
upload.fields([
  { name: "certificate10", maxCount: 1 },
  { name: "certificate12", maxCount: 1 },
  { name: "certificateUG", maxCount: 1 },
  { name: "certificateMTech", maxCount: 1 },
  { name: "certificateCourse", maxCount: 1 }  // ✅ NEW FIELD
]),
  saveEducationDetails
);
router.put("/update",verifyToken, upload.fields([
  { name: "certificate10", maxCount: 1 },
  { name: "certificate12", maxCount: 1 },
  { name: "certificateUG", maxCount: 1 },
  { name: "certificateMTech", maxCount: 1 },
  { name: "certificateCourse", maxCount: 1 },
]), updateEducationDetails);


// =====================
// PARTIAL UPDATE (PATCH)
// =====================
router.patch("/partialupdate",verifyToken, upload.fields([
  { name: "certificate10", maxCount: 1 },
  { name: "certificate12", maxCount: 1 },
  { name: "certificateUG", maxCount: 1 },
  { name: "certificateMTech", maxCount: 1 },
  { name: "certificateCourse", maxCount: 1 },
]), partialUpdateEducationDetails);


// =====================
// DELETE EDUCATION
// =====================
router.delete("/delete",verifyToken, deleteEducationDetails);

// 📌 Get current user's education (based on token email)
router.get("/me", verifyToken, getMyEducationDetails);

// 📌 Get all education records (admin only OR remove admin condition)
router.get("/all", getEducationByOfficialEmail);


module.exports = router;
