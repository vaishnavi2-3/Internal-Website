// const Task = require("../models/Task");

// // ✅ Create new task (manual task id allowed)
// const createTask = async (req, res) => {
//   try {
//     const {
//       id,
//       employeeId,
//       fy,
//       text,
//       assigned,
//       assignedDate,
//       dueDate,
//       rating,
//       score,
//     } = req.body;

//     if (!id || !employeeId || !fy || !text) {
//       return res
//         .status(400)
//         .json({ message: "id, employeeId, fy, and text are required" });
//     }

//     // Check if task ID already exists
//     const existing = await Task.findOne({ id });
//     if (existing) {
//       return res.status(400).json({ message: "Task with this ID already exists" });
//     }

//     const task = new Task({
//       id,
//       employeeId,
//       fy,
//       text,
//       assigned,
//       assignedDate: assignedDate ? new Date(assignedDate) : undefined,
//       dueDate: dueDate ? new Date(dueDate) : undefined,
//       rating: rating || 0,
//       score: score || 0,
//     });

//     await task.save();

//     // Fetch updated task list for same employee & FY
//     const tasks = await Task.find({ employeeId, fy }).sort({ createdAt: 1 }).lean();

//     res.status(201).json({ message: "Task created", task, tasks });
//   } catch (err) {
//     console.error("Error creating task:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ✅ Get all tasks (optional filters)
// const getTasks = async (req, res) => {
//   try {
//     const { employeeId, fy } = req.query;

//     let filter = {};
//     if (employeeId) filter.employeeId = employeeId;
//     if (fy) filter.fy = fy;

//     const tasks = await Task.find(filter).sort({ createdAt: 1 }).lean();
//     res.json(tasks);
//   } catch (err) {
//     console.error("Error fetching tasks:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ✅ Add comment to a specific task
// const addComment = async (req, res) => {
//   try {
//     const { id } = req.params; // task id
//     const { authorId, authorName, role, message } = req.body;

//     if (!message) {
//       return res.status(400).json({ message: "Comment message is required" });
//     }

//     const task = await Task.findOne({ id });
//     if (!task) {
//       return res.status(404).json({ message: "Task not found" });
//     }

//     const comment = {
//       authorId,
//       authorName,
//       role,
//       message,
//       createdAt: new Date(),
//     };

//     task.comments.push(comment);
//     await task.save();

//     res.json({ message: "Comment added", comments: task.comments });
//   } catch (err) {
//     console.error("Error adding comment:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ✅ Update task (status, rating, score, etc.)
// const updateTask = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updates = req.body;

//     const task = await Task.findOneAndUpdate({ id }, updates, {
//       new: true,
//       runValidators: true,
//     });

//     if (!task) {
//       return res.status(404).json({ message: "Task not found" });
//     }

//     res.json({ message: "Task updated", task });
//   } catch (err) {
//     console.error("Error updating task:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ✅ Delete task by ID
// const deleteTask = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const deleted = await Task.findOneAndDelete({ id });
//     if (!deleted) {
//       return res.status(404).json({ message: "Task not found" });
//     }

//     res.json({ message: "Task deleted", id });
//   } catch (err) {
//     console.error("Error deleting task:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// module.exports = {
//   createTask,
//   getTasks,
//   addComment,
//   updateTask,
//   deleteTask,
// };
//taskController.js

// controllers/taskController.js
// const Task = require("../models/Task");
// const FinalReview = require("../models/FinalReview");

// /**
//  * Create a new task (usually manager or TL)
//  * body: { text, assignedBy, assignedById, assignedTo, dueDate, fy }
//  */
// exports.createTask = async (req, res) => {
//   try {
//     const { text, assignedBy, assignedById, assignedTo, dueDate, fy } = req.body;
//     if (!text || !assignedTo || !fy) {
//       return res.status(400).json({ message: "text, assignedTo and fy are required" });
//     }

//     const task = new Task({
//       text,
//       assignedBy,
//       assignedById,
//       assignedTo,
//       dueDate: dueDate ? new Date(dueDate) : undefined,
//       fy,
//     });

