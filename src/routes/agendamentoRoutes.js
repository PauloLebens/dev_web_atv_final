const express = require('express');
const prisma = require('../config/prisma');

const router = express.Router();

/**
 * Retorna todos os agendamentos cadastrados com seus relacionamentos.
 */
router.get('/', async (req, res) => {
  try {
    const agendamentos = await prisma.agendamento.findMany({
      include: {
        veiculo: true,
        servicos: true,
        pagamento: true
      }
    });
    return res.json(agendamentos);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Cria um novo agendamento no sistema.
 */
router.post('/', async (req, res) => {
  try {
    const { datahora, status, observacoes, veiculoPlaca, funcionarioId } = req.body;
    const novoAgendamento = await prisma.agendamento.create({
      data: {
        datahora: new Date(datahora),
        status,
        observacoes,
        veiculoPlaca,
        funcionarioId
      }
    });
    return res.status(201).json(novoAgendamento);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;

