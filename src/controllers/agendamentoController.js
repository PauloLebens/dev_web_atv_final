const { Prisma } = require('@prisma/client');
const prisma = require('../config/prisma');
const HttpError = require('../utils/HttpError');
const { exigirCampos, parseId, validarData, validarHorario } = require('../utils/validacao');
const { paraDataHora, intervaloDoDia } = require('../config/horario');
const { normalizarPlaca } = require('./veiculoController');
const disponibilidade = require('../services/disponibilidadeService');

// Ordem do rastreamento (FR05): cada clique do funcionário avança uma etapa (FR06)
const FLUXO_STATUS = ['AGENDADO', 'VEICULO_RECEBIDO', 'EM_AGUARDO', 'EM_SERVICO', 'FINALIZADO'];
const STATUS_FINAIS = ['FINALIZADO', 'CANCELADO'];

// O que é devolvido em cada agendamento (sem dados sensíveis)
const detalhes = {
  veiculo: {
    select: {
      placa: true,
      modelo: true,
      marca: true,
      tipo: true,
      cliente: { select: { id: true, userId: true, telefone: true, user: { select: { nome: true } } } }
    }
  },
  funcionario: { select: { id: true, userId: true, cargo: true, user: { select: { nome: true } } } },
  itens: { select: { precoCobrado: true, servico: { select: { id: true, nome: true, duracaoMinutos: true } } } },
  pagamento: { select: { id: true, valor: true, metodo: true, status: true, data: true } }
};

/**
 * Em transações SERIALIZABLE, quando dois pedidos chegam juntos o banco recusa um deles
 * por conflito (P2034), mesmo que ainda houvesse vaga para os dois. Repetir a transação
 * resolve: na nova tentativa ela enxerga a reserva do outro e decide corretamente
 * (cria, se ainda houver funcionário livre; ou 409 "Horário indisponível").
 */
async function comRetentativa(operacao, tentativas = 5) {
  for (let i = 1; ; i++) {
    try {
      return await operacao();
    } catch (err) {
      const conflito = err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2034';
      if (!conflito || i >= tentativas) throw err;
      await new Promise((r) => setTimeout(r, 20 * i + Math.random() * 30)); // espera curta e aleatória
    }
  }
}

/** Garante que o usuário pode ver/alterar o agendamento */
function verificarAcesso(agendamento, usuario) {
  const permitido =
    usuario.perfil === 'ADMIN' ||
    (usuario.perfil === 'CLIENTE' && agendamento.veiculo.cliente.userId === usuario.id) ||
    (usuario.perfil === 'FUNCIONARIO' && agendamento.funcionario?.userId === usuario.id);

  // 404 para não revelar agendamentos de outras pessoas
  if (!permitido) throw new HttpError(404, 'Agendamento não encontrado.');
}

async function buscarComAcesso(id, usuario) {
  const agendamento = await prisma.agendamento.findUnique({ where: { id }, include: detalhes });
  if (!agendamento) throw new HttpError(404, 'Agendamento não encontrado.');
  verificarAcesso(agendamento, usuario);
  return agendamento;
}

/**
 * GET /api/agendamentos
 * Cliente: os seus. Funcionário: os atribuídos a ele (lista de tarefas - HU05). Admin: todos.
 * Filtros: ?data=AAAA-MM-DD  ?status=EM_SERVICO
 */
async function listar(req, res) {
  const { perfil, id: userId } = req.usuario;
  const where = {};

  if (perfil === 'CLIENTE') where.veiculo = { cliente: { userId } };
  if (perfil === 'FUNCIONARIO') where.funcionario = { userId };

  if (req.query.data) {
    const { inicio, fim } = intervaloDoDia(validarData(req.query.data));
    where.datahora = { gte: inicio, lt: fim };
  }
  if (req.query.status) {
    if (![...FLUXO_STATUS, 'CANCELADO'].includes(req.query.status)) throw new HttpError(400, 'status inválido.');
    where.status = req.query.status;
  }

  const agendamentos = await prisma.agendamento.findMany({
    where,
    include: detalhes,
    orderBy: { datahora: perfil === 'CLIENTE' ? 'desc' : 'asc' }
  });
  return res.json(agendamentos);
}

/** GET /api/agendamentos/:id — acompanhamento do status (HU06) */
async function buscar(req, res) {
  return res.json(await buscarComAcesso(parseId(req.params.id), req.usuario));
}

/**
 * POST /api/agendamentos (CLIENTE ou ADMIN) — auto agendamento (RF01 / HU04)
 * Body: { "veiculoPlaca": "ABC1D23", "data": "2026-12-01", "horario": "09:00",
 *         "servicoIds": [1, 2], "observacoes": "opcional" }
 *
 * Tudo roda numa transação SERIALIZABLE: se dois clientes tentarem o último
 * horário livre ao mesmo tempo, só um consegue (FR02 / RNF06).
 */
