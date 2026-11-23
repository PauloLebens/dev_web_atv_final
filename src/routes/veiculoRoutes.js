const express = require('express');
const prisma = require('../config/prisma');

const router = express.Router();

/**
 * Retorna todos os veiculos cadastrados.
 */
router.get('/', async (req, res) => {
  try {
    const veiculos = await prisma.veiculo.findMany();
    return res.json(veiculos);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;

