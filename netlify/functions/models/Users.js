const mongoose = require("mongoose");

const UsersSchema = new mongoose.Schema({
  avaliadorId: { type: Number, required: true },
  company: { type: String, default: "" },
  ratings: { type: String, default: "" },
  data: { type: Date, default: Date.now },
  link: {
    type: String,
    default: function () {
      return `https://feedbackmotasa.netlify.app/?atendente=${this.avaliadorId}`;
    }
  }
});


module.exports = mongoose.model("Users", UsersSchema);
