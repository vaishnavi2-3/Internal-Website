const Employee = require("../models/Employee");

// 🧾 Register new employee
exports.registerEmployee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      email,
      phoneNumber,
      password,
      confirmPassword,
    } = req.body;

    // ✅ Simple check first
    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }

    // ✅ Create new employee
    const newEmployee = new Employee({
      firstName,
      lastName,
      dateOfBirth,
      email,
      phoneNumber,
      password,
    });

    // ✅ Set virtual field manually (important!)
    newEmployee.confirmPassword = confirmPassword;

    // Save to MongoDB
    await newEmployee.save();

    res.status(201).json({
      msg: "✅ Employee registered successfully",
      employee: {
        firstName: newEmployee.firstName,
        lastName: newEmployee.lastName,
        email: newEmployee.email,
        phoneNumber: newEmployee.phoneNumber,
        role: newEmployee.role,
      },
    });
  } catch (err) {
    console.error("❌ Error registering employee:", err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};
// 🟢 Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().select("-password"); // hide password
    res.status(200).json({ msg: "Employees fetched successfully", employees });
  } catch (err) {
    console.error("❌ Error fetching employees:", err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

// 🟢 Get single employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select("-password");
    if (!employee) {
      return res.status(404).json({ msg: "Employee not found" });
    }
    res.status(200).json({ msg: "Employee fetched successfully", employee });
  } catch (err) {
    console.error("❌ Error fetching employee:", err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};
exports.getEmployeeByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const employee = await Employee.findOne({ email }).select("-password");

    if (!employee) {
      return res.status(404).json({ msg: "Employee not found" });
    }

    res.status(200).json({
      msg: "Employee fetched successfully by Email",
      employee,
    });
  } catch (err) {
    console.error("❌ Error fetching employee by Email:", err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

