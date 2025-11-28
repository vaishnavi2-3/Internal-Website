// // const mongoose = require("mongoose");
// // const bcrypt = require("bcryptjs");

// // const employeeSchema = new mongoose.Schema({
// //   employeeId: {
// //     type: String,
// //     unique: true,
// //     default: function () {
// //       return "EMP" + Date.now(); // 🆔 Example: EMP1730714819035
// //     },
// //   },
// //   firstName: { type: String, required: true },
// //   lastName: { type: String, required: true },
// //   dateOfBirth: { type: Date, required: true },
// // email: { 
// //   type: String,
// //   required: true, 
// //   unique: true, 
// //   lowercase: true,  // 👈 automatically convert to lowercase
// //   trim: true        // 👈 remove extra spaces
// // },
// //   phoneNumber: { type: String, required: true },
// //   password: { type: String, required: true, select: false },
// // roles: {
// //   type: [String],
// //   enum: ["employee", "hr", "manager", "admin"],
// //   default: ["employee"]
// // },
// //   mustChangePassword: { type: Boolean, default: false }, // 🚨 First-time login password change

// //   loginCount: { type: Number, default: 0 },
// //   lastLoginAt: { type: Date },

// //   resetToken: { type: String },
// // resetTokenExpiry: { type: Date }

// // });

// // // 🔐 Password encryption
// // employeeSchema.pre("save", async function (next) {
// //   if (!this.isModified("password")) return next();
// //   const salt = await bcrypt.genSalt(10);
// //   this.password = await bcrypt.hash(this.password, salt);
// //   next();
// // });

// // // 🧩 Confirm password (virtual)
// // employeeSchema.virtual("confirmPassword")
// //   .set(function (value) {
// //     this._confirmPassword = value;
// //   });

// // employeeSchema.pre("validate", function (next) {
// //   if (this.password !== this._confirmPassword) {
// //     this.invalidate("confirmPassword", "Passwords do not match");
// //   }
// //   next();
// // });

// // employeeSchema.methods.comparePassword = async function (enteredPassword) {
// //   return await bcrypt.compare(enteredPassword, this.password);
// // };

// // module.exports = mongoose.model("Employee", employeeSchema);
// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");

// const employeeSchema = new mongoose.Schema({
//   firstName: String,
//   lastName: String,
//   email: { type: String, required: true, unique: true },
//   role: { type: String, enum: ["Employee", "Manager", "HR", "Admin"], default: "Employee" },

//   password: { type: String, required: true, select: false },
//   confirmPassword: { type: String, select: false },

//   mustChangePassword: { type: Boolean, default: false }, // 🚨 First-time login password change
//   loginCount: { type: Number, default: 0 },
//   lastLoginAt: Date,
// });

// // Hash password before save
// employeeSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   this.confirmPassword = undefined;
//   next();
// });

// // Compare password
// employeeSchema.methods.comparePassword = async function (entered) {
//   return await bcrypt.compare(entered, this.password);
// };

// module.exports = mongoose.model("Employee", employeeSchema);
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
