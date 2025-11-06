const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  savePersonalDetails,
  getAllPersonalDetails,
  getPersonalDetails,
} = require("../controllers/personalDetailsController");

const router = express.Router();

const storage = multer.memoryStorage(); // use memory for Azure upload
const upload = multer({ storage });

// Routes
router.post(
  "/save",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "aadharUpload", maxCount: 1 },
    { name: "panUpload", maxCount: 1 },
    { name: "marriageCertificate", maxCount: 1 },
  ]),
  savePersonalDetails
);

router.get("/", getAllPersonalDetails);
router.get("/:email", getPersonalDetails);

module.exports = router;
