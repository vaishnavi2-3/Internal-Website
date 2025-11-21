const mongoose = require("mongoose");
const { Schema } = mongoose;

const fileSub = new Schema({
  filename: String,
  path: String,
  mimetype: String,
  size: Number,
});

const educationSchema = new mongoose.Schema({
  officialEmail: { type: String, required: true },

  // ---------- 10th Class ----------
  schoolName10: { type: String, required: true, trim: true },
  year10: { type: Number, required: true },
  cgpa10: { type: Number, required: true, min: 0, max: 100 },
  certificate10: { type: fileSub, required: true },

  // ---------- 12th / Diploma ----------
  interOrDiploma: { type: String, enum: ["Intermediate", "Diploma"], required: true },
  collegeName12: { type: String, required: true },
  year12: { type: Number, required: true },
  cgpa12: { type: Number, required: true, min: 0, max: 100 },
  certificate12: { type: fileSub, required: true },
  gapReason12: { type: String, default: "" },

  // ---------- UG ----------
  collegeNameUG: { type: String, required: true },
  yearUG: { type: Number, required: true },
  cgpaUG: { type: Number, required: true, min: 0, max: 100 },
  certificateUG: { type: fileSub, required: true },
  gapReasonUG: { type: String, default: "" },

  // ---------- PG (M.Tech) ----------
  hasMTech: { type: Boolean, default: false },
  collegeNameMTech: { type: String },
  yearMTech: { type: Number },
  cgpaMTech: { type: Number, min: 0, max: 100 },
  certificateMTech: { type: fileSub },

  // ---------- Course Section (NEW) ----------
  hasCourse: { type: Boolean, default: false },
  courseName: { type: String },
  instituteName: { type: String },
  courseDuration: { type: String },
  cgpaCourse: { type: Number, min: 0, max: 100 },
  certificateCourse: { type: fileSub },
  yearCourse: { type: Number },

  createdAt: { type: Date, default: Date.now }
});
educationSchema.index({ officialEmail: 1 });


module.exports = mongoose.model("Education", educationSchema);
