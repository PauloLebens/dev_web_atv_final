const express = require('express');
const prisma = require('../config/prisma');
const { autenticar, autorizar } = require('../middlewares/auth');

const router = express.Router();

/**
 * GET /api/clientes (ADMIN, FUNCIONARIO)
 * Lista os clientes com dados públicos do usuário (sem senhaHash) e veículos.
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
