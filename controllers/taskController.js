// const Task = require("../models/Task");
// const FinalReview = require("../models/FinalReview");

// /* ---------------------------------------------------
//    CREATE TASK
// --------------------------------------------------- */
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

// /* ---------------------------------------------------
//    GET TASKS BY FY + OPTIONAL EMPLOYEE
// --------------------------------------------------- */
// exports.getTasksByFY = async (req, res) => {
//   try {
//     console.log("📌 getTasksByFY hit");

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

// /* ---------------------------------------------------
//    UPDATE TASK
// --------------------------------------------------- */
// exports.updateTask = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { text, dueDate, userRole } = req.body;

//     const task = await Task.findById(id);
//     if (!task) return res.status(404).json({ message: "Task not found" });

//     const isManager = userRole === "Manager" || userRole === "TL";
//     const within24 =
//       Date.now() - (task.assignedDateTime || task.createdAt.getTime()) <= 24 * 60 * 60 * 1000;

//     if (!isManager && !within24) {
//       return res.status(403).json({ message: "Editing disabled after 24 hours" });
//     }

//     if (text) task.text = text;
//     if (dueDate) task.dueDate = new Date(dueDate);

//     await task.save();

//     return res.json({ message: "Task updated", task });
//   } catch (err) {
//     console.error("updateTask:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// /* ---------------------------------------------------
//    DELETE TASK (SOFT)
// --------------------------------------------------- */
// exports.deleteTask = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { userRole } = req.body;

//     const task = await Task.findById(id);
//     if (!task) return res.status(404).json({ message: "Task not found" });

//     const isManager = userRole === "Manager" || userRole === "TL";
//     const within24 =
//       Date.now() - (task.assignedDateTime || task.createdAt.getTime()) <= 24 * 60 * 60 * 1000;

//     if (!isManager && !within24) {
//       return res.status(403).json({ message: "Deletion disabled after 24 hours" });
//     }

//     task.archived = true;
//     await task.save();

//     return res.json({ message: "Task deleted (archived)" });
//   } catch (err) {
//     console.error("deleteTask:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// /* ---------------------------------------------------
//    SET RATING
// --------------------------------------------------- */
// exports.setRating = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { rating, userRole } = req.body;

//     if (typeof rating !== "number") {
//       return res.status(400).json({ message: "rating number required" });
//     }

//     const task = await Task.findById(id);
//     if (!task) return res.status(404).json({ message: "Task not found" });

//     const isManager = userRole === "Manager" || userRole === "TL";

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

// /* ---------------------------------------------------
//    ADD COMMENT
// --------------------------------------------------- */
// exports.addComment = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { text, userRole } = req.body;

//     if (!text) return res.status(400).json({ message: "text required" });

//     const task = await Task.findById(id);
//     if (!task) return res.status(404).json({ message: "Task not found" });

//     const comment = {
//       text: text.trim(),
//       author: userRole === "Manager" ? "Manager" : "Employee",
//       timestamp: new Date(),
//       edited: false,
//       cid: Date.now().toString(36)
//     };

//     task.comments.push(comment);
//     await task.save();

//     return res.json({ message: "Comment added", comment, task });
//   } catch (err) {
//     console.error("addComment:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// /* ---------------------------------------------------
//    EDIT COMMENT
// --------------------------------------------------- */
// exports.editComment = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { commentCid, newText, userRole } = req.body;

//     if (!commentCid || !newText) {
//       return res.status(400).json({ message: "commentCid and newText required" });
//     }

//     const task = await Task.findById(id);
//     if (!task) return res.status(404).json({ message: "Task not found" });

//     const index = task.comments.findIndex(c => c.cid === commentCid);
//     if (index === -1) return res.status(404).json({ message: "Comment not found" });

//     const comment = task.comments[index];

//     if (comment.author !== (userRole === "Manager" ? "Manager" : "Employee")) {
//       return res.status(403).json({ message: "Only author can edit" });
//     }

//     comment.text = newText;
//     comment.edited = true;

//     await task.save();

//     return res.json({ message: "Comment edited", comment, task });
//   } catch (err) {
//     console.error("editComment:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// /* ---------------------------------------------------
//    DELETE COMMENT
// --------------------------------------------------- */
// exports.deleteComment = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { commentCid, userRole } = req.body;

//     if (!commentCid) return res.status(400).json({ message: "commentCid required" });

//     const task = await Task.findById(id);
//     if (!task) return res.status(404).json({ message: "Task not found" });

//     const idx = task.comments.findIndex(c => c.cid === commentCid);
//     if (idx === -1) return res.status(404).json({ message: "Comment not found" });

//     const comment = task.comments[idx];

