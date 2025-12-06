
const Employee = require("../models/Employee");
const sendEmail = require("../utils/sendEmail");
const generatePassword = require("../utils/generatePassword");

exports.createEmployeeByHR = async (req, res) => {
  try {
    const { fullName, email, role } = req.body;

    const existing = await Employee.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Email already exists" });

    const tempPassword = generatePassword();

    const employee = await Employee.create({
      fullName,          // 👈 USE THIS
      email,
      role,
      password: tempPassword,
      confirmPassword: tempPassword,
      mustChangePassword: true,
    });

    await sendEmail({
      to: email,
      subject: "Your Employee Login Credentials",
      html: `
        <h3>Hello ${fullName},</h3>
        <p>Your employee account has been successfully created.</p>

        <p><b>Email:</b> ${email}</p>
        <p><b>Temporary Password:</b> ${tempPassword}</p>

        <p>You can log in using the link below:</p>
        <p>
          <a href="https://employe-connect.dhatvibs.com/login"
            style="color: #1a73e8; font-weight: bold;">
            Click here to login
          </a>
        </p>

        <p>Please login and reset your password immediately.</p>
        <br>
        <p>Thank you,<br>HR Team</p>
      `,
    });

    res.status(201).json({ msg: "Employee created & credentials sent." });

  } catch (err) {
    console.error("HR Create Error:", err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};
