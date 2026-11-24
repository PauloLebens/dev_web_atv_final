/**
 * ============================================================
 * AUTENTICAÇÃO — /api/auth
 * ============================================================
 * Cadastro de novos clientes, login e consulta do usuário logado.
 * O token devolvido no cadastro/login deve ser enviado nas demais rotas:
 *   Authorization: Bearer <token>     (validade: 12 horas)
 *
 * Funcionários são cadastrados pelo admin (/api/funcionarios).
 * O primeiro admin é criado pelo seed (npx prisma db seed).
 */
const express = require('express');
const authController = require('../controllers/authController');
const { autenticar } = require('../middlewares/auth');

const router = express.Router();

/**
 * POST /api/auth/registrar — Público
 * Cria uma conta de CLIENTE (caso de uso 1, exceção 1a: "Não possui conta").
 * Body: { nome, email, senha (mín. 6), telefone }
 * 201: { usuario, token }  |  400: campos inválidos  |  409: e-mail já cadastrado
 */
router.post('/registrar', authController.registrar);

/**
 * POST /api/auth/login — Público
 * Confere e-mail e senha e devolve o token de acesso.
 * Body: { email, senha }
 * 200: { usuario, token }  |  401: e-mail ou senha incorretos
 */
router.post('/login', authController.login);

/**
 * GET /api/auth/me — Qualquer usuário logado
 * Dados do usuário dono do token (perfil, dados de cliente ou funcionário).
 * Útil para o frontend saber quem está logado ao recarregar a página.
 */
router.get('/me', autenticar, authController.me);

module.exports = router;
