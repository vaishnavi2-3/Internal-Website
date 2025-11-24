const mongoose = require("mongoose");

const daySchema = new mongoose.Schema({
  date: { type: String, required: true },  // YYYY-MM-DD
  totalHours: { type: Number, required: true }
});

const timeSummarySchema = new mongoose.Schema(
  {
    officialEmail: { type: String, required: true },   // 🔥 UPDATED

    month: { type: Number, required: true },   // 1–12
    year: { type: Number, required: true },

    dailyTotals: { type: [daySchema], default: [] },

    weeklyTotals: { type: [Number], default: [0, 0, 0, 0, 0, 0] },

    monthlyTotal: { type: Number, default: 0 },

    workingDays: { type: Number, default: 0 },
  },
  { timestamps: true }
);

timeSummarySchema.index(
  { officialEmail: 1, month: 1, year: 1 },
  { unique: true }
);

module.exports = mongoose.model("TimeSummary", timeSummarySchema);