//     await task.save();
//     return res.status(201).json({ message: "Task created", task });
//   } catch (err) {
//     console.error("createTask:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // /**
// //  * Get tasks by FY and optionally employeeId
// //  * query params: fy (required), employeeId (optional)
// //  * This endpoint is used by both employee (to fetch their tasks) and managers (to fetch all for FY)
// //  */
// // exports.getTasksByFY = async (req, res) => {
// //   try {
// //     const { fy } = req.query;
// //     const { employeeId } = req.query;

// //     if (!fy) return res.status(400).json({ message: "fy query param required" });

// //     const filter = { fy, archived: { $ne: true } };
// //     if (employeeId) filter.assignedTo = employeeId;

// //     const tasks = await Task.find(filter).sort({ createdAt: -1 }).lean();
// //     return res.json({ tasks });
// //   } catch (err) {
// //     console.error("getTasksByFY:", err);
// //     return res.status(500).json({ message: "Server error", error: err.message });
// //   }
// // };
// /**
//  * Get tasks by FY and optionally employeeId
//  * Supports both:
//  *  - /api/tasks?fy=FY (25 - 26)&employeeId=EMP101
//  *  - /api/tasks/EMP101?fy=FY (25 - 26)
//  */
// exports.getTasksByFY = async (req, res) => {
//   try {
//     const fy = req.query.fy;
//     const employeeId = req.params.employeeId || req.query.employeeId;

//     if (!fy) {
//       return res.status(400).json({ message: "fy query param required" });
//     }

//     const filter = { fy, archived: { $ne: true } };
//     if (employeeId) filter.assignedTo = employeeId;

//     const tasks = await Task.find(filter).sort({ createdAt: -1 }).lean();
//     return res.json({ tasks });
//   } catch (err) {
//     console.error("getTasksByFY:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// /**
//  * Update a task text/dueDate (editing allowed only within 24 hours unless manager)
//  * params: id
//  * body: { text, dueDate, userRole, userId }
//  */
// exports.updateTask = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { text, dueDate, userRole } = req.body;

//     const task = await Task.findById(id);
//     if (!task) return res.status(404).json({ message: "Task not found" });

//     // only allow edit if within 24 hours of assignment or user is manager
//     const isManager = userRole === "Manager" || userRole === "TL";
//     const within24 = Date.now() - (task.assignedDateTime || task.createdAt.getTime()) <= 24 * 60 * 60 * 1000;

//     if (!isManager && !within24) {
//       return res.status(403).json({ message: "Editing disabled after 24 hours" });
//     }

//     if (typeof text === "string") task.text = text;
//     if (dueDate) task.dueDate = new Date(dueDate);

//     await task.save();
//     return res.json({ message: "Task updated", task });
//   } catch (err) {
//     console.error("updateTask:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// /**
//  * Delete a task (soft or hard) - deletion allowed within 24 hours unless manager
//  * params: id
//  * body: { userRole }
//  */
// exports.deleteTask = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { userRole } = req.body;

//     const task = await Task.findById(id);
//     if (!task) return res.status(404).json({ message: "Task not found" });

//     const isManager = userRole === "Manager" || userRole === "TL";
//     const within24 = Date.now() - (task.assignedDateTime || task.createdAt.getTime()) <= 24 * 60 * 60 * 1000;

//     if (!isManager && !within24) {
//       return res.status(403).json({ message: "Deletion disabled after 24 hours" });
//     }

//     // soft-delete
//     task.archived = true;
//     await task.save();

//     return res.json({ message: "Task deleted (archived)" });
//   } catch (err) {
//     console.error("deleteTask:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// /**
//  * Set rating for a task.
//  * params: id
//  * body: { rating, userRole }  // rating 1..5
//  * If manager updates rating, set managerEdited = true.
//  */
// exports.setRating = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { rating, userRole } = req.body;
//     if (typeof rating !== "number") return res.status(400).json({ message: "rating number required" });

//     const task = await Task.findById(id);
//     if (!task) return res.status(404).json({ message: "Task not found" });

//     const isManager = userRole === "Manager" || userRole === "TL";

//     // If managerEdited true and requester is not manager, prevent change
//     if (task.managerEdited && !isManager) {
//       return res.status(403).json({ message: "Rating locked — manager already set rating" });
//     }

//     task.rating = rating;
//     if (isManager) task.managerEdited = true;

