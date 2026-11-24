/**
 * ============================================================
 * CLIENTES — /api/clientes
 * ============================================================
 * Consulta de clientes pela equipe do lava-jato.
 * O cadastro de cliente é feito pelo próprio cliente em /api/auth/registrar.
 *
 * Acesso: ADMIN e FUNCIONARIO.
 */
const express = require('express');
const prisma = require('../config/prisma');
const { autenticar, autorizar } = require('../middlewares/auth');

const router = express.Router();

/**
 * GET /api/clientes — ADMIN, FUNCIONARIO
 * Lista os clientes com nome, e-mail, telefone e veículos (nunca a senha).
 */
router.get('/', autenticar, autorizar('ADMIN', 'FUNCIONARIO'), async (req, res) => {
  const clientes = await prisma.cliente.findMany({
    include: {
      user: { select: { id: true, nome: true, email: true } },
      veiculos: true
    },
    orderBy: { id: 'asc' }
  });
  return res.json(clientes);
});

module.exports = router;
