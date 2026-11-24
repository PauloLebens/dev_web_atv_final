const express = require('express');
const authRoutes = require('./authRoutes');
const funcionarioRoutes = require('./funcionarioRoutes');
const clienteRoutes = require('./clienteRoutes');
const veiculoRoutes = require('./veiculoRoutes');
const agendamentoRoutes = require('./agendamentoRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

router.use('/auth', authRoutes);
router.use('/funcionarios', funcionarioRoutes);
router.use('/clientes', clienteRoutes);
router.use('/veiculos', veiculoRoutes);
router.use('/agendamentos', agendamentoRoutes);

module.exports = router;
