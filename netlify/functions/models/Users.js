const mongoose = require("mongoose");

const UsersSchema = new mongoose.Schema({
  atendenteId: { type: Number, required: true },
  company: { type: String, default: "" },
  ratings: { type: String, default: "" },
  created_at: { type: Date, default: Date.now },
  link: {
    type: String,
    default: function () {
      return `https://feedbackmotasa.netlify.app/?atendente=${this.atendenteId}`;
    }
  }
});

module.exports = mongoose.model("Users", UsersSchema);
