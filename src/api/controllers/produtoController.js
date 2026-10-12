const db = require('../../config/database');

exports.listar = (req, res) => {
  const { unidadeId } = req.query;
  let rows;
  if (unidadeId) {
    rows = db.prepare(`
      SELECT p.* FROM produto p
      JOIN produto_unidade pu ON pu.produto_id = p.id
      WHERE pu.unidade_id = ? AND pu.disponivel = 1
    `).all(unidadeId);
  } else {
    rows = db.prepare(`SELECT * FROM produto`).all();
  }
  res.json(rows);
};

exports.criar = (req, res) => {
  const { nome, descricao, preco, categoria, sazonal } = req.body;
  if (!nome || preco == null) {
    return res.status(422).json({
      error: 'VALIDACAO',
      message: 'Nome e preço são obrigatórios.',
      details: [], timestamp: new Date().toISOString(), path: req.originalUrl
    });
  }
  const info = db.prepare(`INSERT INTO produto (nome, descricao, preco, categoria, sazonal)
                           VALUES (?, ?, ?, ?, ?)`)
    .run(nome, descricao || '', preco, categoria || '', sazonal ? 1 : 0);
  res.status(201).json({ id: info.lastInsertRowid, nome, preco });
};