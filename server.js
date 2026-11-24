require('dotenv').config();

const express = require('express');
const path = require('path');
const apiRoutes = require('./src/routes');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', apiRoutes);

// Rota /api inexistente responde JSON (e não a página HTML)
app.use('/api', (req, res) => res.status(404).json({ error: 'Rota não encontrada.' }));

app.use(express.static(path.join(__dirname, 'public')));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
