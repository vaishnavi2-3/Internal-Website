const express = require("express");
const router = express.Router();

router.get("/env-check", (req, res) => {
  res.json({
    EMAIL_USER: process.env.EMAIL_USER || "NOT LOADED",
    EMAIL_PASS: process.env.EMAIL_PASS ? "LOADED" : "NOT LOADED",
    CLIENT_URL: process.env.CLIENT_URL || "NOT LOADED",
    JWT_SECRET: process.env.JWT_SECRET || "NOT LOADED"
  });
});

module.exports = router;
