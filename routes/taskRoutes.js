// const express = require("express");
// const router = express.Router();
// const {
//   createTask,
//   getTasks,
//   addComment,
//   updateTask,
//   deleteTask,
// } = require("../controllers/taskController");

// // Create new task (manual id allowed)
// router.post("/save", createTask);

// // Get all tasks
// router.get("/", getTasks);

// // Add comment to task
// router.post("/:id/comments", addComment);

// // Update a task
// router.put("/:id", updateTask);

// // Delete a task
// router.delete("/:id", deleteTask);

// module.exports = router;
// routes/taskRoutes.js
// const express = require("express");
// const router = express.Router();
// const taskCtrl = require("../controllers/taskController");

// // Tasks
// router.post("/", taskCtrl.createTask); // create new task
// router.get("/", taskCtrl.getTasksByFY); // ?fy=FY (25 - 26)&employeeId=123

// router.put("/:id", taskCtrl.updateTask); // edit text/due date
// router.delete("/:id", taskCtrl.deleteTask); // delete (soft-archive)

// // Ratings & comments
// router.put("/:id/rating", taskCtrl.setRating); // body: { rating, userRole }
// router.post("/:id/comments", taskCtrl.addComment); // add comment
// router.put("/:id/comments", taskCtrl.editComment); // edit comment (provide commentCid, newText, userRole)
// router.delete("/:id/comments", taskCtrl.deleteComment); // delete comment (provide commentCid, userRole)

// // Final reviews
// router.post("/final-review", taskCtrl.upsertFinalReview); // create/update final review
// router.get("/final-review", taskCtrl.getFinalReview); // ?fy=&employeeId=

// module.exports = router;
// const express = require("express");
// const router = express.Router();
// const taskCtrl = require("../controllers/taskController");

// // ----------------------
// // ✅ TASKS CRUD
// // ----------------------
// router.post("/", taskCtrl.createTask); // Create new task
// router.get("/", taskCtrl.getTasksByFY); // Get all tasks or filtered by ?fy=&employeeId=
// router.get("/:employeeId", taskCtrl.getTasksByFY); // ✅ Get tasks for specific employee + ?fy=
// router.put("/:id", taskCtrl.updateTask); // Update text/due date
// router.delete("/:id", taskCtrl.deleteTask); // Soft delete (archive)

// // ----------------------
// // ✅ RATINGS & COMMENTS
// // ----------------------
// router.put("/:id/rating", taskCtrl.setRating); // Set task rating
// router.post("/:id/comments", taskCtrl.addComment); // Add comment
// router.put("/:id/comments", taskCtrl.editComment); // Edit comment
// router.delete("/:id/comments", taskCtrl.deleteComment); // Delete comment

// // ----------------------
// // ✅ FINAL REVIEW
// // ----------------------
// router.post("/final-review", taskCtrl.upsertFinalReview); // Create/update final review
// router.get("/final-review", taskCtrl.getFinalReview); // Get final review by ?fy=&employeeId=

// module.exports = router;

const express = require("express");
const router = express.Router();
const taskCtrl = require("../controllers/taskController");

// ------------------------------------------------
// DEBUG — to see which route is matched
// ------------------------------------------------
router.use((req, res, next) => {
  console.log("🔥 Route hit:", req.method, req.originalUrl);
  next();
});

// ------------------------------------------------
// FINAL REVIEW ROUTES (MUST BE FIRST)
// ------------------------------------------------
router.post("/final-review", taskCtrl.upsertFinalReview);
router.get("/final-review", taskCtrl.getFinalReview);

// ------------------------------------------------
// TASK CRUD
// ------------------------------------------------
router.post("/", taskCtrl.createTask);
router.get("/", taskCtrl.getTasksByFY);

// ------------------------------------------------
// DYNAMIC ROUTE (KEEP AT BOTTOM)
// ------------------------------------------------
router.get("/:employeeId", taskCtrl.getTasksByFY);

router.put("/:id", taskCtrl.updateTask);
router.delete("/:id", taskCtrl.deleteTask);

// ------------------------------------------------
// COMMENTS & RATINGS
// ------------------------------------------------
router.put("/:id/rating", taskCtrl.setRating);
router.post("/:id/comments", taskCtrl.addComment);
router.put("/:id/comments", taskCtrl.editComment);
router.delete("/:id/comments", taskCtrl.deleteComment);

module.exports = router;
