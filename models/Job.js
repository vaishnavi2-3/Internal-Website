const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema(
  {
    jobTitle: { type: String, required: true },
    department: { type: String, required: true },
    JobType: { type: String, required: true }, // Full-time / Part-time / etc.
    jobCategory: { type: String, default: "" },
    location: [{ type: String, required: true }],
    roleOverview: { type: String, required: true },
    responsibilities: [{ type: String, required: true }],
    preferredSkills: { type: String, required: true },
    experience: { type: String, required: true },
    qualification: { type: String, required: true },
    salary: { type: String, required: true },
    contactOrEmail: { type: String, required: true },
    deadline: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Active", "Closed"],
      default: "Active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", JobSchema);
