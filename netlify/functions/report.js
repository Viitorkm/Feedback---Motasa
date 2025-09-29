const jwt = require('jsonwebtoken');
const connectToDatabase = require('../../db');
const Feedback = require('./models/Feedback');
require('dotenv').config();

let dbConnected = false;
const JWT_SECRET = process.env.JWT_SECRET;

exports.handler = async function (event) {
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  // CORS
  const origin = event.headers.origin || '';
  const ALLOWED_ORIGINS = ['https://feedbackmotasa.netlify.app'];
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
      body: JSON.stringify({ error: 'Use GET' }),
    };
  }

  // Pega token do cabeçalho Authorization: Bearer <token>
  const authHeader = event.headers.authorization || '';
  const token = authHeader.split(' ')[1];

  if (!token) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Token ausente' }),
    };
  }

  try {
    // Verifica token e pega setor
    const decoded = jwt.verify(token, JWT_SECRET);
    const userSetor = decoded.setor;

    if (!dbConnected) {
      await connectToDatabase();
      dbConnected = true;
    }

    const filters = {};
    const params = event.queryStringParameters || {};
    if (params.vendedor) filters.vendedor = params.vendedor;
    if (params.startDate) {
      filters.created_at = filters.created_at || {};
      filters.created_at.$gte = new Date(params.startDate);
    }
    if (params.endDate) {
      filters.created_at = filters.created_at || {};
      filters.created_at.$lte = new Date(params.endDate);
    }

    // Se não for admin, filtra pelo setor do usuário (case-insensitive)
    if (userSetor && userSetor !== 'admin') {
      filters.setor_nome = { $regex: new RegExp(`^${userSetor}$`, 'i') };
    }

    const feedbacks = await Feedback.find(filters).sort({ created_at: -1 }).lean();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ data: feedbacks }),
    };
  } catch (err) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Token inválido ou expirado' }),
    };
  }
};
