const db = require('../config/database');

function registrar(acao, entidade, entidadeId, usuarioId, detalhes = '') {
  db.prepare(`INSERT INTO log_auditoria (acao, entidade, entidade_id, usuario_id, detalhes)
              VALUES (?, ?, ?, ?, ?)`)
    .run(acao, entidade, entidadeId, usuarioId, detalhes);
}

module.exports = { registrar };