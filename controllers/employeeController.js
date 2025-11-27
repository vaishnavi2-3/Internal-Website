// const Employee = require("../models/Employee");

// // 🧾 Register new employee
// exports.registerEmployee = async (req, res) => {
//   try {
//     const {
//       firstName,
//       lastName,
//       dateOfBirth,
//       email,
//       phoneNumber,
//       password,
//       confirmPassword,
//     } = req.body;

//     // ✅ Simple check first
//     if (password !== confirmPassword) {
//       return res.status(400).json({ msg: "Passwords do not match" });
//     }

//     // ✅ Create new employee
//     const newEmployee = new Employee({
//       firstName,
//       lastName,
//       dateOfBirth,
//       email,
//       phoneNumber,
//       password,
//     });

//     // ✅ Set virtual field manually (important!)
//     newEmployee.confirmPassword = confirmPassword;

//     // Save to MongoDB
//     await newEmployee.save();

//     res.status(201).json({
//       msg: "✅ Employee registered successfully",
//       employee: {
//         firstName: newEmployee.firstName,
//         lastName: newEmployee.lastName,
//         email: newEmployee.email,
//         phoneNumber: newEmployee.phoneNumber,
//         role: newEmployee.role,
//       },
//     });
//   } catch (err) {
//     console.error("❌ Error registering employee:", err);
//     res.status(500).json({ msg: "Server Error", error: err.message });
//   }
// };
// // 🟢 Get all employees
// exports.getAllEmployees = async (req, res) => {
//   try {
//     const employees = await Employee.find().select("-password"); // hide password
//     res.status(200).json({ msg: "Employees fetched successfully",  count: employees.length,
//  employees });
    

//   } catch (err) {
//     console.error("❌ Error fetching employees:", err);
//     res.status(500).json({ msg: "Server Error", error: err.message });
//   }
// };

// // 🟢 Get single employee by ID
// exports.getEmployeeById = async (req, res) => {
//   try {
//     const employee = await Employee.findById(req.params.id).select("-password");
//     if (!employee) {
//       return res.status(404).json({ msg: "Employee not found" });
//     }
//     res.status(200).json({ msg: "Employee fetched successfully", employee });
//   } catch (err) {
//     console.error("❌ Error fetching employee:", err);
//     res.status(500).json({ msg: "Server Error", error: err.message });
//   }
// };
// exports.getEmployeeByEmail = async (req, res) => {
//   try {
//     const { email } = req.params;

//     const employee = await Employee.findOne({ email }).select("-password");

//     if (!employee) {
//       return res.status(404).json({ msg: "Employee not found" });
//     }

//     res.status(200).json({
//       msg: "Employee fetched successfully by Email",
//       employee,
//     });
//   } catch (err) {
//     console.error("❌ Error fetching employee by Email:", err);
//     res.status(500).json({ msg: "Server Error", error: err.message });
//   }
// };

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
