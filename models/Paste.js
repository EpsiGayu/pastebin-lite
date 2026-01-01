const mongoose = require("mongoose");

const PasteSchema = new mongoose.Schema({
  _id: {
    type: String,   // 👈 allow nanoid
  },
  content: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    default: null,
  },
  maxViews: {
    type: Number,
    default: null,
  },
  views: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model("Paste", PasteSchema);
