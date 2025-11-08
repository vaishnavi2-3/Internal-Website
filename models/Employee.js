const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    unique: true,
    default: function () {
      return "EMP" + Date.now(); // 🆔 Example: EMP1730714819035
    },
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
email: { 
  type: String, 
  required: true, 
  unique: true, 
  lowercase: true,  // 👈 automatically convert to lowercase
  trim: true        // 👈 remove extra spaces
},
  phoneNumber: { type: String, required: true },
  password: { type: String, required: true, select: false },
  role: {
    type: String,
    enum: ["employee", "admin"],
    default: "employee",
  },
  resetToken: { type: String },
resetTokenExpiry: { type: Date }

});

// 🔐 Password encryption
employeeSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🧩 Confirm password (virtual)
employeeSchema.virtual("confirmPassword")
  .set(function (value) {
    this._confirmPassword = value;
  });

employeeSchema.pre("validate", function (next) {
  if (this.password !== this._confirmPassword) {
    this.invalidate("confirmPassword", "Passwords do not match");
  }
  next();
});

employeeSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Employee", employeeSchema);
