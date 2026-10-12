const express = require('express');
const router = express.Router();
const { autenticar, autorizar } = require('../middlewares/auth');

const authController = require('../controllers/authController');
const produtoController = require('../controllers/produtoController');
const pedidoController = require('../controllers/pedidoController');
const pagamentoController = require('../controllers/pagamentoController');
const fidelidadeController = require('../controllers/fidelidadeController');
const estoqueController = require('../controllers/estoqueController');

router.post('/auth/login', authController.login);

router.get('/produtos', produtoController.listar);
router.post('/produtos', autenticar, autorizar('ADMIN', 'GERENTE'), produtoController.criar);

router.post('/pedidos', autenticar, autorizar('CLIENTE', 'ATENDENTE', 'ADMIN'), pedidoController.criar);
router.get('/pedidos', autenticar, pedidoController.listar);
router.get('/pedidos/:id', autenticar, pedidoController.buscarPorId);
router.patch('/pedidos/:id/status', autenticar, autorizar('COZINHA', 'GERENTE', 'ADMIN'), pedidoController.atualizarStatus);

router.post('/pagamentos', autenticar, pagamentoController.solicitar);

router.get('/fidelidade/saldo', autenticar, autorizar('CLIENTE'), fidelidadeController.saldo);
router.post('/fidelidade/resgatar', autenticar, autorizar('CLIENTE'), fidelidadeController.resgatar);

router.get('/estoque/unidade/:unidadeId', autenticar, estoqueController.consultarPorUnidade);
router.post('/estoque/movimentar', autenticar, autorizar('GERENTE', 'ADMIN'), estoqueController.movimentar);

module.exports = router;