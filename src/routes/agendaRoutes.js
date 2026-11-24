/**
 * ============================================================
 * AGENDA — /api/agenda
 * ============================================================
 * Define em quais dias e horários o lava-jato atende, e informa ao cliente
 * quais horários ainda estão livres (RF01, FR02, HU04).
 *
 * Como funciona a disponibilidade:
 * - O admin abre os dias com uma lista de horários de início (ex: 08:00, 08:30...).
 * - Um horário aparece como livre se existir pelo menos um funcionário ativo
 *   sem outro agendamento durante TODA a duração dos serviços escolhidos.
 * - Agendamentos cancelados liberam o horário de novo.
 * - Horários que já passaram não aparecem.
 *
 * Datas no formato AAAA-MM-DD e horários HH:MM, no horário de Brasília.
 */
const express = require('express');
const agendaController = require('../controllers/agendaController');
const { autenticar, autorizar } = require('../middlewares/auth');

const router = express.Router();

/**
 * GET /api/agenda?de=2026-12-01&ate=2026-12-31 — Público
 * Dias abertos no período, com os horários de funcionamento de cada um.
 * Sem filtros: de hoje até 30 dias. Usado para montar o calendário.
 */
router.get('/', agendaController.listar);

/**
 * GET /api/agenda/:data/disponiveis?servicoIds=1,2 — Público
 * Horários LIVRES do dia para os serviços escolhidos (soma das durações).
 * Alternativa: ?duracao=90 (minutos). Sem nenhum dos dois: 30 minutos.
 * 200: { data, duracaoMinutos, horarios: ["08:00", ...] }  (vazio se o dia estiver fechado)
 */
router.get('/:data/disponiveis', agendaController.disponiveis);

/**
 * POST /api/agenda/lote — ADMIN
 * Abre vários dias de uma vez (ex: o mês inteiro).
 * Body: { de, ate, horarios: ["08:00", ...], diasSemana?: [1,2,3,4,5,6] }
 * diasSemana: 0 = domingo ... 6 = sábado (padrão: segunda a sábado).
 * Dias já abertos têm os horários substituídos.
 */
router.post('/lote', autenticar, autorizar('ADMIN'), agendaController.definirLote);

/**
 * PUT /api/agenda/:data — ADMIN
 * Abre um dia específico ou substitui os horários dele.
 * Body: { horarios: ["08:00", "09:00", ...] }
 */
router.put('/:data', autenticar, autorizar('ADMIN'), agendaController.definirDia);

/**
 * DELETE /api/agenda/:data — ADMIN
 * Fecha o dia (feriado, manutenção...). 409 se houver agendamentos ativos nele.
 */
router.delete('/:data', autenticar, autorizar('ADMIN'), agendaController.removerDia);

module.exports = router;
