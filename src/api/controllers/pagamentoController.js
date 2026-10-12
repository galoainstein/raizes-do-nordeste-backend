const db = require('../../config/database');
const auditoria = require('../../application/auditoriaService');

exports.solicitar = (req, res) => {
  const { pedidoId, aprovado } = req.body;

  if (!pedidoId) {
    return res.status(422).json({
      error: 'VALIDACAO', message: 'pedidoId é obrigatório.',
      details: [], timestamp: new Date().toISOString(), path: req.originalUrl
    });
  }

  const pedido = db.prepare(`SELECT * FROM pedido WHERE id = ?`).get(pedidoId);
  if (!pedido) {
    return res.status(404).json({
      error: 'PEDIDO_NAO_ENCONTRADO', message: 'Pedido não encontrado.',
      details: [], timestamp: new Date().toISOString(), path: req.originalUrl
    });
  }

  const statusPagamento = aprovado === false ? 'RECUSADO' : 'APROVADO';
  const transacaoId = 'MOCK-' + Date.now();

  db.prepare(`INSERT INTO pagamento (pedido_id, status, valor, transacao_id) VALUES (?, ?, ?, ?)`)
    .run(pedidoId, statusPagamento, pedido.total, transacaoId);

  if (statusPagamento === 'APROVADO') {
    db.prepare(`UPDATE pedido SET status = 'PAGO' WHERE id = ?`).run(pedidoId);
  } else {
    db.prepare(`UPDATE pedido SET status = 'CANCELADO' WHERE id = ?`).run(pedidoId);
  }

  auditoria.registrar('PAGAMENTO_' + statusPagamento, 'Pedido', pedidoId,
    req.usuario?.id || null, `transacao=${transacaoId}`);

  res.json({
    pedidoId, statusPagamento, transacaoId,
    statusPedido: statusPagamento === 'APROVADO' ? 'PAGO' : 'CANCELADO'
  });
};