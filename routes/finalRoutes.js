const express = require("express");
const router = express.Router();
const { getEmployeeFullDetails } = require("../controllers/finalController");

// Get all employees
router.get("/details", getEmployeeFullDetails);

// Get single employee by employeeId
router.get("/details/:empId", getEmployeeFullDetails);

module.exports = router;
