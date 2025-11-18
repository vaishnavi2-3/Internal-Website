// models/FinalReview.js
const mongoose = require("mongoose");

const FinalReviewSchema = new mongoose.Schema(
  {
    fy: { type: String, required: true }, // e.g. "FY (25 - 26)"
    employeeId: { type: String, required: true },
    avgRating: { type: Number, default: 0 },
    bandScore: { type: String, default: "-" }, // e.g. "A1"
    managerComments: { type: String, default: "" },
    empComment: { type: String, default: "" }, // employee response comment
    agree: { type: Boolean, default: false },
    disagree: { type: Boolean, default: false },
    finalizedOn: { type: Date }, // when finalized by employee (or manager)
    managerFinalizedOn: { type: Date }, // when manager finalized (optional)
    // // keep a history if you want:
    // history: [
    //   {
    //     by: { type: String }, // "Manager" or "Employee"
    //     action: { type: String },
    //     payload: { type: mongoose.Schema.Types.Mixed },
    //     at: { type: Date, default: Date.now },
    //   },
    // ],
  },
  { timestamps: true }
);

FinalReviewSchema.index({ fy: 1, employeeId: 1 }, { unique: true });

module.exports = mongoose.model("FinalReview", FinalReviewSchema);
