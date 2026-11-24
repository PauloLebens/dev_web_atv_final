/**
 * ============================================================
 * VEÍCULOS — /api/veiculos
 * ============================================================
 * Veículos dos clientes. Tipos: CARRO, MOTO e CAMINHAO, cada um com
 * campos próprios (diagrama de classes: Carro, Moto, Caminhão):
 *   CARRO:    numeroPortas, tipoCombustivel
 *   MOTO:     cilindradas
 *   CAMINHAO: capacidadeCarga, numeroEixos
 * Campos que não pertencem ao tipo são ignorados/zerados.
 *
 * A placa é a identificação do veículo (ABC1234 ou Mercosul ABC1D23;
 * hífen e minúsculas são aceitos e normalizados).
 *
 * Acesso:
 * - CLIENTE: vê, cadastra, edita e remove apenas os próprios veículos.
 * - ADMIN: tudo, de qualquer cliente.
 * - FUNCIONARIO: apenas consulta.
 */
const express = require('express');
const veiculoController = require('../controllers/veiculoController');
const { autenticar, autorizar } = require('../middlewares/auth');

const router = express.Router();

router.use(autenticar);

/**
 * GET /api/veiculos — Logado
 * Cliente: seus veículos. Admin/Funcionário: todos (filtro opcional ?clienteId=1).
 */
router.get('/', veiculoController.listar);

/**
 * GET /api/veiculos/:placa — Logado (cliente só os seus)
 */
router.get('/:placa', veiculoController.buscar);

/**
 * POST /api/veiculos — CLIENTE, ADMIN
 * Cadastra um veículo. O cliente cadastra para si; o admin informa clienteId.
 * Body: { placa, modelo, marca, ano, tipo? (padrão CARRO), ...campos do tipo, clienteId? (admin) }
 * 409: placa já cadastrada
 */
router.post('/', autorizar('CLIENTE', 'ADMIN'), veiculoController.criar);

/**
 * PATCH /api/veiculos/:placa — CLIENTE (dono), ADMIN
 * Atualiza os dados enviados. A placa não pode ser alterada.
 */
router.patch('/:placa', autorizar('CLIENTE', 'ADMIN'), veiculoController.atualizar);

/**
 * DELETE /api/veiculos/:placa — CLIENTE (dono), ADMIN
 * Remove o veículo. 409 se ele já tiver agendamentos (preserva o histórico).
 */
router.delete('/:placa', autorizar('CLIENTE', 'ADMIN'), veiculoController.remover);

module.exports = router;