//     await task.save();
//     return res.json({ message: "Rating updated", task });
//   } catch (err) {
//     console.error("setRating:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// /**
//  * Add a comment to a task.
//  * params: id
//  * body: { text, userRole }
//  */
// exports.addComment = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { text, userRole } = req.body;
//     if (!text || !text.trim()) return res.status(400).json({ message: "text required" });

//     const task = await Task.findById(id);
//     if (!task) return res.status(404).json({ message: "Task not found" });

//     const author = userRole === "Manager" ? "Manager" : "Employee";

//     const comment = {
//       text: text.trim(),
//       author,
//       timestamp: new Date(),
//       edited: false,
//       cid: Date.now().toString(36) + Math.random().toString(36).slice(2,7)
//     };

//     task.comments.push(comment);
//     await task.save();

//     return res.status(201).json({ message: "Comment added", comment, task });
//   } catch (err) {
//     console.error("addComment:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// /**
//  * Edit a comment (only author and within 24 hours allowed)
//  * params: id (task id), commentId in body
//  * body: { commentCid, newText, userRole }
//  */
// exports.editComment = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { commentCid, newText, userRole } = req.body;
//     if (!commentCid || !newText) return res.status(400).json({ message: "commentCid and newText required" });

//     const task = await Task.findById(id);
//     if (!task) return res.status(404).json({ message: "Task not found" });

//     const c = task.comments.id(task.comments.find((x) => x.cid === commentCid)?._id);
//     // above is tricky because subdocs use _id. Let's find index:
//     const idx = task.comments.findIndex((c) => c.cid === commentCid);
//     if (idx === -1) return res.status(404).json({ message: "Comment not found" });

//     const comment = task.comments[idx];
//     const roleLabel = userRole === "Manager" ? "Manager" : "Employee";
//     if (comment.author !== roleLabel) return res.status(403).json({ message: "Only author can edit" });

//     const diff = Date.now() - new Date(comment.timestamp).getTime();
//     if (diff > 24 * 60 * 60 * 1000) return res.status(403).json({ message: "Editing window expired (24 hours)" });

//     comment.text = newText;
//     comment.edited = true;
//     // keep original timestamp or optionally update an editedAt field

//     await task.save();
//     return res.json({ message: "Comment edited", comment, task });
//   } catch (err) {
//     console.error("editComment:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// /**
//  * Delete a comment (only author and within 24 hours)
//  */
// exports.deleteComment = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { commentCid, userRole } = req.body;
//     if (!commentCid) return res.status(400).json({ message: "commentCid required" });

//     const task = await Task.findById(id);
//     if (!task) return res.status(404).json({ message: "Task not found" });

//     const idx = task.comments.findIndex((c) => c.cid === commentCid);
//     if (idx === -1) return res.status(404).json({ message: "Comment not found" });

//     const comment = task.comments[idx];
//     const roleLabel = userRole === "Manager" ? "Manager" : "Employee";
//     if (comment.author !== roleLabel) return res.status(403).json({ message: "Only author can delete" });

//     const diff = Date.now() - new Date(comment.timestamp).getTime();
//     if (diff > 24 * 60 * 60 * 1000) return res.status(403).json({ message: "Deletion window expired (24 hours)" });

//     task.comments.splice(idx, 1);
//     await task.save();
//     return res.json({ message: "Comment deleted", task });
//   } catch (err) {
//     console.error("deleteComment:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// /**
//  * Create or update FinalReview for an employee for a FY.
//  * body: { fy, employeeId, avgRating, bandScore, managerComments, empComment, agree, disagree, byRole }
//  * If manager sets bandScore & managerComments, set managerFinalizedOn.
//  * If employee finalizes (agree/disagree), set finalizedOn.
//  */
// exports.upsertFinalReview = async (req, res) => {
//   try {
//     const {
//       fy,
//       employeeId,
//       avgRating,
//       bandScore,
//       managerComments,
//       empComment,
//       agree,
//       disagree,
//       byRole,
//     } = req.body;

//     if (!fy || !employeeId) return res.status(400).json({ message: "fy and employeeId required" });

//     const payload = {
//       fy,
//       employeeId,
//       avgRating,
//       bandScore,
//       managerComments,
//       empComment,
//       agree: !!agree,
//       disagree: !!disagree,
//     };

