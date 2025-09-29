const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const users = [
  { username: 'admin', passwordHash: bcrypt.hashSync('senhamestre', 8), setor: 'admin' },
  { username: 'logistica', passwordHash: bcrypt.hashSync('senhamestre', 8), setor: 'RH' },
  { username: 'financeiro', passwordHash: bcrypt.hashSync('senhamestre', 8), setor: 'RH' },
  { username: 'posvendas', passwordHash: bcrypt.hashSync('senhamestre', 8), setor: 'RH' },
  { username: 'marketing', passwordHash: bcrypt.hashSync('senhamestre', 8), setor: 'RH' },
  { username: 'comercial', passwordHash: bcrypt.hashSync('senhamestre', 8), setor: 'Comercial' },
];

// Chave secreta no .env para assinar o token JWT
const JWT_SECRET = process.env.JWT_SECRET;

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Use POST para login' }),
    };
  }

  const { username, password } = JSON.parse(event.body);

  const user = users.find(u => u.username === username);
  if (!user) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Usuário ou senha inválidos' }),
    };
  }

  const passwordIsValid = bcrypt.compareSync(password, user.passwordHash);
  if (!passwordIsValid) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Usuário ou senha inválidos' }),
    };
  }

  // Cria o token JWT com validade, ex: 1h
  const token = jwt.sign({ username, setor: user.setor }, JWT_SECRET, { expiresIn: '1h' });

  return {
    statusCode: 200,
    body: JSON.stringify({ token }),
  };
};
