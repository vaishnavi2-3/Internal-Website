
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
    // --- Basic Info ---
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },

    // --- Parent Info ---
    fatherName: { type: String, required: true },
    motherName: { type: String, required: true },

    // --- Contact Info ---
    email: { type: String, required: true },
    phone: { type: String, required: true },
    alternativePhone: { type: String },

    // --- Gender & Blood Group ---
    gender: { type: String, required: true },
    bloodGroup: { type: String, required: true },

    // --- Photo Upload (store as URL or path) ---
    photo: { type: String, required: true },

    // --- Address Info ---
    currentAddress: { type: String, required: true },
    sameAddress: { type: Boolean, default: false },
    permanentAddress: { type: String, required: true },
    landmark: { type: String, required: true },
    pincode: { type: String, required: true },
    village: { type: String },
    state: { type: String, required: true },

    // --- Emergency Info ---
    emergencyNumber: { type: String, required: true },

    // --- Nominee Info ---
    nominee1: { type: String, required: true },
    nominee2: { type: String, required: true },

    // --- Identity Info ---
    aadharNumber: { type: String, required: true },
    aadharUpload: { type: fileSub, required: true }, // file URL or path

    panNumber: { type: String, required: true },
    panUpload: { type: fileSub, required: true }, // file URL or path

    // --- Marriage Info ---
    isMarried: { type: Boolean, default: false },
    marriageCertificate: { type: fileSub }, // optional file URL or path

    // --- Metadata ---
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PersonalDetails", personalDetailsSchema);
