/**
 * ============================================================
 * FUNCIONÁRIOS — /api/funcionarios
 * ============================================================
 * Gestão da equipe pelo administrador. Cada funcionário tem login próprio
 * (perfil FUNCIONARIO) para ver suas tarefas e atualizar o status dos veículos.
 *
 * Funcionários ATIVOS recebem agendamentos automaticamente (FR04).
 * A quantidade de funcionários ativos define quantos veículos podem ser
 * atendidos no mesmo horário.
 *
 * Acesso: todas as rotas são exclusivas do ADMIN.
 */
const express = require('express');
const funcionarioController = require('../controllers/funcionarioController');
const { autenticar, autorizar } = require('../middlewares/auth');

const router = express.Router();

router.use(autenticar, autorizar('ADMIN'));

/**
 * GET /api/funcionarios — ADMIN
 * Lista todos os funcionários (ativos e inativos) com nome e e-mail.
 */
router.get('/', funcionarioController.listar);

/**
 * POST /api/funcionarios — ADMIN
 * Cadastra um funcionário e cria o login dele.
 * Body: { nome, email, senha (mín. 6), cargo }
 * 201: funcionário criado  |  409: e-mail já cadastrado
 */
router.post('/', funcionarioController.criar);

/**
 * PATCH /api/funcionarios/:id — ADMIN
 * Altera o cargo e/ou ativa/desativa o funcionário.
 * Body (qualquer um): { cargo, ativo }
 * Desativar não remove agendamentos já atribuídos, só impede novos.
 */
router.patch('/:id', funcionarioController.atualizar);

module.exports = router;
