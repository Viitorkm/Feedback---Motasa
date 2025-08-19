const connectToDatabase = require('../../db');
const Feedback = require('./models/Feedback');
require('dotenv').config();

let dbConnected = false;

const ALLOWED_ORIGINS = [
  'https://feedbackmotasa.netlify.app',
];

// ID secreto para acessar o relatório, guardado no .env
const REPORT_SECRET_ID = process.env.REPORT_SECRET_ID;

exports.handler = async function (event, context) {
  // CORS
  const origin = event.headers.origin || '';
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };
  if (ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed, use GET' }),
    };
  }

  // Verifica ID secreto na query string
  const params = event.queryStringParameters || {};
  // if (!params.id || params.id !== REPORT_SECRET_ID) {
  //   return {
  //     statusCode: 401,
  //     headers,
  //     body: JSON.stringify({ error: 'Unauthorized: invalid or missing id' }),
  //   };
  // }

  try {
    // Conecta ao banco se ainda não conectado
    if (!dbConnected) {
      await connectToDatabase();
      dbConnected = true;
    }

    // Monta filtros opcionais
    const filters = {};

    if (params.vendedor) {
      filters.vendedor = params.vendedor;  // busca exata
    }
    if (params.startDate) {
      filters.created_at = filters.created_at || {};
      filters.created_at.$gte = new Date(params.startDate);
    }
    if (params.endDate) {
      filters.created_at = filters.created_at || {};
      filters.created_at.$lte = new Date(params.endDate);
    }

    // Busca os feedbacks filtrados no banco
    const feedbacks = await Feedback.find(filters).sort({ created_at: -1 }).lean();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ data: feedbacks }),
    };

  } catch (error) {
    console.error('Erro ao buscar feedbacks:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro interno no servidor' }),
    };
  }
};