//     let review = await FinalReview.findOne({ fy, employeeId });
//     if (!review) {
//       review = new FinalReview(payload);
//     } else {
//       Object.assign(review, payload);
//     }

//     // record timestamps
//     if (byRole === "Manager") {
//       review.managerFinalizedOn = new Date();
//       review.history.push({ by: "Manager", action: "Manager updated final review", payload: { bandScore, managerComments }, at: new Date() });
//     }
//     if (byRole === "Employee") {
//       review.finalizedOn = new Date();
//       review.history.push({ by: "Employee", action: agree ? "Employee agreed" : "Employee disagreed", payload: { empComment }, at: new Date() });
//     }

//     await review.save();
//     return res.json({ message: "Final review upserted", review });
//   } catch (err) {
//     console.error("upsertFinalReview:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// /**
//  * Get FinalReview by FY and employeeId
//  * query: fy, employeeId
//  */
// exports.getFinalReview = async (req, res) => {
//   try {
//     const { fy, employeeId } = req.query;
//     if (!fy || !employeeId) return res.status(400).json({ message: "fy and employeeId required" });

//     const review = await FinalReview.findOne({ fy, employeeId }).lean();
//     return res.json({ review });
//   } catch (err) {
//     console.error("getFinalReview:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };
const Task = require("../models/Task");
const FinalReview = require("../models/FinalReview");

