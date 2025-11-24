const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");


const {
  getFullDetailsByEmail,
  getAllEmployeesFullDetails,
    updateFullDetailsByEmail,
  partialUpdateFullDetailsByEmail,
  deleteFullDetailsByEmail,

} = require("../controllers/finalController");

// Get one employee full details
router.get("/:email", getFullDetailsByEmail);

// Get ALL employees full details
router.get("/", getAllEmployeesFullDetails);
router.put("/:email", verifyToken, updateFullDetailsByEmail);

// Partial update
router.patch("/:email", verifyToken, partialUpdateFullDetailsByEmail);

// Delete
router.delete("/:email", verifyToken, deleteFullDetailsByEmail);


module.exports = router;
