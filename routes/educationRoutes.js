// const express = require("express");
// const multer = require("multer");
// const {
//   saveEducationDetails,
//   getAllEducationDetails,
//   getEducationDetailsById,
// } = require("../controllers/educationController");

// const router = express.Router();

// //  Multer setup (memory storage)
// const upload = multer({ storage: multer.memoryStorage() });

// //  Define upload fields (match frontend input names)
// const uploadFields = upload.fields([
//   { name: "certificate10", maxCount: 1 },
//   { name: "certificate12", maxCount: 1 },
//   { name: "certificateUG", maxCount: 1 },
//   { name: "certificateMTech", maxCount: 1 },
// ]);

// //  POST: Save Education Details (with Azure Upload)
// router.post("/save", uploadFields, saveEducationDetails);

// //  GET: Fetch all education details
// router.get("/", getAllEducationDetails);

// //  GET: Fetch education details by MongoDB _id
// router.get("/:id", getEducationDetailsById);

// module.exports = router;
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
