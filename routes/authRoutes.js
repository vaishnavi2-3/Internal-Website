// const express = require("express");
// const router = express.Router();
// const {
//   registerEmployee,
//   loginEmployee,
//   getAllEmployees,
//   getEmployeeById,
//   searchEmployees
// } = require("../controllers/employeeController");

// router.post("/register", registerEmployee);
// router.post("/login", loginEmployee);
// router.get("/employees", getAllEmployees);

// // 🔹 Get single employee by ID
// router.get("/:id", getEmployeeById);

// // 🔹 Search employees (optional)
// router.get("/search/query", searchEmployees);


// module.exports = router;
// /////////////////////////////////routes/personaldetailsRoutes
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


