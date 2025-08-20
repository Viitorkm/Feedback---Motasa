const connectToDatabase = require('../../db');
const Feedback = require('./models/Feedback');
require('dotenv').config();

let dbConnected = false;

const allowedOrigins = [
  'https://feedbackmotasa.netlify.app',
];

exports.handler = async function(event, context) {
  if (!dbConnected) {
    await connectToDatabase();
    dbConnected = true;
  }

  const origin = event.headers.origin || '';
  const headers = {};

  if (allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Headers'] = 'Content-Type';
    headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS';
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const id = event.queryStringParameters?.id;

    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'ID é obrigatório' }),
      };
    }

    // Busca no Mongo todos feedbacks com vendedor == id
    const feedbacks = await Feedback.find({ vendedor: id })
      .select('rating comment created_at')
      .sort({ created_at: -1 })
      .lean();

    // Formata a data para padrão BR
    const formatDateBR = (date) => {
      const d = new Date(date);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const formatted = feedbacks.map(fb => ({
      rating: fb.rating,
      comment: fb.comment,
      created_at: formatDateBR(fb.created_at),
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ feedbacks: formatted }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro ao buscar avaliações' }),
    };
  }
};

/.netlify/functions/GetAvaliacoes
