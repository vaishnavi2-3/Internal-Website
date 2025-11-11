const express = require("express");
const router = express.Router();
const { mergeCollections, getFullDetailsByEmployeeId, getAllMergedEmployees } = require("../controllers/mergeController");

// POST → merge all collections
router.post("/merge", mergeCollections);

// GET → get all merged employee details
router.get("/employees", getAllMergedEmployees);

// GET → get one employee by ID
router.get("/employee/:empId", getFullDetailsByEmployeeId);

module.exports = router;
