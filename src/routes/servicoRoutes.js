/**
 * ============================================================
 * SERVIÇOS (CATÁLOGO) — /api/servicos
 * ============================================================
 * Catálogo de serviços oferecidos: nome, descrição detalhada, imagem,
 * preço e tempo estimado (RF01, FR03, HU01, HU03).
 *
 * - Consulta: pública (o cliente vê o catálogo antes de agendar).
 * - Gestão (cadastrar, editar, precificar, desativar): só ADMIN.
 *
 * Observação: o preço volta como texto ("120.00") porque é Decimal no banco.
 * No frontend, converter com Number(servico.preco).
 */
const express = require('express');
const servicoController = require('../controllers/servicoController');
const { autenticar, autenticarOpcional, autorizar } = require('../middlewares/auth');

const router = express.Router();

/**
 * GET /api/servicos — Público
 * Lista o catálogo. Visitantes/clientes veem só serviços ativos;
 * o admin logado vê também os desativados.
 */
router.get('/', autenticarOpcional, servicoController.listar);

/**
 * GET /api/servicos/:id — Público
 * Detalhes de um serviço (para a tela de detalhes do catálogo).
 */
router.get('/:id', autenticarOpcional, servicoController.buscar);

/**
 * POST /api/servicos — ADMIN
 * Cadastra um serviço no catálogo (HU01).
 * Body: { nome, descricao, preco, duracaoMinutos? (padrão 30), imagemUrl? }
 */
router.post('/', autenticar, autorizar('ADMIN'), servicoController.criar);

/**
 * PATCH /api/servicos/:id — ADMIN
 * Edita/precifica um serviço; envie só os campos que mudam (HU01).
 * Body (qualquer um): { nome, descricao, preco, duracaoMinutos, imagemUrl, ativo }
 * Mudar o preço NÃO altera agendamentos já feitos (o preço fica congelado neles).
 */
router.patch('/:id', autenticar, autorizar('ADMIN'), servicoController.atualizar);

/**
 * DELETE /api/servicos/:id — ADMIN
 * Desativa o serviço (some do catálogo, mas o histórico é mantido).
 * Para reativar: PATCH /api/servicos/:id com { "ativo": true }.
 */
router.delete('/:id', autenticar, autorizar('ADMIN'), servicoController.desativar);

module.exports = router;
