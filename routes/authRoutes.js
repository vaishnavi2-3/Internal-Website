
const express = require("express");
const { registerEmployee,getAllEmployees,getEmployeeById,getEmployeeByEmail } = require("../controllers/employeeController");
const { loginEmployee,handlePassword } = require("../controllers/authController");
const router = express.Router();

router.post("/register", registerEmployee);
router.post("/login", loginEmployee);
router.get("/", getAllEmployees);
router.get("/:id", getEmployeeById);
router.get("/email/:email", getEmployeeByEmail);


// Forgot Password (generate reset link)

// Reset Password (use reset link)
router.post("/password", handlePassword);




module.exports = router;