//     if (comment.author !== (userRole === "Manager" ? "Manager" : "Employee")) {
//       return res.status(403).json({ message: "Only author can delete" });
//     }

//     task.comments.splice(idx, 1);
//     await task.save();

//     return res.json({ message: "Comment deleted", task });
//   } catch (err) {
//     console.error("deleteComment:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// /* ---------------------------------------------------
//    FINAL REVIEW — UPSERT (CREATE OR UPDATE)
// --------------------------------------------------- */
// exports.upsertFinalReview = async (req, res) => {
//   try {
//     console.log("📌 upsertFinalReview hit");
//     console.log("Body:", req.body);

//     const {
//       fy,
//       employeeId,
//       avgRating,
//       bandScore,
//       managerComments,
//       empComment,
//       agree,
//       disagree,
//       byRole
//     } = req.body;

//     if (!fy || !employeeId) {
//       return res.status(400).json({ message: "fy and employeeId required" });
//     }

//     let review = await FinalReview.findOne({ fy, employeeId });

//     const payload = {
//       avgRating,
//       bandScore,
//       managerComments,
//       agree: !!agree,
//       disagree: !!disagree,
//       ...(byRole === "Employee" ? { empComment } : {}),
//     };

//     if (!review) {
//       review = new FinalReview({ fy, employeeId, ...payload });
//     } else {
//       Object.assign(review, payload);
//     }

//     if (byRole === "Manager") {
//       review.managerFinalizedOn = new Date();
//       review.history.push({
//         by: "Manager",
//         action: "Manager updated final review",
//         payload: { bandScore, managerComments },
//         at: new Date(),
//       });
//     }

//     if (byRole === "Employee") {
//       review.finalizedOn = new Date();
//       review.history.push({
//         by: "Employee",
//         action: agree ? "Employee agreed" : "Employee disagreed",
//         payload: { empComment },
//         at: new Date(),
//       });
//     }

//     await review.save();

//     return res.json({ message: "Final review updated", review });

//   } catch (err) {
//     console.error("upsertFinalReview:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// /* ---------------------------------------------------
//    FINAL REVIEW — GET
// --------------------------------------------------- */
// exports.getFinalReview = async (req, res) => {
//   try {
//     console.log("📌 getFinalReview hit");
//     console.log("Query:", req.query);

//     const { fy, employeeId } = req.query;

//     if (!fy || !employeeId) {
//       return res.status(400).json({ message: "fy and employeeId required" });
//     }

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
   DELETE TASK (SOFT DELETE)
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
   FINAL REVIEW — CREATE OR UPDATE (POST)
--------------------------------------------------- */
exports.upsertFinalReview = async (req, res) => {
  try {
    console.log("📌 upsertFinalReview hit");

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
   FINAL REVIEW — UPDATE (PUT)
--------------------------------------------------- */
exports.updateFinalReview = async (req, res) => {
  try {
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

    const review = await FinalReview.findOne({ fy, employeeId });
    if (!review) {
      return res.status(404).json({ message: "Final review not found" });
    }

    if (byRole === "Manager") {
      if (avgRating !== undefined) review.avgRating = avgRating;
      if (bandScore !== undefined) review.bandScore = bandScore;
      if (managerComments !== undefined) review.managerComments = managerComments;
      review.managerFinalizedOn = new Date();

      review.history.push({
        by: "Manager",
        action: "Manager updated final review (PUT)",
        payload: { avgRating, bandScore, managerComments },
        at: new Date()
      });
    }

    if (byRole === "Employee") {
      if (empComment !== undefined) review.empComment = empComment;
      if (agree !== undefined) review.agree = agree;
      if (disagree !== undefined) review.disagree = disagree;
      review.finalizedOn = new Date();

      review.history.push({
        by: "Employee",
        action: agree ? "Employee agreed (PUT)" : "Employee disagreed (PUT)",
        payload: { empComment },
        at: new Date()
      });
    }

    await review.save();

    return res.json({ message: "Final review updated successfully", review });

  } catch (err) {
    console.error("updateFinalReview:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ---------------------------------------------------
   FINAL REVIEW — DELETE
--------------------------------------------------- */
exports.deleteFinalReview = async (req, res) => {
  try {
    const { fy, employeeId } = req.body;

    if (!fy || !employeeId) {
      return res.status(400).json({ message: "fy and employeeId required" });
    }

    const review = await FinalReview.findOneAndDelete({ fy, employeeId });

    if (!review) {
      return res.status(404).json({ message: "Final review not found" });
    }

    return res.json({ message: "Final review deleted successfully" });

  } catch (err) {
    console.error("deleteFinalReview:", err);
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
