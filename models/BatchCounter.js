const mongoose = require("mongoose");

const BatchCounterSchema = new mongoose.Schema({
  deptCode: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 }
});

module.exports = mongoose.model("BatchCounter", BatchCounterSchema);
