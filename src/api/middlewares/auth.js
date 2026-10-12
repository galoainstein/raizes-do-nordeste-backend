const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({
      error: 'NAO_AUTENTICADO',
      message: 'Token não informado.',
      details: [],
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  }

  const [, token] = header.split(' ');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload;
    next();
  } catch (err) {
    return res.status(401).json({
      error: 'TOKEN_INVALIDO',
      message: 'Token inválido ou expirado.',
      details: [],
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  }
}

function autorizar(...perfis) {
  return (req, res, next) => {
    if (!req.usuario || !perfis.includes(req.usuario.perfil)) {
      return res.status(403).json({
        error: 'SEM_PERMISSAO',
        message: 'Você não tem permissão para acessar este recurso.',
        details: [],
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      });
    }
    next();
  };
}

module.exports = { autenticar, autorizar };