const prisma = require('../config/prisma');
const HttpError = require('../utils/HttpError');
const { exigirCampos, parseId, parseNumero } = require('../utils/validacao');

const TIPOS = ['CARRO', 'MOTO', 'CAMINHAO'];

// Campos que só fazem sentido para cada tipo (Carro / Moto / Caminhão no diagrama de classes)
const CAMPOS_POR_TIPO = {
  CARRO: ['numeroPortas', 'tipoCombustivel'],
  MOTO: ['cilindradas'],
  CAMINHAO: ['capacidadeCarga', 'numeroEixos']
};
const TODOS_CAMPOS_ESPECIFICOS = Object.values(CAMPOS_POR_TIPO).flat();

/** "abc-1d23" -> "ABC1D23". Aceita placa antiga (ABC1234) e Mercosul (ABC1D23). */
function normalizarPlaca(placa) {
  const p = String(placa ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(p)) {
    throw new HttpError(400, 'Placa inválida. Use o formato ABC1234 ou ABC1D23.');
  }
  return p;
}

/** Monta os dados do veículo, zerando os campos que não pertencem ao tipo escolhido. */
function dadosVeiculo(body = {}, { parcial = false, tipoAtual } = {}) {
  const { modelo, marca, ano, tipo } = body;
  if (!parcial) exigirCampos({ modelo, marca, ano });

  const dados = {};
  if (modelo !== undefined) dados.modelo = String(modelo).trim();
  if (marca !== undefined) dados.marca = String(marca).trim();
  if (ano !== undefined) {
    dados.ano = parseNumero(ano, 'ano', { min: 1900, inteiro: true });
    if (dados.ano > new Date().getFullYear() + 1) throw new HttpError(400, 'ano inválido.');
  }
  if (tipo !== undefined && !TIPOS.includes(tipo)) {
    throw new HttpError(400, `tipo deve ser um de: ${TIPOS.join(', ')}.`);
  }

  const tipoFinal = tipo ?? tipoAtual ?? 'CARRO';
  dados.tipo = tipoFinal;

  const inteiros = ['numeroPortas', 'numeroEixos', 'cilindradas'];
  for (const campo of TODOS_CAMPOS_ESPECIFICOS) {
    const pertence = CAMPOS_POR_TIPO[tipoFinal].includes(campo);
    if (!pertence) {
      dados[campo] = null; // ex: moto não tem numeroPortas
    } else if (body[campo] !== undefined) {
      if (body[campo] === null || body[campo] === '') dados[campo] = null;
      else if (campo === 'tipoCombustivel') dados[campo] = String(body[campo]).trim();
      else dados[campo] = parseNumero(body[campo], campo, { min: 0, inteiro: inteiros.includes(campo) });
    }
  }
  return dados;
}

/** Id do cliente do usuário logado (perfil CLIENTE) */
async function clienteIdDoUsuario(userId) {
  const cliente = await prisma.cliente.findUnique({ where: { userId }, select: { id: true } });
  if (!cliente) throw new HttpError(403, 'Usuário não possui cadastro de cliente.');
  return cliente.id;
}

/** Busca o veículo e garante que o usuário pode mexer nele */
async function buscarComPermissao(placaParam, usuario) {
  const veiculo = await prisma.veiculo.findUnique({
    where: { placa: normalizarPlaca(placaParam) },
    include: { cliente: { select: { id: true, userId: true, user: { select: { nome: true } } } } }
  });
  if (!veiculo) throw new HttpError(404, 'Veículo não encontrado.');
  if (usuario.perfil === 'CLIENTE' && veiculo.cliente.userId !== usuario.id) {
    // 404 em vez de 403 para não revelar que a placa existe
    throw new HttpError(404, 'Veículo não encontrado.');
  }
  return veiculo;
}

/**
 * GET /api/veiculos
 * Cliente: só os seus. Admin/Funcionário: todos (filtro opcional ?clienteId=).
 */
async function listar(req, res) {
  const where = {};
  if (req.usuario.perfil === 'CLIENTE') {
    where.cliente = { userId: req.usuario.id };
  } else if (req.query.clienteId) {
    where.clienteId = parseId(req.query.clienteId, 'clienteId');
  }

  const veiculos = await prisma.veiculo.findMany({
    where,
    include: { cliente: { select: { id: true, user: { select: { nome: true } } } } },
    orderBy: { placa: 'asc' }
  });
  return res.json(veiculos);
}

/** GET /api/veiculos/:placa */
async function buscar(req, res) {
  return res.json(await buscarComPermissao(req.params.placa, req.usuario));
}

/**
 * POST /api/veiculos
 * Cliente cadastra para si. Admin informa o clienteId no body.
 */
async function criar(req, res) {
  const placa = normalizarPlaca(req.body?.placa);
  const clienteId =
    req.usuario.perfil === 'CLIENTE'
      ? await clienteIdDoUsuario(req.usuario.id)
      : parseId(req.body?.clienteId, 'clienteId');

  const veiculo = await prisma.veiculo.create({
    data: { placa, clienteId, ...dadosVeiculo(req.body) }
  });
  return res.status(201).json(veiculo);
}

/** PATCH /api/veiculos/:placa (dono ou admin). A placa não pode ser alterada. */
async function atualizar(req, res) {
  const atual = await buscarComPermissao(req.params.placa, req.usuario);
  const veiculo = await prisma.veiculo.update({
    where: { placa: atual.placa },
    data: dadosVeiculo(req.body, { parcial: true, tipoAtual: atual.tipo })
  });
  return res.json(veiculo);
}

/** DELETE /api/veiculos/:placa (dono ou admin). Bloqueado se houver agendamentos. */
async function remover(req, res) {
  const veiculo = await buscarComPermissao(req.params.placa, req.usuario);
  const agendamentos = await prisma.agendamento.count({ where: { veiculoPlaca: veiculo.placa } });
  if (agendamentos > 0) {
    throw new HttpError(409, 'Veículo possui agendamentos e não pode ser removido.');
  }
  await prisma.veiculo.delete({ where: { placa: veiculo.placa } });
  return res.status(204).end();
}

module.exports = { listar, buscar, criar, atualizar, remover, normalizarPlaca };
