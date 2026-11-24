/**
 * Regras de disponibilidade da agenda (FR02) e alocação de funcionários (FR04).
 *
 * Um horário está disponível quando existe pelo menos um funcionário ativo
 * sem nenhum agendamento que se sobreponha ao intervalo [início, início + duração).
 *
 * Todas as funções recebem `db`, que pode ser o prisma normal ou o `tx` de uma
 * transação. Assim a mesma regra é usada para consultar e para reservar.
 */
const { MINUTO, DIA, paraDataHora, paraDiaDb, intervaloDoDia } = require('../config/horario');

// Agendamentos nesses status não ocupam mais o horário
const STATUS_QUE_LIBERAM = ['CANCELADO'];

function fimDe(agendamento) {
  return new Date(agendamento.datahora.getTime() + agendamento.duracaoTotalMinutos * MINUTO);
}

function sobrepoe(inicioA, fimA, inicioB, fimB) {
  return inicioA < fimB && inicioB < fimA;
}

/**
 * Carrega tudo o que é preciso para calcular a disponibilidade de um dia.
 * Busca também o dia anterior para pegar serviços longos que atravessam a meia-noite.
 */
async function carregarDia(db, data) {
  const { inicio, fim } = intervaloDoDia(data);

  const [agenda, funcionarios, agendamentos] = await Promise.all([
    db.agenda.findUnique({ where: { data: paraDiaDb(data) } }),
    db.funcionario.findMany({ where: { ativo: true }, select: { id: true }, orderBy: { id: 'asc' } }),
    db.agendamento.findMany({
      where: {
        status: { notIn: STATUS_QUE_LIBERAM },
        datahora: { gte: new Date(inicio.getTime() - DIA), lt: fim }
      },
      select: { id: true, datahora: true, duracaoTotalMinutos: true, funcionarioId: true, veiculoPlaca: true }
    })
  ]);

  return { data, agenda, funcionarios, agendamentos };
}

/** Funcionários ativos sem conflito no intervalo pedido */
function funcionariosLivres(dia, inicio, duracaoMinutos) {
  const fim = new Date(inicio.getTime() + duracaoMinutos * MINUTO);
  return dia.funcionarios.filter(
    (f) =>
      !dia.agendamentos.some(
        (a) => a.funcionarioId === f.id && sobrepoe(inicio, fim, a.datahora, fimDe(a))
      )
  );
}

/**
 * Escolhe o funcionário livre com menos agendamentos no dia
 * (distribui as tarefas entre a equipe). Retorna null se ninguém estiver livre.
 */
function escolherFuncionario(dia, inicio, duracaoMinutos) {
  const livres = funcionariosLivres(dia, inicio, duracaoMinutos);
  if (livres.length === 0) return null;

  const carga = (id) => dia.agendamentos.filter((a) => a.funcionarioId === id).length;
  livres.sort((a, b) => carga(a.id) - carga(b.id) || a.id - b.id);
  return livres[0];
}

/** O mesmo veículo não pode estar em dois agendamentos ao mesmo tempo */
function veiculoOcupado(dia, placa, inicio, duracaoMinutos) {
  const fim = new Date(inicio.getTime() + duracaoMinutos * MINUTO);
  return dia.agendamentos.some(
    (a) => a.veiculoPlaca === placa && sobrepoe(inicio, fim, a.datahora, fimDe(a))
  );
}

/**
 * Lista os horários livres de um dia para uma duração de serviço.
 * Retorna [] se o dia não estiver aberto na agenda.
 */
async function horariosDisponiveis(db, data, duracaoMinutos) {
  const dia = await carregarDia(db, data);
  if (!dia.agenda) return [];

  const agora = new Date();
  return dia.agenda.horariosDisponiveis.filter((horario) => {
    const inicio = paraDataHora(data, horario);
    return inicio > agora && funcionariosLivres(dia, inicio, duracaoMinutos).length > 0;
  });
}

module.exports = {
  STATUS_QUE_LIBERAM,
  carregarDia,
  escolherFuncionario,
  veiculoOcupado,
  horariosDisponiveis
};
