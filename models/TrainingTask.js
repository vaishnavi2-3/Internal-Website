const mongoose = require("mongoose");
const { Schema } = mongoose;

const trainingTaskSchema = new Schema(
  {
    employeeId: { type: String, required: true },
    employeeName: { type: String, required: true },
    department: { type: String, required: true },
managerName: { type: String, default: "" },

    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true
    },

    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },

    mode: {
      type: String,
      enum: ["Online", "Offline", "Hybrid"],
      required: true
    },

    duration: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.TrainingTask ||
  mongoose.model("TrainingTask", trainingTaskSchema);