/* ---------------------------------------------------
   CREATE TASK
--------------------------------------------------- */
exports.createTask = async (req, res) => {
  try {
    const { text, assignedBy, assignedById, assignedTo, dueDate, fy } = req.body;

    if (!text || !assignedTo || !fy) {
      return res.status(400).json({ message: "text, assignedTo and fy are required" });
    }

    const task = new Task({
      text,
      assignedBy,
      assignedById,
      assignedTo,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      fy,
    });

    await task.save();

    return res.status(201).json({ message: "Task created", task });
  } catch (err) {
    console.error("createTask:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ---------------------------------------------------
   GET TASKS BY FY + OPTIONAL EMPLOYEE
--------------------------------------------------- */
exports.getTasksByFY = async (req, res) => {
  try {
    console.log("📌 getTasksByFY hit");

    const fy = req.query.fy;
    const employeeId = req.params.employeeId || req.query.employeeId;

    if (!fy) {
      return res.status(400).json({ message: "fy query param required" });
    }

    const filter = { fy, archived: { $ne: true } };
    if (employeeId) filter.assignedTo = employeeId;

    const tasks = await Task.find(filter).sort({ createdAt: -1 }).lean();

    return res.json({ tasks });
  } catch (err) {
    console.error("getTasksByFY:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ---------------------------------------------------
   UPDATE TASK
--------------------------------------------------- */
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, dueDate, userRole } = req.body;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const isManager = userRole === "Manager" || userRole === "TL";
    const within24 =
      Date.now() - (task.assignedDateTime || task.createdAt.getTime()) <= 24 * 60 * 60 * 1000;

    if (!isManager && !within24) {
      return res.status(403).json({ message: "Editing disabled after 24 hours" });
    }

    if (text) task.text = text;
    if (dueDate) task.dueDate = new Date(dueDate);

    await task.save();

    return res.json({ message: "Task updated", task });
  } catch (err) {
    console.error("updateTask:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ---------------------------------------------------
   DELETE TASK (SOFT)
--------------------------------------------------- */
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { userRole } = req.body;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const isManager = userRole === "Manager" || userRole === "TL";
    const within24 =
      Date.now() - (task.assignedDateTime || task.createdAt.getTime()) <= 24 * 60 * 60 * 1000;

    if (!isManager && !within24) {
      return res.status(403).json({ message: "Deletion disabled after 24 hours" });
    }

    task.archived = true;
    await task.save();

    return res.json({ message: "Task deleted (archived)" });
  } catch (err) {
    console.error("deleteTask:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ---------------------------------------------------
   SET RATING
--------------------------------------------------- */
exports.setRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, userRole } = req.body;

    if (typeof rating !== "number") {
      return res.status(400).json({ message: "rating number required" });
    }

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const isManager = userRole === "Manager" || userRole === "TL";

    if (task.managerEdited && !isManager) {
      return res.status(403).json({ message: "Rating locked — manager already set rating" });
    }

    task.rating = rating;
    if (isManager) task.managerEdited = true;

    await task.save();

    return res.json({ message: "Rating updated", task });
  } catch (err) {
    console.error("setRating:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ---------------------------------------------------
   ADD COMMENT
--------------------------------------------------- */
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, userRole } = req.body;

    if (!text) return res.status(400).json({ message: "text required" });

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const comment = {
      text: text.trim(),
      author: userRole === "Manager" ? "Manager" : "Employee",
      timestamp: new Date(),
      edited: false,
      cid: Date.now().toString(36)
    };

    task.comments.push(comment);
    await task.save();

    return res.json({ message: "Comment added", comment, task });
  } catch (err) {
    console.error("addComment:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ---------------------------------------------------
   EDIT COMMENT
--------------------------------------------------- */
exports.editComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { commentCid, newText, userRole } = req.body;

    if (!commentCid || !newText) {
      return res.status(400).json({ message: "commentCid and newText required" });
    }

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const index = task.comments.findIndex(c => c.cid === commentCid);
    if (index === -1) return res.status(404).json({ message: "Comment not found" });

    const comment = task.comments[index];

    if (comment.author !== (userRole === "Manager" ? "Manager" : "Employee")) {
      return res.status(403).json({ message: "Only author can edit" });
    }

    comment.text = newText;
    comment.edited = true;

    await task.save();

    return res.json({ message: "Comment edited", comment, task });
  } catch (err) {
    console.error("editComment:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ---------------------------------------------------
   DELETE COMMENT
--------------------------------------------------- */
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { commentCid, userRole } = req.body;

    if (!commentCid) return res.status(400).json({ message: "commentCid required" });

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const idx = task.comments.findIndex(c => c.cid === commentCid);
    if (idx === -1) return res.status(404).json({ message: "Comment not found" });

    const comment = task.comments[idx];

    if (comment.author !== (userRole === "Manager" ? "Manager" : "Employee")) {
      return res.status(403).json({ message: "Only author can delete" });
    }

    task.comments.splice(idx, 1);
    await task.save();

    return res.json({ message: "Comment deleted", task });
  } catch (err) {
    console.error("deleteComment:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ---------------------------------------------------
   FINAL REVIEW — UPSERT (CREATE OR UPDATE)
--------------------------------------------------- */
exports.upsertFinalReview = async (req, res) => {
  try {
    console.log("📌 upsertFinalReview hit");
    console.log("Body:", req.body);

    const {
      fy,
      employeeId,
      avgRating,
      bandScore,
      managerComments,
      empComment,
      agree,
      disagree,
      byRole
    } = req.body;

    if (!fy || !employeeId) {
      return res.status(400).json({ message: "fy and employeeId required" });
    }

    let review = await FinalReview.findOne({ fy, employeeId });

    const payload = {
      avgRating,
      bandScore,
      managerComments,
      agree: !!agree,
      disagree: !!disagree,
      ...(byRole === "Employee" ? { empComment } : {}),
    };

    if (!review) {
      review = new FinalReview({ fy, employeeId, ...payload });
    } else {
      Object.assign(review, payload);
    }

    if (byRole === "Manager") {
      review.managerFinalizedOn = new Date();
      review.history.push({
        by: "Manager",
        action: "Manager updated final review",
        payload: { bandScore, managerComments },
        at: new Date(),
      });
    }

    if (byRole === "Employee") {
      review.finalizedOn = new Date();
      review.history.push({
        by: "Employee",
        action: agree ? "Employee agreed" : "Employee disagreed",
        payload: { empComment },
        at: new Date(),
      });
    }

    await review.save();

    return res.json({ message: "Final review updated", review });

  } catch (err) {
    console.error("upsertFinalReview:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ---------------------------------------------------
   FINAL REVIEW — GET
--------------------------------------------------- */
exports.getFinalReview = async (req, res) => {
  try {
    console.log("📌 getFinalReview hit");
    console.log("Query:", req.query);

    const { fy, employeeId } = req.query;

    if (!fy || !employeeId) {
      return res.status(400).json({ message: "fy and employeeId required" });
    }

    const review = await FinalReview.findOne({ fy, employeeId }).lean();

    return res.json({ review });

  } catch (err) {
    console.error("getFinalReview:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
