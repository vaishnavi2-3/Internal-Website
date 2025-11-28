const express = require("express");
const router = express.Router();
const {
  createJob,
  getAllJobs,
  getJobById,
   updateJob,
  updateJobStatus,
  deleteJob,
} = require("../controllers/jobController");

// POST → HR posts a new job
router.post("/jobs", createJob);

// GET → Public Website fetch all jobs
router.get("/jobs", getAllJobs);

// GET → Fetch single job details
router.get("/jobs/:id", getJobById);
//FULL UPDATE (ADMIN EDIT)
router.put("/jobs/:id",updateJob);

// PUT → HR closes/deactivates / re-opens job
router.put("/jobs/status/:id", updateJobStatus);

// DELETE → HR deletes job permanently
router.delete("/jobs/:id", deleteJob);

module.exports = router;
