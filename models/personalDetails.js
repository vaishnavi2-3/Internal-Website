
// const mongoose = require("mongoose");
// const { Schema } = mongoose;
// const fileSub = new Schema({
//   filename: String,
//   path: String,
//   mimetype: String,
//   size: Number,
// });

// const personalDetailsSchema = new mongoose.Schema(
//   {
//   officialEmail: { type: String, required: true },   // 👈 from token

//     // --- Basic Info ---
//     firstName: { type: String, required: true },
//     middleName: { type: String },
//     lastName: { type: String, required: true },

//     // --- Parent Info ---
//     fatherName: { type: String, required: true },
//     motherName: { type: String, required: true },

//     // --- Contact Info ---
//     email: { type: String, required: true },
//     phone: { type: String, required: true },
//     alternativePhone: { type: String },

//     // --- Gender & Blood Group ---
//     gender: { type: String, required: true },
//     bloodGroup: { type: String, required: true },

//     // --- Photo Upload (store as URL or path) ---
//     photo: { type: String, required: true },

//     // --- Address Info ---
//     currentAddress: { type: String, required: true },
//     sameAddress: { type: Boolean, default: false },
//     permanentAddress: { type: String, required: true },
//     landmark: { type: String, required: true },
//     pincode: { type: String, required: true },
//     village: { type: String },
//     state: { type: String, required: true },

//     // --- Emergency Info ---
//     emergencyNumber: { type: String, required: true },

//     // --- Nominee Info ---
//     nominee1: { type: String, required: true },
//     nominee2: { type: String, required: true },

//     // --- Identity Info ---
//     aadharNumber: { type: String, required: true },
//     aadharUpload: { type: fileSub, required: true }, // file URL or path

//     panNumber: { type: String, required: true },
//     panUpload: { type: fileSub, required: true }, // file URL or path

//     // --- Marriage Info ---
//     isMarried: { type: Boolean, default: false },
//     marriageCertificate: {
//       type: fileSub,
//       required: function () {
//         // Required only if the employee is married
//         return this.isMarried === true;
//       },
//     },

//     // --- Metadata ---
//     createdAt: { type: Date, default: Date.now },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("PersonalDetails", personalDetailsSchema);
const mongoose = require("mongoose");
const { Schema } = mongoose;

const fileSub = new Schema({
  filename: String,
  path: String,
  mimetype: String,
  size: Number,
});

const personalDetailsSchema = new mongoose.Schema(
  {
    officialEmail: { type: String, required: true }, // from token

    // --- Basic Info ---
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    dob: { type: String, required: true },

    // --- Parent Info ---
    fatherName: { type: String, required: true },
    motherName: { type: String, required: true },

    // --- Contact Info ---
    email: { type: String, required: true },
    phone: { type: String, required: true },
    alternativePhone: { type: String },

    // --- Additional Info ---
    gender: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    maritalStatus: { type: String, required: true },

    // --- Photo Upload ---
    photo: { type: String, required: true },

    // --- Address Info ---
currentAddress: { type: String, required: true },
landmarkCurrent: { type: String, required: true },
pincodeCurrent: { type: String, required: true },
villageCurrent: { type: String },
stateCurrent: { type: String, required: true },

permanentAddress: { type: String, required: true },
landmarkPermanent: { type: String, required: true },
pincodePermanent: { type: String, required: true },
villagePermanent: { type: String },
statePermanent: { type: String, required: true },

sameAddress: { type: Boolean, default: false },

    // --- Emergency Info ---
    emergencyNumber: { type: String, required: true },

    // --- Nominee Info ---
    nominee1: { type: String, required: true },
    nominee1Relation: { type: String, required: true },
    nominee1Phone: { type: String, required: true },
    nominee1Percentage: { type: String, required: true },

    nominee2: { type: String, required: true },
    nominee2Relation: { type: String, required: true },
    nominee2Phone: { type: String, required: true },
    nominee2Percentage: { type: String, required: true },

    // --- Identity Info ---
    aadharNumber: { type: String, required: true },
    aadharUpload: { type: fileSub, required: true },

    panNumber: { type: String, required: true },
    panUpload: { type: fileSub, required: true },

    // --- Marriage Info ---
    isMarried: { type: Boolean, default: false },
    spouse: { type: String },
    children: { type: Array, default: [] },
marriageCertificate: {
  type: fileSub,
  required: false, // ⚡ always optional
},

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PersonalDetails", personalDetailsSchema);
