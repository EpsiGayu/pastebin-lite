
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

router.get("/", async (req, res) => {
  const dbOk = mongoose.connection.readyState === 1;
  res.status(200).json({ ok: dbOk });
});

module.exports = router;
