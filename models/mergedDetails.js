const mongoose = require("mongoose");

// Flexible schema for merged data
const mergedSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model("MergedEmployeeDetails", mergedSchema, "mergedEmployeeDetails");
