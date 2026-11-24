const express = require('express');
const prisma = require('../config/prisma');
const { autenticar, autorizar } = require('../middlewares/auth');

const router = express.Router();

/**
 * GET /api/agendamentos (ADMIN, FUNCIONARIO)
 * TODO (passo 3): criação com carrinho de serviços, bloqueio de horário (FR02),
 * alocação automática de funcionário (FR04) e atualização de status (FR06).
 */
router.get('/', autenticar, autorizar('ADMIN', 'FUNCIONARIO'), async (req, res) => {
  const agendamentos = await prisma.agendamento.findMany({
    include: {
      veiculo: true,
      itens: { include: { servico: true } },
      pagamento: true
    },
    orderBy: { datahora: 'asc' }
  });
  return res.json(agendamentos);
});

module.exports = router;
