const mongoose = require("mongoose");

const trainingSkillSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    skills: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

// Prevent OverwriteModelError
mongoose.deleteModel(/TrainingSkill/i);

module.exports =
  mongoose.models.TrainingSkill ||
  mongoose.model("TrainingSkill", trainingSkillSchema);
