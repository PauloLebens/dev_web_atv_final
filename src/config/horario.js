/**
 * Datas e horários do estabelecimento.
 *
 * A agenda trabalha com data "AAAA-MM-DD" e horário "HH:MM" no horário de Brasília.
 * No banco, Agendamento.datahora é salvo em UTC (padrão do Postgres/Prisma).
 * O Brasil não tem horário de verão desde 2019, então o fuso fixo -03:00 é suficiente.
 */
const FUSO = process.env.FUSO_HORARIO || '-03:00';
const MINUTO = 60 * 1000;
const DIA = 24 * 60 * MINUTO;

/** "2026-12-01" + "09:00" -> Date (instante exato) */
function paraDataHora(data, horario) {
  return new Date(`${data}T${horario}:00${FUSO}`);
}

/** "2026-12-01" -> Date usado nas colunas @db.Date (Agenda.data) */
function paraDiaDb(data) {
  return new Date(`${data}T00:00:00Z`);
}

/** Date de coluna @db.Date -> "2026-12-01" */
function diaDbParaTexto(date) {
  return date.toISOString().slice(0, 10);
}

/** Intervalo [início, fim) do dia no fuso do estabelecimento */
function intervaloDoDia(data) {
  const inicio = paraDataHora(data, '00:00');
  return { inicio, fim: new Date(inicio.getTime() + DIA) };
}

module.exports = { FUSO, MINUTO, DIA, paraDataHora, paraDiaDb, diaDbParaTexto, intervaloDoDia };
