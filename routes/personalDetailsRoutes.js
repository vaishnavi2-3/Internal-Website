const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  savePersonalDetails,
  getAllPersonalDetails,
  getPersonalDetailsByEmail,
  getMyPersonalDetails,
  updatePersonalDetails,
  partialUpdatePersonalDetails,
  deletePersonalDetails
} = require("../controllers/personalDetailsController");

const { verifyToken } = require("../middleware/authMiddleware");



const router = express.Router();

const storage = multer.memoryStorage(); // use memory for Azure upload
const upload = multer({ storage });
/**
 * @swagger
 * /api/personal/save:
 *   post:
 *     summary: Save personal details
 *     tags: [Personal]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *               aadharUpload:
 *                 type: string
 *                 format: binary
 *               panUpload:
 *                 type: string
 *                 format: binary
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Personal details saved
 */

// Routes
router.post(
  "/save",verifyToken,
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "aadharUpload", maxCount: 1 },
    { name: "panUpload", maxCount: 1 },
    { name: "marriageCertificate", maxCount: 1 },
  ]),
  savePersonalDetails
);

router.get("/me", verifyToken, getMyPersonalDetails);
router.get("/:email", verifyToken, getPersonalDetailsByEmail);
router.get("/", getAllPersonalDetails);
router.put(
  "/update",
  verifyToken,
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "aadharUpload", maxCount: 1 },
    { name: "panUpload", maxCount: 1 },
    { name: "marriageCertificate", maxCount: 1 },
  ]),
  updatePersonalDetails
);

// PARTIAL UPDATE
router.patch(
  "/partialupdate",
  verifyToken,
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "aadharUpload", maxCount: 1 },
    { name: "panUpload", maxCount: 1 },
    { name: "marriageCertificate", maxCount: 1 },
  ]),
  partialUpdatePersonalDetails
);

// DELETE PERSONAL DETAILS
router.delete("/delete", verifyToken, deletePersonalDetails);





module.exports = router;