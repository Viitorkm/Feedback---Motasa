const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI; 
const client = new MongoClient(uri);

exports.handler = async function (event, context) {
  try {
    if (event.httpMethod !== "GET") {
      return { statusCode: 405, body: "Método não permitido" };
    }

    const tipo = event.queryStringParameters.tipo || "Feedbacks"; 
    await client.connect();
    const db = client.db("test");
    const collection = db.collection(tipo);

    const { vendedor, startDate, endDate } = event.queryStringParameters;
    const filter = {};

    if (vendedor) {
      filter.avaliadorId = { $regex: vendedor, $options: "i" };
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const data = await collection.find(filter).sort({ date: -1 }).toArray();

    return {
      statusCode: 200,
      body: JSON.stringify({ data }),
    };
  } catch (err) {
    console.error("Erro na função cadastro:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erro interno no servidor." }),
    };
  }
};
