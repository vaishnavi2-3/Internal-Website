const Job = require("../models/Job");

// 🔁 Helper: auto-close jobs whose deadline has passed
const autoCloseExpiredJobs = async () => {
  const now = new Date();

  await Job.updateMany(
    {
      status: "Active",
      deadline: { $lt: now }, // deadline < now
    },
    {
      $set: { status: "Closed" },
    }
  );
};

// ➤ Create new job post (HR)
exports.createJob = async (req, res) => {
  try {
    const {
      jobTitle,
      department,
      JobType,
      jobCategory,
      location,
      roleOverview,
      responsibilities,
      preferredSkills,
      experience,
      qualification,
      salary,
      Contact,
      deadline,
    } = req.body;

    // Basic validation – can be extended
    if (
      !jobTitle ||
      !department ||
      !JobType ||
      !location?.length ||
      !roleOverview ||
      !responsibilities?.length ||
      !preferredSkills ||
      !experience ||
      !qualification ||
      !salary ||
      !Contact ||
      !deadline
    ) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    const newJob = await Job.create({
      jobTitle,
      department,
      JobType,
      jobCategory,
      location,
      roleOverview,
      responsibilities,
      preferredSkills,
      experience,
      qualification,
      salary,
      Contact,
      deadline,
    });

    res.status(201).json({
      message: "Job posted successfully",
      job: newJob,
    });
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// ➤ Get all jobs (Public + HR) – auto close expired first
exports.getAllJobs = async (req, res) => {
  try {
    await autoCloseExpiredJobs();

    // Sort: Active first, then Closed. Inside that, newest first
    const jobs = await Job.find().sort({ status: 1, createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ➤ Get single job – also respects deadline auto-close
exports.getJobById = async (req, res) => {
  try {
    await autoCloseExpiredJobs();

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.status(200).json(job);
  } catch (error) {
    console.error("Error fetching job:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ➤ Update job status (HR marks as Closed / Active)
exports.updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Active", "Closed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedJob) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.status(200).json({
      message: "Job status updated successfully",
      job: updatedJob,
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ➤ Delete job permanently
exports.deleteJob = async (req, res) => {
  try {
    const deletedJob = await Job.findByIdAndDelete(req.params.id);

    if (!deletedJob) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
