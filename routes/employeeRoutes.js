const express = require("express");
const router = express.Router();

const {
  createEmployeeByHR,
//   loginEmployee,
//   handlePassword,
} = require("../controllers/employeeController");

// ===============================
// 👉 HR CREATE EMPLOYEE
// ===============================
router.post("/create", createEmployeeByHR);

// ===============================
// 👉 LOGIN
// ===============================
// router.post("/login", loginEmployee);

// // ===============================
// // 👉 PASSWORD HANDLING
// //  1. Forgot Password (send reset link)
// //  2. Reset Password (via token)
// //  3. Change Password (normal)
// // ===============================
// router.post("/password", handlePassword);

module.exports = router;
