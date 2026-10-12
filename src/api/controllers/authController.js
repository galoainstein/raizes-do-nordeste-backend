const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../config/database');

exports.login = (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(422).json({
      error: 'VALIDACAO',
      message: 'E-mail e senha são obrigatórios.',
      details: [],
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  }

  const usuario = db.prepare(`SELECT * FROM usuario WHERE email = ?`).get(email);
  if (!usuario || !bcrypt.compareSync(senha, usuario.senha_hash)) {
    return res.status(401).json({
      error: 'CREDENCIAIS_INVALIDAS',
      message: 'E-mail ou senha inválidos.',
      details: [],
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  }

  const token = jwt.sign(
    { id: usuario.id, nome: usuario.nome, perfil: usuario.perfil },
    process.env.JWT_SECRET,
    { expiresIn: Number(process.env.JWT_EXPIRATION) || 3600 }
  );

  res.json({
    accessToken: token,
    tokenType: 'Bearer',
    expiresIn: Number(process.env.JWT_EXPIRATION) || 3600,
    user: { id: usuario.id, nome: usuario.nome, perfil: usuario.perfil }
  });
};