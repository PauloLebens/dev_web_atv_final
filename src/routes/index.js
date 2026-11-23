
const express = require('express');
const agendamentoRoutes = require('./agendamentoRoutes');
const clienteRoutes = require('./clienteRoutes');
const veiculoRoutes = require('./veiculoRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

router.use('/agendamentos', agendamentoRoutes);
router.use('/clientes', clienteRoutes);
router.use('/veiculos', veiculoRoutes);

module.exports = router;

