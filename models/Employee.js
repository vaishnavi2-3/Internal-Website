const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const employeeSchema = new mongoose.Schema({
  fullName: { type: String, required: true },

  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true
  },

role: {
  type: String,
  enum: ["Employee", "Manager", "HR", "Admin"],
  default: "Employee",
  set: (v) => v.charAt(0).toUpperCase() + v.slice(1).toLowerCase()
}, 

  password: { type: String, required: true, select: false },
  confirmPassword: { type: String, select: false },

  mustChangePassword: { type: Boolean, default: false },
  hasLoggedIn: { type: Boolean, default: false },

  loginCount: { type: Number, default: 0 },
  lastLoginAt: Date,
});

// Hash password
employeeSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  this.confirmPassword = undefined;
  next();
});

// Compare password
employeeSchema.methods.comparePassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model("Employee", employeeSchema);
