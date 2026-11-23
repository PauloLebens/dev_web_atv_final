const express = require('express');
const prisma = require('../config/prisma');

const router = express.Router();

/**
 * Retorna todos os clientes cadastrados com usuario e veiculos.
 */
router.get('/', async (req, res) => {
  try {
    const clientes = await prisma.cliente.findMany({
      include: {
        user: true,
        veiculos: true
      }
    });
    return res.json(clientes);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;

