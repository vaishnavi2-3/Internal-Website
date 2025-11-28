const mongoose = require("mongoose");
const { Schema } = mongoose;
// const examSchema = new Schema({
//   title: { type: String, required: true },
//   percentage: { type: Number, required: true },
// }, { _id: true });


const trainingTaskSchema = new Schema(
  {
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
    exams: { type: String },           // e.g. "React Fundamentals Test"
    marks: { type: String }            // e.g. "82%"

  },
  { timestamps: true }
);
mongoose.deleteModel(/TrainingTask/i);

module.exports =
  mongoose.models.TrainingTask ||
  mongoose.model("TrainingTask", trainingTaskSchema);
