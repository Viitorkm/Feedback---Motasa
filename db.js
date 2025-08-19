const mongoose = require("mongoose");

const connectToDatabase = async () => {
  try {
    await mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@feedbacks-db.rlflddv.mongodb.net/?retryWrites=true&w=majority`);
    console.log("Conectado ao MongoDB!");
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error);
    process.exit(1);
  }
};

module.exports = connectToDatabase;
