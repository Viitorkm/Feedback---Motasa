const mongoose = require("mongoose");

const UsersSchema = new mongoose.Schema({
  atendenteId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  company: {
    type: String,
    required: true
  },
  ratings: {
    type: String,
    default: ""
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  link: {
    type: String,
    default: function() {
      return `https://feedbackmotasa.netlify.app/?atendente=${this.atendenteId}`;
    }
  }
});

// Drop any existing indexes to avoid conflicts
UsersSchema.pre('save', async function(next) {
  try {
    await this.collection.dropIndexes();
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Users", UsersSchema);
