const prisma = require('../config/prisma');
const HttpError = require('../utils/HttpError');
const { exigirCampos, parseId, parseNumero } = require('../utils/validacao');

/**
 * Monta os dados de um serviço a partir do body.
 * Em `parcial` (edição), só valida e devolve os campos enviados.
 */
function dadosServico(body = {}, { parcial = false } = {}) {
  const { nome, descricao, preco, duracaoMinutos, imagemUrl, ativo } = body;
  if (!parcial) exigirCampos({ nome, descricao, preco });

  const dados = {};
  if (nome !== undefined) {
    if (!String(nome).trim()) throw new HttpError(400, 'nome não pode ser vazio.');
    dados.nome = String(nome).trim();
  }
  if (descricao !== undefined) dados.descricao = String(descricao).trim();
  if (preco !== undefined) dados.preco = parseNumero(preco, 'preco', { min: 0 });
  if (duracaoMinutos !== undefined) {
    dados.duracaoMinutos = parseNumero(duracaoMinutos, 'duracaoMinutos', { min: 5, inteiro: true });
  }
  if (imagemUrl !== undefined) dados.imagemUrl = imagemUrl ? String(imagemUrl).trim() : null;
  if (ativo !== undefined) dados.ativo = Boolean(ativo);
  return dados;
}

/**
 * GET /api/servicos (público) — catálogo (RF01 / HU03).
 * Visitantes e clientes veem só os ativos; o admin vê todos.
 */
async function listar(req, res) {
  const ehAdmin = req.usuario?.perfil === 'ADMIN';
  const servicos = await prisma.servico.findMany({
    where: ehAdmin ? {} : { ativo: true },
    orderBy: { nome: 'asc' }
  });
  return res.json(servicos);
}

/** GET /api/servicos/:id (público) */
async function buscar(req, res) {
  const servico = await prisma.servico.findUnique({ where: { id: parseId(req.params.id) } });
  const ehAdmin = req.usuario?.perfil === 'ADMIN';
  if (!servico || (!servico.ativo && !ehAdmin)) {
    throw new HttpError(404, 'Serviço não encontrado.');
  }
  return res.json(servico);
}

/** POST /api/servicos (ADMIN) — HU01 */
async function criar(req, res) {
  const servico = await prisma.servico.create({ data: dadosServico(req.body) });
  return res.status(201).json(servico);
}

/** PATCH /api/servicos/:id (ADMIN) — edita só os campos enviados (HU01) */
async function atualizar(req, res) {
  const dados = dadosServico(req.body, { parcial: true });
  if (Object.keys(dados).length === 0) throw new HttpError(400, 'Nenhum campo para atualizar.');

  const servico = await prisma.servico.update({ where: { id: parseId(req.params.id) }, data: dados });
  return res.json(servico);
}

/**
 * DELETE /api/servicos/:id (ADMIN)
 * Não apaga de verdade: desativa, para preservar o histórico de agendamentos.
 * Para reativar: PATCH com { "ativo": true }.
 */
async function desativar(req, res) {
  await prisma.servico.update({ where: { id: parseId(req.params.id) }, data: { ativo: false } });
  return res.status(204).end();
}

module.exports = { listar, buscar, criar, atualizar, desativar };
