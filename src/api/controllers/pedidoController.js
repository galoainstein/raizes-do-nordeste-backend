const db = require('../../config/database');
const auditoria = require('../../application/auditoriaService');

const CANAIS_VALIDOS = ['APP', 'TOTEM', 'BALCAO', 'PICKUP', 'WEB'];

exports.criar = (req, res) => {
  const { canalPedido, unidadeId, itens, clienteId } = req.body;

  if (!canalPedido || !CANAIS_VALIDOS.includes(canalPedido)) {
    return res.status(422).json({
      error: 'VALIDACAO',
      message: 'canalPedido é obrigatório e deve ser APP, TOTEM, BALCAO, PICKUP ou WEB.',
      details: [], timestamp: new Date().toISOString(), path: req.originalUrl
    });
  }

  if (!unidadeId || !Array.isArray(itens) || itens.length === 0) {
    return res.status(422).json({
      error: 'VALIDACAO',
      message: 'unidadeId e itens são obrigatórios.',
      details: [], timestamp: new Date().toISOString(), path: req.originalUrl
    });
  }

  const unidade = db.prepare(`SELECT * FROM unidade WHERE id = ?`).get(unidadeId);
  if (!unidade) {
    return res.status(404).json({
      error: 'UNIDADE_NAO_ENCONTRADA',
      message: 'Unidade não encontrada.',
      details: [], timestamp: new Date().toISOString(), path: req.originalUrl
    });
  }

  try {
    const resultado = db.transaction(() => {
      let total = 0;
      const itensValidados = [];

      for (const item of itens) {
        const produto = db.prepare(`SELECT * FROM produto WHERE id = ?`).get(item.produtoId);
        if (!produto) {
          const err = new Error('PRODUTO_NAO_ENCONTRADO');
          err.status = 404; err.produtoId = item.produtoId; throw err;
        }

        const estoque = db.prepare(`SELECT * FROM estoque WHERE unidade_id = ? AND produto_id = ?`)
          .get(unidadeId, item.produtoId);

        if (!estoque || estoque.quantidade < item.quantidade) {
          const err = new Error('ESTOQUE_INSUFICIENTE');
          err.status = 409; err.produtoId = item.produtoId;
          err.disponivel = estoque ? estoque.quantidade : 0; throw err;
        }

        total += produto.preco * item.quantidade;
        itensValidados.push({ produtoId: item.produtoId, quantidade: item.quantidade, precoUnitario: produto.preco });
      }

      const infoPedido = db.prepare(`INSERT INTO pedido (cliente_id, unidade_id, canal_pedido, status, total)
                                     VALUES (?, ?, ?, 'AGUARDANDO_PAGAMENTO', ?)`)
        .run(clienteId || null, unidadeId, canalPedido, total);

      const pedidoId = infoPedido.lastInsertRowid;

      const insertItem = db.prepare(`INSERT INTO item_pedido (pedido_id, produto_id, quantidade, preco_unitario)
                                     VALUES (?, ?, ?, ?)`);
      const updateEstoque = db.prepare(`UPDATE estoque SET quantidade = quantidade - ?, updated_at = CURRENT_TIMESTAMP
                                        WHERE unidade_id = ? AND produto_id = ?`);

      for (const it of itensValidados) {
        insertItem.run(pedidoId, it.produtoId, it.quantidade, it.precoUnitario);
        updateEstoque.run(it.quantidade, unidadeId, it.produtoId);
      }

      auditoria.registrar('PEDIDO_CRIADO', 'Pedido', pedidoId, clienteId || null, `canal=${canalPedido}; total=${total}`);

      return { pedidoId, status: 'AGUARDANDO_PAGAMENTO', total, itens: itensValidados, canalPedido };
    })();

    res.status(201).json(resultado);
  } catch (err) {
    if (err.status === 404) {
      return res.status(404).json({
        error: 'PRODUTO_NAO_ENCONTRADO',
        message: `Produto ${err.produtoId} não encontrado.`,
        details: [], timestamp: new Date().toISOString(), path: req.originalUrl
      });
    }
    if (err.status === 409) {
      return res.status(409).json({
        error: 'ESTOQUE_INSUFICIENTE',
        message: 'Não há quantidade suficiente para um ou mais itens.',
        details: [{ field: `produtoId ${err.produtoId}`, issue: `Disponível: ${err.disponivel}` }],
        timestamp: new Date().toISOString(), path: req.originalUrl
      });
    }
    throw err;
  }
};

exports.listar = (req, res) => {
  const { canalPedido, status } = req.query;
  let sql = `SELECT * FROM pedido WHERE 1=1`;
  const params = [];
  if (canalPedido) { sql += ` AND canal_pedido = ?`; params.push(canalPedido); }
  if (status) { sql += ` AND status = ?`; params.push(status); }
  sql += ` ORDER BY id DESC`;
  res.json(db.prepare(sql).all(...params));
};

exports.buscarPorId = (req, res) => {
  const pedido = db.prepare(`SELECT * FROM pedido WHERE id = ?`).get(req.params.id);
  if (!pedido) {
    return res.status(404).json({
      error: 'PEDIDO_NAO_ENCONTRADO',
      message: 'Pedido não encontrado.',
      details: [], timestamp: new Date().toISOString(), path: req.originalUrl
    });
  }
  const itens = db.prepare(`SELECT * FROM item_pedido WHERE pedido_id = ?`).all(pedido.id);
  res.json({ ...pedido, itens });
};

exports.atualizarStatus = (req, res) => {
  const { status } = req.body;
  const validos = ['AGUARDANDO_PAGAMENTO', 'PAGO', 'EM_PREPARO', 'PRONTO', 'ENTREGUE', 'CANCELADO'];
  if (!validos.includes(status)) {
    return res.status(422).json({
      error: 'VALIDACAO', message: 'Status inválido.',
      details: [], timestamp: new Date().toISOString(), path: req.originalUrl
    });
  }
  const pedido = db.prepare(`SELECT * FROM pedido WHERE id = ?`).get(req.params.id);
  if (!pedido) {
    return res.status(404).json({
      error: 'PEDIDO_NAO_ENCONTRADO', message: 'Pedido não encontrado.',
      details: [], timestamp: new Date().toISOString(), path: req.originalUrl
    });
  }
  db.prepare(`UPDATE pedido SET status = ? WHERE id = ?`).run(status, pedido.id);
  auditoria.registrar('STATUS_ALTERADO', 'Pedido', pedido.id, req.usuario.id, `${pedido.status} -> ${status}`);
  res.json({ id: pedido.id, status });
};