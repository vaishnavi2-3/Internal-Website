const Employee = require("../models/Employee");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");
const PersonalDetails = require("../models/personalDetails");
const Education = require("../models/educationDetails");
const ProfessionalDetails = require("../models/professionalDetails");

// 🔐 LOGIN
exports.loginEmployee = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // 1️⃣ Find employee
    const employee = await Employee.findOne({ email }).select("+password");
    if (!employee)
      return res.status(404).json({ msg: "Invalid email or password" });

    // 2️⃣ Validate password
    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch)
      return res.status(401).json({ msg: "Invalid email or password" });

if (role && role.toLowerCase() !== employee.role.toLowerCase()) {
  return res.status(403).json({ msg: "You are not allowed to login with this role" });
}


    // 4️⃣ Update login stats
// 4️⃣ Track first-time login
const isFirstLogin = !employee.hasLoggedIn;

// Update login stats
employee.lastLoginAt = new Date();
employee.loginCount = employee.loginCount + 1;

// Mark employee as "has logged in" on FIRST login only
if (isFirstLogin) {
  employee.hasLoggedIn = true;
}

await employee.save();

    // 5️⃣ Generate token
const token = jwt.sign(
  {
    employeeId: employee._id,
    email: employee.email,     // official email
    fullName: employee.fullName,
    role: employee.role,
  },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);

    const mustChangePassword = employee.mustChangePassword;

    // 🔎 Fetch other details linked by officialEmail
    const personalDetails = await PersonalDetails.findOne({ officialEmail: employee.email });
    const educationDetails = await Education.findOne({ officialEmail: employee.email });
    const professionalDetails = await ProfessionalDetails.findOne({ officialEmail: employee.email });

    res.status(200).json({
      msg: "Login successful",
      token,
      officialEmail: employee.email,        // 🔥 send separately
      fullName: employee.fullName,
      role: employee.role,

      forceChangePassword: mustChangePassword,

      mustFillPersonalDetails: !personalDetails,
      mustFillEducationDetails: !educationDetails,
      mustFillProfessionalDetails: !professionalDetails,

      employee: {
        fullName: employee.fullName,
        email: employee.email,
        role: employee.role,
        employeeId: employee._id,
      },
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};


// 🔐 RESET / CHANGE PASSWORD (Unified)
exports.handlePassword = async (req, res) => {
  try {
    const { email, currentPassword, newPassword, confirmPassword, token } = req.body;

    // ============================================================
    // 1️⃣ FORGOT PASSWORD — Send Reset Email
    // ============================================================
    if (email && !currentPassword && !newPassword && !token) {
      const employee = await Employee.findOne({ email });
      if (!employee) return res.status(404).json({ msg: "User not found" });

      const resetToken = jwt.sign({ id: employee._id }, process.env.JWT_SECRET, {
        expiresIn: "15m",
      });

      const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

      await sendEmail({
        to: email,
        subject: "Reset Your Password",
        html: `<p>Click below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`,
      });

      return res.json({ msg: "Reset link sent to email" });
    }

    // ============================================================
    // 2️⃣ RESET PASSWORD USING TOKEN (Forgot password flow)
    // ============================================================
    if (token && newPassword && confirmPassword) {
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (e) {
        return res.status(400).json({ msg: "Invalid or expired token" });
      }

      const employee = await Employee.findById(decoded.id).select("+password");
      if (!employee) return res.status(404).json({ msg: "User not found" });

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ msg: "Passwords do not match" });
      }

      employee.password = newPassword;
      employee.mustChangePassword = false;
      await employee.save();

      return res.json({ msg: "Password reset successful" });
    }

    // ============================================================
    // 3️⃣ CHANGE PASSWORD (Email + currentPassword + newPassword)
    // ============================================================
    if (email && currentPassword && newPassword && confirmPassword) {

      const employee = await Employee.findOne({ email }).select("+password");
      if (!employee) return res.status(404).json({ msg: "User not found" });

      // Validate current password
      const isMatch = await bcrypt.compare(currentPassword, employee.password);
      if (!isMatch)
        return res.status(400).json({ msg: "Current password incorrect" });

      // New password must match confirm password
      if (newPassword !== confirmPassword)
        return res.status(400).json({ msg: "New password & confirm password do not match" });

      // Prevent using old password
      const isSame = await bcrypt.compare(newPassword, employee.password);
      if (isSame)
        return res.status(400).json({ msg: "New password cannot be same as old password" });

      // Save new password
      employee.password = newPassword;
      employee.mustChangePassword = false;
      await employee.save();

      return res.json({ msg: "Password changed successfully" });
    }

    // ============================================================
    // ❌ DEFAULT — No valid flow matched
    // ============================================================
    return res.status(400).json({ msg: "Invalid request" });

  } catch (err) {
    return res.status(500).json({ msg: "Server Error", error: err.message });
  }
};
exports.getAllLoggedInEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ loginCount: { $gt: 0 } })
      .select("fullName email role employeeId lastLoginAt loginCount");

    return res.json({
      totalLoggedIn: employees.length,
      employees
    });

  } catch (err) {
    return res.status(500).json({ msg: "Server Error", error: err.message });
  }
};
