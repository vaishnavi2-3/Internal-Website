const mongoose = require("mongoose");
const { Schema } = mongoose;
const { v4: uuidv4 } = require("uuid");

const examSchema = new Schema({
  exam: { type: String, required: true },
  marks: { type: String, required: true }
}, { _id: true });



const trainingTaskSchema = new Schema(
  {
    _id: {
      type: String,
      default: uuidv4,   // 🔥 FIX: Ensure UUID string is used as _id
    },

    employeeId: { type: String, required: true },
    employeeName: { type: String, required: true },
    department: { type: String, required: true },
    managerName: { type: String, default: "" },

    trainingTitle: { type: String },

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

    duration: { type: String, required: true },

    exams: { type: String },
    marks: { type: String }
  },
  { timestamps: true }
);

// Prevent OverwriteModelError
mongoose.deleteModel(/TrainingTask/i);

module.exports =
  mongoose.models.TrainingTask ||
  mongoose.model("TrainingTask", trainingTaskSchema);
