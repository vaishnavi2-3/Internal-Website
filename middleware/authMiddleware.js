const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) return res.status(401).json({ msg: "Access denied, no token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.employee = await Employee.findById(decoded.id).select("-password");
    if (!req.employee) return res.status(404).json({ msg: "Employee not found" });
    next();
  } catch (err) {
    res.status(400).json({ msg: "Invalid token" });
  }
};


const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ msg: "No token provided, authorization denied." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey");

    const employee = await Employee.findOne({ email: decoded.email });
    if (!employee) {
      return res.status(404).json({ msg: "Employee not found." });
    }

    req.user = employee;
    next();
  } catch (error) {
    console.error("❌ Auth Middleware Error:", error);
    res.status(401).json({ msg: "Invalid or expired token" });
  }
};

module.exports = {authMiddleware, verifyToken };

