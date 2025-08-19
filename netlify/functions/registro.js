const connectToDatabase = require('../../db');
const Registro = require('./models/Registro');
require('dotenv').config();

let dbConnected = false;

const allowedOrigins = [
  'https://feedbackmotasa.netlify.app',
];

exports.handler = async function (event, context) {
  // Conectar ao banco só uma vez
  if (!dbConnected) {
    await connectToDatabase();
    dbConnected = true;
  }

  const origin = event.headers.origin || '';

  // Define os headers CORS, permitindo apenas origens autorizadas
  const headers = {};

  if (allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Headers'] = 'Content-Type';
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
  }


  // Responder preflight OPTIONS para CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { avaliadorId, empresa, avaliacoes } = JSON.parse(event.body);

    const ipAddress = event.headers['x-forwarded-for'] || event.headers['client-ip'] || '';

    const now = new Date();

    const registro = await Registro.create({
      avaliadorId,
      empresa: empresa || null,
      avaliacoes,
      data: new Date(),
      link: `https://feedbackmotasa.netlify.app/?atendente=${avaliadorId}`
    });


    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Usuario cadastrado com sucesso', data: registro }),
    };
  } catch (error) {
    console.error('Erro ao salvar usuario:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro ao salvar usuario' }),
    };
  }
};
