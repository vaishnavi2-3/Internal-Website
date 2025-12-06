
// const express = require("express");
// const { registerEmployee,getAllEmployees,getEmployeeById,getEmployeeByEmail } = require("../controllers/employeeController");
// const { loginEmployee,handlePassword } = require("../controllers/authController");
// const router = express.Router();

// router.post("/register", registerEmployee);
// router.post("/login", loginEmployee);
// router.get("/all", getAllEmployees);
// router.get("/:id", getEmployeeById);
// router.get("/email/:email", getEmployeeByEmail);


// // Forgot Password (generate reset link)

// // Reset Password (use reset link)
// router.post("/password", handlePassword);




// module.exports = router;
const express = require("express");
const router = express.Router();

const {
  loginEmployee,
  handlePassword,
  getAllLoggedInEmployees
} = require("../controllers/authController");

// ------------------------
// AUTH ROUTES
// ------------------------
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */

// Employee Login
router.post("/login", loginEmployee);

// Password operations (Forgot / Reset / Change)
router.post("/password", handlePassword);
router.get("/employees/logged-in/total", getAllLoggedInEmployees);

module.exports = router;


