const db = require('../../config/database');

exports.consultarPorUnidade = (req, res) => {
  const rows = db.prepare(`SELECT * FROM estoque WHERE unidade_id = ?`).all(req.params.unidadeId);
  res.json(rows);
};

exports.movimentar = (req, res) => {
  const { unidadeId, produtoId, quantidade, tipo } = req.body;
  if (!unidadeId || !produtoId || !quantidade || !['ENTRADA', 'SAIDA'].includes(tipo)) {
    return res.status(422).json({
      error: 'VALIDACAO',
      message: 'unidadeId, produtoId, quantidade e tipo (ENTRADA/SAIDA) são obrigatórios.',
      details: [], timestamp: new Date().toISOString(), path: req.originalUrl
    });
  }

  const estoque = db.prepare(`SELECT * FROM estoque WHERE unidade_id = ? AND produto_id = ?`)
    .get(unidadeId, produtoId);

  if (!estoque) {
    db.prepare(`INSERT INTO estoque (unidade_id, produto_id, quantidade) VALUES (?, ?, ?)`)
      .run(unidadeId, produtoId, tipo === 'ENTRADA' ? quantidade : 0);
    return res.status(201).json({ unidadeId, produtoId, quantidade });
  }

  if (tipo === 'SAIDA' && estoque.quantidade < quantidade) {
    return res.status(409).json({
      error: 'ESTOQUE_INSUFICIENTE', message: 'Quantidade insuficiente em estoque.',
      details: [], timestamp: new Date().toISOString(), path: req.originalUrl
    });
  }

  const delta = tipo === 'ENTRADA' ? quantidade : -quantidade;
  db.prepare(`UPDATE estoque SET quantidade = quantidade + ?, updated_at = CURRENT_TIMESTAMP
              WHERE unidade_id = ? AND produto_id = ?`).run(delta, unidadeId, produtoId);

  const atual = db.prepare(`SELECT * FROM estoque WHERE unidade_id = ? AND produto_id = ?`)
    .get(unidadeId, produtoId);
  res.json(atual);
};