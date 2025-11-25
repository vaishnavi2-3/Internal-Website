const mongoose = require("mongoose");

const timeEntrySchema = new mongoose.Schema(
  {
    officialEmail: {     // 🔥 UPDATED
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
date: {
  type: Date,
  required: true,
  set: (v) => new Date(new Date(v).setHours(0, 0, 0, 0))
},
    category: { type: String, required: true },
    projectName: { type: String, required: true },
    projectCode: { type: String, required: true },
    
    projectType: { type: String, required: true },
    hours: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TimeEntry", timeEntrySchema);
