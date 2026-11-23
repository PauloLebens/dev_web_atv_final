const express = require('express');
const jwt = require('jsonwebtoken');

const prisma = require('../config/prisma'); // Descomente se for buscar o usuário no banco

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    const user = await prisma.user.findUnique(
        {
        where: {
            email:email
        }
    }
    );

    if (!user) {
        return res.status(404).json({ error: 'Usuário não existe' });
    }

    const payload = {};

    const secret = process.env.JWT_SECRET;
    
    const token = jwt.sign(payload, secret, { 
      expiresIn: '12h' // O token expira em 1 hora (você pode alterar para '7d', etc.)
    });

    // 5. Retornar o token para o cliente
    return res.status(200).json({
      message: 'Autenticado com sucesso!',
      token: token
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;