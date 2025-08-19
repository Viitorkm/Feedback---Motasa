const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  rating: { type: Number, required: true },
  comment: { type: String, default: "" },
  ip_address: { type: String, default: "" },
  created_at: { type: Date, default: Date.now },
  empresa: { type: String, maxlength: 50, default: null },
  vendedor: { type: String, maxlength: 50, default: null }
});


module.exports = mongoose.model("Feedback", feedbackSchema);
