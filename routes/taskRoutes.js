// const express = require("express");
// const router = express.Router();
// const taskCtrl = require("../controllers/taskController");

// // ------------------------------------------------
// // DEBUG — to see which route is matched
// // ------------------------------------------------
// router.use((req, res, next) => {
//   console.log("Route hit:", req.method, req.originalUrl);
//   next();
// });

// // ------------------------------------------------
// // FINAL REVIEW ROUTES (MUST BE FIRST)
// // ------------------------------------------------
// router.post("/final-review", taskCtrl.upsertFinalReview);
// router.get("/final-review", taskCtrl.getFinalReview);

// // ------------------------------------------------
// // TASK CRUD
// // ------------------------------------------------
// router.post("/", taskCtrl.createTask);
// router.get("/", taskCtrl.getTasksByFY);

// // ------------------------------------------------
// // DYNAMIC ROUTE (KEEP AT BOTTOM)
// // ------------------------------------------------
// router.get("/:employeeId", taskCtrl.getTasksByFY);

// router.put("/:id", taskCtrl.updateTask);
// router.delete("/:id", taskCtrl.deleteTask);

// // ------------------------------------------------
// // COMMENTS & RATINGS
// // ------------------------------------------------
// router.put("/:id/rating", taskCtrl.setRating);
// router.post("/:id/comments", taskCtrl.addComment);
// router.put("/:id/comments", taskCtrl.editComment);
// router.delete("/:id/comments", taskCtrl.deleteComment);

// module.exports = router;
const express = require("express");
const router = express.Router();
const taskCtrl = require("../controllers/taskController");

// ------------------------------------------------
// DEBUG — Log every route
// ------------------------------------------------
router.use((req, res, next) => {
  console.log("Route hit:", req.method, req.originalUrl);
  next();
});

// ------------------------------------------------
// FINAL REVIEW ROUTES  (MUST BE BEFORE :id ROUTES)
// ------------------------------------------------
router.post("/final-review", taskCtrl.upsertFinalReview);
router.get("/final-review", taskCtrl.getFinalReview);
router.put("/final-review", taskCtrl.updateFinalReview);     // NEW
router.delete("/final-review", taskCtrl.deleteFinalReview); // NEW

// ------------------------------------------------
// TASK CRUD
// ------------------------------------------------
router.post("/", taskCtrl.createTask);
router.get("/", taskCtrl.getTasksByFY);

// ------------------------------------------------
// COMMENTS & RATINGS (fixed route order)
// ------------------------------------------------
router.put("/:id/rating", taskCtrl.setRating);
router.post("/:id/comments", taskCtrl.addComment);
router.put("/:id/comments", taskCtrl.editComment);
router.delete("/:id/comments", taskCtrl.deleteComment);

// ------------------------------------------------
// DYNAMIC ROUTE (ALWAYS LAST)
// ------------------------------------------------
router.get("/:employeeId", taskCtrl.getTasksByFY);
router.put("/:id", taskCtrl.updateTask);
router.delete("/:id", taskCtrl.deleteTask);

module.exports = router;
