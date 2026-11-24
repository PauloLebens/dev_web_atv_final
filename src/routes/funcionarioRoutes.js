const express = require('express');
const funcionarioController = require('../controllers/funcionarioController');
const { autenticar, autorizar } = require('../middlewares/auth');

const router = express.Router();

// Todas as rotas de funcionários são exclusivas do administrador
router.use(autenticar, autorizar('ADMIN'));

router.get('/', funcionarioController.listar);
router.post('/', funcionarioController.criar);

module.exports = router;
