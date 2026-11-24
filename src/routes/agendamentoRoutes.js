/**
 * ============================================================
 * AGENDAMENTOS — /api/agendamentos
 * ============================================================
 * Núcleo do sistema: reserva de horário com serviços ("carrinho"),
 * alocação automática de funcionário, rastreamento do veículo e cancelamento.
 * (RF01, FR02, FR04, FR05, FR06 / HU04, HU05, HU06)
 *
 * Fluxo de status (cada "avançar" leva para o próximo):
 *   AGENDADO → VEICULO_RECEBIDO → EM_AGUARDO → EM_SERVICO → FINALIZADO
 *   (FINALIZADO = "finalizado/aguardando retirada")
 *   Fora do fluxo: CANCELADO (libera o horário).
 *
 * Ao criar, o sistema:
 *   1. confere se o veículo é do cliente e se os serviços estão ativos;
 *   2. soma preço e duração, congelando o preço de cada serviço;
 *   3. confere se o horário está na agenda e se há funcionário livre;
 *   4. atribui o funcionário livre com menos tarefas no dia.
 * Tudo numa transação: dois clientes nunca ficam com a mesma vaga.
 *
 * Visibilidade:
 * - CLIENTE: só os agendamentos dos próprios veículos.
 * - FUNCIONARIO: só os atribuídos a ele (sua lista de tarefas).
 * - ADMIN: todos.
 */
const express = require('express');
const agendamentoController = require('../controllers/agendamentoController');
const { autenticar, autorizar } = require('../middlewares/auth');

const router = express.Router();

router.use(autenticar);

/**
 * GET /api/agendamentos?data=2026-12-01&status=EM_SERVICO — Logado
 * Lista conforme o perfil (ver acima). Filtros opcionais por dia e status.
 * Para o funcionário, ?data=<hoje> é a lista de tarefas do dia (HU05).
 */
router.get('/', agendamentoController.listar);

/**
 * GET /api/agendamentos/:id — Logado (dono, funcionário responsável ou admin)
 * Detalhes com veículo, serviços, valores, funcionário e status.
 * Usado na tela de acompanhamento do cliente (HU06) e como extrato (HU07).
 */
router.get('/:id', agendamentoController.buscar);

/**
 * POST /api/agendamentos — CLIENTE, ADMIN
 * Cria um agendamento (auto agendamento - RF01 / HU04).
 * Body: { veiculoPlaca, data: "AAAA-MM-DD", horario: "HH:MM", servicoIds: [1, 2], observacoes? }
 * 201: agendamento criado (status AGENDADO, com funcionário atribuído)
 * 409: horário indisponível, fora da agenda ou veículo já agendado no horário
 */
router.post('/', autorizar('CLIENTE', 'ADMIN'), agendamentoController.criar);

/**
 * POST /api/agendamentos/:id/cancelar — CLIENTE (dono), ADMIN
 * Cancela e libera o horário. O cliente só cancela enquanto o status for
 * AGENDADO e antes do horário marcado; o admin pode cancelar até finalizar.
 */
router.post('/:id/cancelar', autorizar('CLIENTE', 'ADMIN'), agendamentoController.cancelar);

/**
 * POST /api/agendamentos/:id/avancar — FUNCIONARIO (responsável), ADMIN
 * O "um clique" do FR06: avança o status para a próxima etapa do fluxo.
 */
router.post('/:id/avancar', autorizar('FUNCIONARIO', 'ADMIN'), agendamentoController.avancarStatus);

/**
 * PATCH /api/agendamentos/:id/status — FUNCIONARIO (responsável), ADMIN
 * Define um status específico do fluxo (pular etapa ou corrigir clique errado).
 * Body: { status: "EM_SERVICO" }. Para cancelar, use /cancelar.
 * Após FINALIZADO, só o admin pode alterar.
 */
router.patch('/:id/status', autorizar('FUNCIONARIO', 'ADMIN'), agendamentoController.definirStatus);

module.exports = router;
