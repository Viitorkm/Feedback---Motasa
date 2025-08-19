require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const connectToDatabase = require('./db');
const Feedback = require('./models/Feedback');

connectToDatabase(); // conectar ao MongoDB

const app = express();

const corsOptions = {
  origin: 'https://feedbackmotasa.netlify.app',
  methods: 'GET,POST',
  allowedHeaders: 'Content-Type',
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

app.post('/api/feedback', async (req, res) => {
  const { rating, comment, empresa } = req.body;
  const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  const now = new Date();
  const brNow = new Date(now.getTime() - 3 * 60 * 60 * 1000);

  try {
    const feedback = await Feedback.create({
      rating,
      comment,
      ip_address: ipAddress,
      created_at: brNow,
      empresa: empresa || null
    });

    res.status(200).json({ message: 'Feedback enviado com sucesso', data: feedback });
  } catch (error) {
    console.error('Erro ao salvar feedback:', error);
    res.status(500).json({ error: 'Erro ao salvar feedback' });
  }
});

app.listen(8888, () => {
  console.log('Servidor rodando na porta 8888');
});
