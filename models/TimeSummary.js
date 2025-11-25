const mongoose = require("mongoose");

const timeSummarySchema = new mongoose.Schema(
  {
    officialEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    month: { type: Number, required: true },   // 1 - 12
    year: { type: Number, required: true },    // 2024,2025,...

    monthlyTotal: { type: Number, default: 0 }, // Total hours of month
    workingDays: { type: Number, default: 0 },  // Count of unique days

    weeklyTotals: [
      {
        week: Number,   // 1 - 6
        hours: Number,
      }
    ],

    dailyTotals: [
      {
        date: String,   // YYYY-MM-DD
        hours: Number,
      }
    ]
  },
  { timestamps: true }
);

// Unique index for faster updates
timeSummarySchema.index({ officialEmail: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("TimeSummary", timeSummarySchema);
