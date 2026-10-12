const db = require('../../config/database');

exports.saldo = (req, res) => {
  const fidelidade = db.prepare(`SELECT * FROM fidelidade WHERE cliente_id = ?`).get(req.usuario.id);
  if (!fidelidade) {
    return res.status(404).json({
      error: 'FIDELIDADE_NAO_ENCONTRADA', message: 'Cliente não possui programa de fidelidade.',
      details: [], timestamp: new Date().toISOString(), path: req.originalUrl
    });
  }
  res.json(fidelidade);
};

exports.resgatar = (req, res) => {
  const { pontos } = req.body;
  if (!pontos || pontos <= 0) {
    return res.status(422).json({
      error: 'VALIDACAO', message: 'Informe uma quantidade válida de pontos.',
      details: [], timestamp: new Date().toISOString(), path: req.originalUrl
    });
  }
  const fidelidade = db.prepare(`SELECT * FROM fidelidade WHERE cliente_id = ?`).get(req.usuario.id);
  if (!fidelidade || fidelidade.pontos < pontos) {
    return res.status(409).json({
      error: 'PONTOS_INSUFICIENTES', message: 'Saldo de pontos insuficiente.',
      details: [], timestamp: new Date().toISOString(), path: req.originalUrl
    });
  }
  db.prepare(`UPDATE fidelidade SET pontos = pontos - ?, updated_at = CURRENT_TIMESTAMP WHERE cliente_id = ?`)
    .run(pontos, req.usuario.id);
  res.json({ clienteId: req.usuario.id, pontosResgatados: pontos, saldoAtual: fidelidade.pontos - pontos });
};