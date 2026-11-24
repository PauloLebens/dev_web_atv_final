/**
 * ============================================================
 * ROTAS DA API — ponto de entrada (todas começam com /api)
 * ============================================================
 *
 * Grupo             Prefixo               Objetivo
 * ----------------  --------------------  ------------------------------------------------
 * Saúde             /api/health           Verificar se a API está no ar
 * Autenticação      /api/auth             Cadastro de cliente, login e "quem sou eu"
 * Funcionários      /api/funcionarios     Admin gerencia a equipe
 * Clientes          /api/clientes         Admin/funcionário consultam clientes
 * Serviços          /api/servicos         Catálogo (público) e gestão do catálogo (admin)
 * Veículos          /api/veiculos         Cliente gerencia os seus; equipe consulta
 * Agenda            /api/agenda           Dias/horários de funcionamento e horários livres
 * Agendamentos      /api/agendamentos     Reservas, rastreamento de status e cancelamento
 *
 * Autenticação: rotas protegidas exigem o header
 *   Authorization: Bearer <token>   (token obtido em /api/auth/login)
 *
 * Perfis: ADMIN, FUNCIONARIO, CLIENTE. Cada arquivo de rotas indica quem acessa cada rota.
 * Erros sempre voltam como JSON: { "error": "mensagem" }
 */
const express = require('express');
const authRoutes = require('./authRoutes');
const funcionarioRoutes = require('./funcionarioRoutes');
const clienteRoutes = require('./clienteRoutes');
const servicoRoutes = require('./servicoRoutes');
const veiculoRoutes = require('./veiculoRoutes');
const agendaRoutes = require('./agendaRoutes');
const agendamentoRoutes = require('./agendamentoRoutes');

const router = express.Router();

/**
 * GET /api/health — Público
 * Verifica se a API está respondendo. Usado pelo frontend para mostrar o status.
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

router.use('/auth', authRoutes);
router.use('/funcionarios', funcionarioRoutes);
router.use('/clientes', clienteRoutes);
router.use('/servicos', servicoRoutes);
router.use('/veiculos', veiculoRoutes);
router.use('/agenda', agendaRoutes);
router.use('/agendamentos', agendamentoRoutes);

module.exports = router;
