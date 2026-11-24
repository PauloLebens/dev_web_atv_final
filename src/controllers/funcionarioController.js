const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
const { BCRYPT_ROUNDS } = require('../config/auth');
const { exigirCampos, validarEmail, validarSenha } = require('../utils/validacao');

const funcionarioPublico = {
  id: true,
  cargo: true,
  ativo: true,
  user: { select: { id: true, nome: true, email: true } }
};

/**
 * POST /api/funcionarios (ADMIN) — cadastra um funcionário com login próprio.
 */
async function criar(req, res) {
  const { nome, email, senha, cargo } = req.body ?? {};
  exigirCampos({ nome, email, senha, cargo });
  validarEmail(email);
  validarSenha(senha);

  const funcionario = await prisma.funcionario.create({
    data: {
      cargo: cargo.trim(),
      user: {
        create: {
          nome: nome.trim(),
          email: email.trim().toLowerCase(),
          senhaHash: await bcrypt.hash(senha, BCRYPT_ROUNDS),
          perfil: 'FUNCIONARIO'
        }
      }
    },
    select: funcionarioPublico
  });

  return res.status(201).json(funcionario);
}

/**
 * GET /api/funcionarios (ADMIN)
 */
async function listar(req, res) {
  const funcionarios = await prisma.funcionario.findMany({
    select: funcionarioPublico,
    orderBy: { id: 'asc' }
  });
  return res.json(funcionarios);
}

module.exports = { criar, listar };
