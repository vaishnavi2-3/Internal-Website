const express = require("express");
const router = express.Router();

const {
  getFullEmployeeDetailsByEmpId,
  getAllFullEmployeeDetails,
} = require("../controllers/finalController");

// ✅ Get all employees with merged details
router.get("/employees", getAllFullEmployeeDetails);

// ✅ Get single employee full details by EmpId
router.get("/employee/:employeeId", getFullEmployeeDetailsByEmpId);

module.exports = router;
