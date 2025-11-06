const mongoose = require("mongoose");
const { Schema } = mongoose;

// Sub-schema for uploaded files
const fileSub = new Schema({
  filename: String,
  path: String,
  mimetype: String,
  size: Number,
}, { _id: false });

// Experience schema
const experienceSchema = new Schema({
  companyName: { type: String, required: true },
  companyLocation: { type: String, required: true },
  jobTitle: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  duration: { type: String },
  roles: { type: String, required: true },
  projects: { type: String, required: true },
  skills: { type: String, required: true },
  salary: { type: String, required: true },

  // Files
  relivingLetter: { type: fileSub, default: null },       // single file
  salarySlips: { type: [fileSub], default: [] },          // array of files

  // HR details
  hrName: { type: String, required: true },
  hrEmail: { type: String, required: true },
  hrPhone: { type: String, required: true },

  // Manager details
  managerName: { type: String, required: true },
  managerEmail: { type: String, required: true },
  managerPhone: { type: String, required: true },
}, { _id: false });

// Main Professional schema
const professionalDetailsSchema = new Schema({
  employeeId: { type: String, required: true, unique: true },
  dateOfJoining: { type: Date, required: true },
  role: { type: String, required: true },
  department: { type: String, required: true },
  salary: { type: String, required: true },
  hasExperience: { type: Boolean, default: false },
  experiences: { type: [experienceSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model("ProfessionalDetails", professionalDetailsSchema);
