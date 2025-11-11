const mongoose = require("mongoose");
const Personal = require("../models/personalDetails");
const Education = require("../models/educationDetails");
const Professional = require("../models/professionalDetails");
const Merged = require("../models/mergedDetails");

// ✅ Replace this with your actual connection string (keep it secret in .env in production)
const DB_URI = "mongodb+srv://jagadeesh:123412341234@cluster0.el7ebzd.mongodb.net/projectinternal?retryWrites=true&w=majority";

(async () => {
  try {
    await mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB Atlas");

    // Fetch all data
    const [personalDocs, educationDocs, professionalDocs] = await Promise.all([
      Personal.find({}),
      Education.find({}),
      Professional.find({}),
    ]);

    console.log(`📘 Found: ${personalDocs.length} personal, 🎓 ${educationDocs.length} education, 💼 ${professionalDocs.length}`);

    // 🔗 Group all data by employeeId
    const mergedDataMap = new Map();

    // 🧩 Add Personal
    for (const doc of personalDocs) {
      const empId = doc.employeeId;
      if (!mergedDataMap.has(empId)) mergedDataMap.set(empId, {});
      mergedDataMap.get(empId).employeeId = empId;
      mergedDataMap.get(empId).personalDetails = doc.toObject();
    }

    // 🧩 Add Education
    for (const doc of educationDocs) {
      const empId = doc.employeeId;
      if (!mergedDataMap.has(empId)) mergedDataMap.set(empId, {});
      mergedDataMap.get(empId).employeeId = empId;
      mergedDataMap.get(empId).educationDetails = doc.toObject();
    }

    // 🧩 Add Professional
    for (const doc of professionalDocs) {
      const empId = doc.employeeId;
      if (!mergedDataMap.has(empId)) mergedDataMap.set(empId, {});
      mergedDataMap.get(empId).employeeId = empId;
      mergedDataMap.get(empId).professionalDetails = doc.toObject();
    }

    // Convert to array
    const mergedArray = Array.from(mergedDataMap.values());

    // Save to merged collection
    await Merged.deleteMany({});
    await Merged.insertMany(mergedArray);

    console.log(`✅ Merged ${mergedArray.length} employees into "mergedEmployeeDetails"`);

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  } catch (err) {
    console.error("❌ Merge error:", err);
    process.exit(1);
  }
})();
