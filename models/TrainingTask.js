const mongoose = require("mongoose");
const { Schema } = mongoose;

const trainingTaskSchema = new Schema(
  {
    EmployeeId: { type: String, required: true },
    EmployeeName: { type: String, required: true },
    Department: { type: String, required: true },
    ManagerName: { type: String, default: "" },

    TrainingTitle: { type: String, required: true },

    Level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true
    },

    FromDate: { type: Date, required: true },
    ToDate: { type: Date, required: true },

    Mode: {
      type: String,
      enum: ["Online", "Offline", "Hybrid"],
      required: true
    },

    Duration: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.TrainingTask ||
  mongoose.model("TrainingTask", trainingTaskSchema);
