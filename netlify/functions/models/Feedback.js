const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  rating: { type: Number, required: true },
  comment: { type: String, default: "" },
  ip_address: { type: String, default: "" },
  created_at: { type: Date, default: Date.now },
  empresa: { type: String, default: null },
  vendedor: { type: String, default: null }
});


module.exports = mongoose.model("Feedback", feedbackSchema);
