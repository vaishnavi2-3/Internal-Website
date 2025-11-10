const express = require("express");
const multer = require("multer");
const {
  saveEducationDetails,
  getAllEducationDetails,
  getEducationDetailsById,
} = require("../controllers/educationController");

const router = express.Router();

//  Multer setup (memory storage)
const upload = multer({ storage: multer.memoryStorage() });

//  Define upload fields (match frontend input names)
const uploadFields = upload.fields([
  { name: "certificate10", maxCount: 1 },
  { name: "certificate12", maxCount: 1 },
  { name: "certificateUG", maxCount: 1 },
  { name: "certificateMTech", maxCount: 1 },
]);

//  POST: Save Education Details (with Azure Upload)
router.post("/save", uploadFields, saveEducationDetails);

//  GET: Fetch all education details
router.get("/", getAllEducationDetails);

//  GET: Fetch education details by MongoDB _id
router.get("/:id", getEducationDetailsById);

module.exports = router;
