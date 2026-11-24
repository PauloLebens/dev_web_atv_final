const prisma = require('../config/prisma');
const HttpError = require('../utils/HttpError');
const { validarData, validarHorario, parseNumero, parseId } = require('../utils/validacao');
const { paraDiaDb, diaDbParaTexto, intervaloDoDia, DIA } = require('../config/horario');
const { horariosDisponiveis, STATUS_QUE_LIBERAM } = require('../services/disponibilidadeService');

function formatarDia(agenda) {
  return { data: diaDbParaTexto(agenda.data), horarios: agenda.horariosDisponiveis };
}

/** Valida, remove repetidos e ordena a lista de horários */
function normalizarHorarios(horarios) {
  if (!Array.isArray(horarios) || horarios.length === 0) {
    throw new HttpError(400, 'horarios deve ser uma lista não vazia, ex: ["08:00", "08:30"].');
  }
  horarios.forEach((h) => validarHorario(h, 'Cada horário'));
  return [...new Set(horarios)].sort();
}

/**
 * GET /api/agenda?de=AAAA-MM-DD&ate=AAAA-MM-DD (público)
 * Dias abertos no período (padrão: de hoje até 30 dias).
 */
async function listar(req, res) {
  const hoje = new Date().toISOString().slice(0, 10);
  const de = req.query.de ? validarData(req.query.de, 'de') : hoje;
  const ate = req.query.ate
    ? validarData(req.query.ate, 'ate')
    : new Date(Date.now() + 30 * DIA).toISOString().slice(0, 10);

  const dias = await prisma.agenda.findMany({
    where: { data: { gte: paraDiaDb(de), lte: paraDiaDb(ate) } },
    orderBy: { data: 'asc' }
  });
  return res.json(dias.map(formatarDia));
}

/**
 * GET /api/agenda/:data/disponiveis?servicoIds=1,2 (público)
 * Horários livres do dia para a duração somada dos serviços escolhidos.
 * Alternativa: ?duracao=60 (minutos). Sem nenhum dos dois, usa 30 min.
 */
async function disponiveis(req, res) {
  const data = validarData(req.params.data);
  let duracao = 30;

  if (req.query.servicoIds) {
    const ids = [...new Set(String(req.query.servicoIds).split(',').map((id) => parseId(id, 'servicoIds')))];
    const servicos = await prisma.servico.findMany({ where: { id: { in: ids }, ativo: true } });
    if (servicos.length !== ids.length) throw new HttpError(400, 'Algum serviço não existe ou está inativo.');
    duracao = servicos.reduce((soma, s) => soma + s.duracaoMinutos, 0);
  } else if (req.query.duracao) {
    duracao = parseNumero(req.query.duracao, 'duracao', { min: 5, inteiro: true });
  }

  const horarios = await horariosDisponiveis(prisma, data, duracao);
  return res.json({ data, duracaoMinutos: duracao, horarios });
}

/**
 * PUT /api/agenda/:data (ADMIN) — abre o dia ou substitui os horários.
 * Body: { "horarios": ["08:00", "09:00", ...] }
 */
async function definirDia(req, res) {
  const data = validarData(req.params.data);
  const horarios = normalizarHorarios(req.body?.horarios);

  const agenda = await prisma.agenda.upsert({
    where: { data: paraDiaDb(data) },
    update: { horariosDisponiveis: horarios },
    create: { data: paraDiaDb(data), horariosDisponiveis: horarios }
  });
  return res.json(formatarDia(agenda));
}

/**
 * POST /api/agenda/lote (ADMIN) — abre vários dias de uma vez.
 * Body: { "de": "2026-12-01", "ate": "2026-12-31", "horarios": [...], "diasSemana": [1,2,3,4,5,6] }
 * diasSemana: 0 = domingo ... 6 = sábado (padrão: segunda a sábado).
 * Dias que já existem têm os horários substituídos.
 */
async function definirLote(req, res) {
  const { de, ate, diasSemana = [1, 2, 3, 4, 5, 6] } = req.body ?? {};
  validarData(de, 'de');
  validarData(ate, 'ate');
  const horarios = normalizarHorarios(req.body?.horarios);

  if (!Array.isArray(diasSemana) || diasSemana.some((d) => ![0, 1, 2, 3, 4, 5, 6].includes(d))) {
    throw new HttpError(400, 'diasSemana deve ser uma lista com números de 0 (domingo) a 6 (sábado).');
  }

  const inicio = paraDiaDb(de);
  const fim = paraDiaDb(ate);
  if (fim < inicio) throw new HttpError(400, '"ate" deve ser depois de "de".');
  if ((fim - inicio) / DIA > 366) throw new HttpError(400, 'Período máximo de 1 ano.');

  const datas = [];
  for (let d = inicio; d <= fim; d = new Date(d.getTime() + DIA)) {
    if (diasSemana.includes(d.getUTCDay())) datas.push(d);
  }

  await prisma.$transaction(
    datas.map((data) =>
      prisma.agenda.upsert({
        where: { data },
        update: { horariosDisponiveis: horarios },
        create: { data, horariosDisponiveis: horarios }
      })
    )
  );

  return res.json({ diasAbertos: datas.length, datas: datas.map(diaDbParaTexto), horarios });
}

/** DELETE /api/agenda/:data (ADMIN) — fecha o dia, se não houver agendamentos ativos nele */
async function removerDia(req, res) {
  const data = validarData(req.params.data);
  const { inicio, fim } = intervaloDoDia(data);

  const ativos = await prisma.agendamento.count({
    where: { datahora: { gte: inicio, lt: fim }, status: { notIn: STATUS_QUE_LIBERAM } }
  });
  if (ativos > 0) {
    throw new HttpError(409, `Existem ${ativos} agendamento(s) ativos neste dia. Cancele-os antes de fechar a agenda.`);
  }

  await prisma.agenda.delete({ where: { data: paraDiaDb(data) } });
  return res.status(204).end();
}

module.exports = { listar, disponiveis, definirDia, definirLote, removerDia };