async function criar(req, res) {
  const { veiculoPlaca, data, horario, servicoIds, observacoes } = req.body ?? {};
  exigirCampos({ veiculoPlaca, data, horario });
  validarData(data);
  validarHorario(horario);
  if (!Array.isArray(servicoIds) || servicoIds.length === 0) {
    throw new HttpError(400, 'servicoIds deve ser uma lista com pelo menos um serviço.');
  }
  const ids = [...new Set(servicoIds.map((id) => parseId(id, 'servicoIds')))];
  const placa = normalizarPlaca(veiculoPlaca);
  const inicio = paraDataHora(data, horario);

  if (inicio <= new Date()) throw new HttpError(400, 'Não é possível agendar no passado.');

  const criado = await comRetentativa(() => prisma.$transaction(
    async (tx) => {
      // 1. Veículo existe e (se cliente) é dele
      const veiculo = await tx.veiculo.findUnique({
        where: { placa },
        select: { placa: true, cliente: { select: { userId: true } } }
      });
      if (!veiculo || (req.usuario.perfil === 'CLIENTE' && veiculo.cliente.userId !== req.usuario.id)) {
        throw new HttpError(404, 'Veículo não encontrado.');
      }

      // 2. Serviços do carrinho (ativos) e totais
      const servicos = await tx.servico.findMany({ where: { id: { in: ids }, ativo: true } });
      if (servicos.length !== ids.length) throw new HttpError(400, 'Algum serviço não existe ou está inativo.');

      const duracaoTotalMinutos = servicos.reduce((soma, s) => soma + s.duracaoMinutos, 0);
      const valorTotal = servicos.reduce((soma, s) => soma.plus(s.preco), new Prisma.Decimal(0));

      // 3. Dia aberto e horário existente na agenda
      const dia = await disponibilidade.carregarDia(tx, data);
      if (!dia.agenda || !dia.agenda.horariosDisponiveis.includes(horario)) {
        throw new HttpError(409, 'Horário fora da agenda do estabelecimento.');
      }

      // 4. Veículo livre e funcionário livre (FR02 + FR04)
      if (disponibilidade.veiculoOcupado(dia, placa, inicio, duracaoTotalMinutos)) {
        throw new HttpError(409, 'Este veículo já tem um agendamento nesse horário.');
      }
      const funcionario = disponibilidade.escolherFuncionario(dia, inicio, duracaoTotalMinutos);
      if (!funcionario) throw new HttpError(409, 'Horário indisponível. Escolha outro horário.');

      // 5. Cria o agendamento com o "carrinho" e os preços congelados
      return tx.agendamento.create({
        data: {
          datahora: inicio,
          observacoes: observacoes ? String(observacoes).trim() : null,
          valorTotal,
          duracaoTotalMinutos,
          veiculoPlaca: placa,
          funcionarioId: funcionario.id,
          itens: { create: servicos.map((s) => ({ servicoId: s.id, precoCobrado: s.preco })) }
        },
        include: detalhes
      });
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  ));

  return res.status(201).json(criado);
}

/** Aplica a troca de status, validando quem pode fazer o quê */
async function mudarStatus(agendamento, novoStatus, usuario) {
  if (STATUS_FINAIS.includes(agendamento.status) && usuario.perfil !== 'ADMIN') {
    throw new HttpError(409, `Agendamento já está ${agendamento.status}.`);
  }
  if (agendamento.status === 'CANCELADO') {
    throw new HttpError(409, 'Agendamento cancelado não pode mudar de status.');
  }

  return prisma.agendamento.update({
    where: { id: agendamento.id },
    data: { status: novoStatus },
    include: detalhes
  });
}

/**
 * POST /api/agendamentos/:id/avancar (FUNCIONARIO responsável ou ADMIN)
 * O "um clique" do FR06: leva o status para a próxima etapa do fluxo.
 */
async function avancarStatus(req, res) {
  const agendamento = await buscarComAcesso(parseId(req.params.id), req.usuario);
  const posicao = FLUXO_STATUS.indexOf(agendamento.status);

  if (posicao === -1 || posicao === FLUXO_STATUS.length - 1) {
    throw new HttpError(409, `Agendamento já está ${agendamento.status}.`);
  }
  return res.json(await mudarStatus(agendamento, FLUXO_STATUS[posicao + 1], req.usuario));
}

/**
 * PATCH /api/agendamentos/:id/status (FUNCIONARIO responsável ou ADMIN)
 * Body: { "status": "EM_SERVICO" } — para pular etapas ou corrigir um clique errado.
 */
async function definirStatus(req, res) {
  const { status } = req.body ?? {};
  if (!FLUXO_STATUS.includes(status)) {
    throw new HttpError(400, `status deve ser um de: ${FLUXO_STATUS.join(', ')}. Para cancelar use /cancelar.`);
  }
  const agendamento = await buscarComAcesso(parseId(req.params.id), req.usuario);
  return res.json(await mudarStatus(agendamento, status, req.usuario));
}

/**
 * POST /api/agendamentos/:id/cancelar (CLIENTE dono ou ADMIN)
 * O cliente só cancela antes do veículo ser recebido e antes do horário.
 * Cancelar libera o horário na agenda.
 */
async function cancelar(req, res) {
  const agendamento = await buscarComAcesso(parseId(req.params.id), req.usuario);

  if (STATUS_FINAIS.includes(agendamento.status)) {
    throw new HttpError(409, `Agendamento já está ${agendamento.status}.`);
  }
  if (req.usuario.perfil === 'CLIENTE') {
    if (agendamento.status !== 'AGENDADO' || agendamento.datahora <= new Date()) {
      throw new HttpError(409, 'Não é mais possível cancelar. Entre em contato com o estabelecimento.');
    }
  }

  const cancelado = await prisma.agendamento.update({
    where: { id: agendamento.id },
    data: { status: 'CANCELADO' },
    include: detalhes
  });
  return res.json(cancelado);
}

module.exports = { listar, buscar, criar, avancarStatus, definirStatus, cancelar };
