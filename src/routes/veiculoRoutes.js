const express = require('express');
const prisma = require('../config/prisma');
const { autenticar, autorizar } = require('../middlewares/auth');

const router = express.Router();

/**
 * GET /api/veiculos (ADMIN, FUNCIONARIO)
 * TODO (passo 3): CRUD completo, com o cliente vendo só os próprios veículos.
 */
router.get('/', autenticar, autorizar('ADMIN', 'FUNCIONARIO'), async (req, res) => {
  const veiculos = await prisma.veiculo.findMany({ orderBy: { placa: 'asc' } });
  return res.json(veiculos);
});

module.exports = router;
