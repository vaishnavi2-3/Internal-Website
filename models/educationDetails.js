// const mongoose = require("mongoose");

// const educationDetailsSchema = new mongoose.Schema({
//   employee: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   tenth: {
//     schoolName: String,
//     yearOfPassing: String,
//     percentage: String,
//     certificate: String,     // Local file path (uploads/tenth.pdf)
//     certificateUrl: String,  // Azure Blob URL
//   },
//   intermediate: {
//     collegeName: String,
//     yearOfPassing: String,
//     percentage: String,
//     certificate: String,
//     certificateUrl: String,
//   },
//   degree: {
//     collegeName: String,
//     yearOfPassing: String,
//     cgpa: String,
//     certificate: String,
//     certificateUrl: String,
//   },
//   mtech: {
//     collegeName: String,
//     yearOfPassing: String,
//     cgpa: String,
//     certificate: String,
//     certificateUrl: String,
//   },
// });

// module.exports = mongoose.model("EducationDetails", educationDetailsSchema);
const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema({
  employeeId: {
  type: String,
  required: true,
},

  // ---------- 10th Class ----------
  schoolName10: {
    type: String,
    required: true,
    trim: true,
  },
  year10: {
    type: Number,
    required: true,
  },
  cgpa10: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  certificate10: {
    type: String, // store file URL or path (e.g., from cloud or uploads folder)
    required: true,
  },

  // ---------- Intermediate / Diploma ----------
  interOrDiploma: {
    type: String,
    enum: ["Intermediate", "Diploma"],
    required: true,
  },
  collegeName12: {
    type: String,
    required: true,
    trim: true,
  },
  year12: {
    type: Number,
    required: true,
  },
  cgpa12: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  certificate12: {
    type: String,
    required: true,
  },
  gapReason12: {
    type: String,
    default: "", // optional, filled if user had a gap
  },

  // ---------- UG (B.Tech / Degree) ----------
  collegeNameUG: {
    type: String,
    required: true,
    trim: true,
  },
  yearUG: {
    type: Number,
    required: true,
  },
  cgpaUG: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  certificateUG: {
    type: String,
    required: true,
  },
  gapReasonUG: {
    type: String,
    default: "",
  },

  // ---------- PG (M.Tech / ISM Tech) ----------
  hasMTech: {
    type: Boolean,
    default: false,
  },
  collegeNameMTech: {
    type: String,
  },
  yearMTech: {
    type: Number,
  },
  cgpaMTech: {
    type: Number,
    min: 0,
    max: 100,
  },
  certificateMTech: {
    type: String,
  },

  // ---------- Common Metadata ----------
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Education", educationSchema);
