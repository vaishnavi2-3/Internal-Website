const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String },
  notes: { type: String },
      month: { type: String },
    year: { type: Number },

    // NEW FIELD → Helps HR Dashboard show only upcoming holidays
    status: { type: String, enum: ["upcoming", "completed"], default: "upcoming" }
  },
  { timestamps: true }

);
holidaySchema.pre("save", function (next) {
  this.month = new Date(this.date).toLocaleString("default", { month: "long" });
  this.year = new Date(this.date).getFullYear();

  const today = new Date();
  this.status = new Date(this.date) < today ? "completed" : "upcoming";
  next();
});


module.exports = mongoose.model("PublicHoliday", holidaySchema);
