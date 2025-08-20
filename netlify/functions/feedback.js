const connectToDatabase = require('../../db');
const Feedback = require('./models/Feedback');
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
    const { rating, comment, empresa, vendedor } = JSON.parse(event.body);

    const ipAddress = event.headers['x-forwarded-for'] || event.headers['client-ip'] || '';

    const now = new Date();

    if (empresa && empresa.length > 50) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Nome da empresa não pode exceder 50 caracteres' }),
      };
    }

    const feedback = await Feedback.create({
      rating,
      comment,
      ip_address: ipAddress,
      created_at: new Date(),
      empresa: empresa || null,
      vendedor: vendedor || null 
    });


    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Feedback enviado com sucesso', data: feedback }),
    };
  } catch (error) {
    console.error('Erro ao salvar feedback:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro ao salvar feedback' }),
    };
  }
};
