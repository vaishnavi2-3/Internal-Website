const mongoose = require("mongoose");
const { Schema } = mongoose;
const { randomUUID } = require("crypto");

// let uuidv4;

// (async () => {
//   uuidv4 = (await import("uuid")).v4;
// })();

const examSchema = new Schema({
  exam: { type: String, required: true },
  marks: { type: String, required: true }
}, { _id: true });



const trainingTaskSchema = new Schema(
  {
    _id: {
      type: String,
    default: () => randomUUID()    },

    employeeId: { type: String, required: true },
    employeeName: { type: String, required: true },
    department: { type: String, required: true },
    managerName: { type: String, default: "" },

    trainingTitle: { type: String },
dateOfJoining: {
  type: Date,
  required: true
},

    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true
    },
    status: {
  type: String,
  enum: ["assigned", "in-progress", "completed"],
  default: "assigned"
},
type: {
  type: String,
  enum: ["Fresher", "Previous Employee"],
  required: true
},
    extraDetails: {
      type: mongoose.Schema.Types.Mixed, // ⭐ ALLOWS ANY JSON STRUCTURE
      default: {}
    },
    assignedType: { type: String }, // Single | Bulk
    officialEmail: { type: String, required: true },




    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    batchId: {
  type: String
},


    mode: {
      type: String,
      enum: ["Online", "Offline", "Hybrid"],
      required: true
    },

    duration: { type: String, required: true },

exams: {
  type: [examSchema],
  default: []
}
  },
  
  { timestamps: true }
);

// Prevent OverwriteModelError
mongoose.deleteModel(/TrainingTask/i);

module.exports =
  mongoose.models.TrainingTask ||
  mongoose.model("TrainingTask", trainingTaskSchema);
