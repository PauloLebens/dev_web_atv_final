const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_ROUNDS } = require('../config/auth');
const HttpError = require('../utils/HttpError');
const { exigirCampos, validarEmail, validarSenha } = require('../utils/validacao');

// Campos do usuário que podem ser devolvidos pela API (nunca o senhaHash)
const usuarioPublico = {
  id: true,
  nome: true,
  email: true,
  perfil: true,
  cliente: { select: { id: true, telefone: true } },
  funcionario: { select: { id: true, cargo: true, ativo: true } }
};

function gerarToken(usuario) {
  return jwt.sign({ perfil: usuario.perfil }, JWT_SECRET, {
    subject: String(usuario.id),
    expiresIn: JWT_EXPIRES_IN
  });
}

/**
 * POST /api/auth/registrar
 * Cadastro público: cria um usuário com perfil CLIENTE (Exceção 1a - "Não possui conta").
 */
async function registrar(req, res) {
  const { nome, email, senha, telefone } = req.body ?? {};
  exigirCampos({ nome, email, senha, telefone });
  validarEmail(email);
  validarSenha(senha);

  const usuario = await prisma.user.create({
    data: {
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      senhaHash: await bcrypt.hash(senha, BCRYPT_ROUNDS),
      perfil: 'CLIENTE',
      cliente: { create: { telefone: telefone.trim() } }
    },
    select: usuarioPublico
  });

  return res.status(201).json({ usuario, token: gerarToken(usuario) });
}

/**
 * POST /api/auth/login
 */
async function login(req, res) {
  const { email, senha } = req.body ?? {};
  exigirCampos({ email, senha });

  const usuario = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { ...usuarioPublico, senhaHash: true }
  });

  // Mesma mensagem para e-mail inexistente e senha errada (não revela quais e-mails existem)
  const senhaConfere = usuario && (await bcrypt.compare(senha, usuario.senhaHash));
  if (!senhaConfere) {
    throw new HttpError(401, 'E-mail ou senha incorretos.');
  }

  const { senhaHash, ...dados } = usuario;
  return res.json({ usuario: dados, token: gerarToken(dados) });
}

/**
 * GET /api/auth/me — dados do usuário logado
 */
async function me(req, res) {
  const usuario = await prisma.user.findUnique({
    where: { id: req.usuario.id },
    select: usuarioPublico
  });
  if (!usuario) throw new HttpError(404, 'Usuário não encontrado.');
  return res.json(usuario);
}

module.exports = { registrar, login, me, usuarioPublico };
