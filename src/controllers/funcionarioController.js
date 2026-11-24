const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
const { BCRYPT_ROUNDS } = require('../config/auth');
const HttpError = require('../utils/HttpError');
const { exigirCampos, validarEmail, validarSenha, parseId } = require('../utils/validacao');

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

/**
 * PATCH /api/funcionarios/:id (ADMIN) — altera cargo e/ou ativo.
 * Funcionário inativo deixa de receber novos agendamentos (FR04).
 */
async function atualizar(req, res) {
  const { cargo, ativo } = req.body ?? {};
  const dados = {};
  if (cargo !== undefined) {
    if (!String(cargo).trim()) throw new HttpError(400, 'cargo não pode ser vazio.');
    dados.cargo = String(cargo).trim();
  }
  if (ativo !== undefined) dados.ativo = Boolean(ativo);
  if (Object.keys(dados).length === 0) throw new HttpError(400, 'Nenhum campo para atualizar.');

  const funcionario = await prisma.funcionario.update({
    where: { id: parseId(req.params.id) },
    data: dados,
    select: funcionarioPublico
  });
  return res.json(funcionario);
}

module.exports = { criar, listar, atualizar };
