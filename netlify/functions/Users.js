const connectToDatabase = require('../../db');
const userModel = require('./models/Users');
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
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };
  if (ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  // CORS pré-vazamento
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Conecta ao banco
  if (!dbConnected) {
    await connectToDatabase();
    dbConnected = true;
  }

  const params = event.queryStringParameters || {};

  if (event.httpMethod === 'GET') {
    // Código de busca existente...
    const filters = {};
    if (params.atendenteId) {
      filters.atendenteId = Number(params.atendenteId);
    }
    if (params.startDate) {
      filters.created_at = filters.created_at || {};
      filters.created_at.$gte = new Date(params.startDate);
    }
    if (params.endDate) {
      filters.created_at = filters.created_at || {};
      filters.created_at.$lte = new Date(params.endDate);
    }

    try {
      const users = await userModel.find(filters).sort({ created_at: -1 }).lean();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ data: users }),
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Erro ao buscar usuários' }),
      };
    }
  }

  // 🚀 Suporte ao POST
  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body);

      // Validate input
      if (!body.atendenteId || !body.company) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'ID do atendente e empresa são obrigatórios' }),
        };
      }

      // Convert and validate atendenteId
      const atendenteId = Number(body.atendenteId);
      if (isNaN(atendenteId) || atendenteId <= 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'ID do atendente deve ser um número válido maior que zero' }),
        };
      }

      // Check for existing user
      const existingUser = await userModel.findOne({ atendenteId });
      
      if (existingUser) {
        console.log('Usuário existente:', existingUser);
        return {
          statusCode: 409,
          headers,
          body: JSON.stringify({ 
            error: 'Já existe um usuário com este ID de atendente. Remova o usuário existente primeiro.' 
          }),
        };
      }

      // Create new user
      const novoUsuario = await userModel.create({
        atendenteId,
        company: body.company.trim()
      });

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ 
          message: 'Usuário criado com sucesso', 
          user: novoUsuario 
        }),
      };

    } catch (err) {
      console.error('Erro detalhado:', err);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Erro ao criar usuário', 
          details: err.message 
        }),
      };
    }
  }

  if (event.httpMethod === 'DELETE') {
    const { atendenteId, deleteFeedbacks } = event.queryStringParameters || {};

    if (!atendenteId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'ID do atendente é obrigatório para exclusão' }),
      };
    }

    try {
      // Remove usuário pelo atendenteId
      const deletedUser = await userModel.findOneAndDelete({ atendenteId: Number(atendenteId) });

      if (!deletedUser) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Usuário não encontrado' }),
        };
      }

      // Se solicitado, remove feedbacks vinculados
      if (deleteFeedbacks === 'true') {
        const Feedback = require('./models/Feedback');
        await Feedback.deleteMany({ vendedor: String(atendenteId) });
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Usuário deletado com sucesso', user: deletedUser }),
      };

    } catch (err) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Erro ao deletar usuário' }),
      };
    }
  }

  // Outros métodos não permitidos
  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Método não permitido' }),
  };
};
