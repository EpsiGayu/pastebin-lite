
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const healthRoutes = require("./routes/health");
const pasteRoutes = require("./routes/pastes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/healthz", healthRoutes);
app.use("/api/pastes", pasteRoutes);
app.use("/p", pasteRoutes); // HTML view

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
