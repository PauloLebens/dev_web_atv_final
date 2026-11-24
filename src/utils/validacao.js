const HttpError = require('./HttpError');

/**
 * Lança 400 se algum campo estiver vazio.
 *   exigirCampos({ nome, email })
 */
function exigirCampos(campos) {
  const faltando = Object.entries(campos)
    .filter(([, valor]) => valor === undefined || valor === null || String(valor).trim() === '')
    .map(([nome]) => nome);

  if (faltando.length > 0) {
    throw new HttpError(400, `Campos obrigatórios: ${faltando.join(', ')}.`);
  }
}

function validarEmail(email) {
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    throw new HttpError(400, 'E-mail inválido.');
  }
}

function validarSenha(senha) {
  if (typeof senha !== 'string' || senha.length < 6) {
    throw new HttpError(400, 'A senha deve ter pelo menos 6 caracteres.');
  }
}

/** Converte para inteiro positivo ou lança 400. Uso: parseId(req.params.id) */
function parseId(valor, nome = 'id') {
  const n = Number(valor);
  if (!Number.isInteger(n) || n <= 0) {
    throw new HttpError(400, `${nome} inválido.`);
  }
  return n;
}

/** Número (aceita string "12.50") maior ou igual ao mínimo, ou lança 400. */
function parseNumero(valor, nome, { min = 0, inteiro = false } = {}) {
  const n = Number(valor);
  if (valor === '' || valor === null || Number.isNaN(n) || n < min || (inteiro && !Number.isInteger(n))) {
    throw new HttpError(400, `${nome} inválido.`);
  }
  return n;
}

/** Data no formato YYYY-MM-DD */
function validarData(data, nome = 'data') {
  if (typeof data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data) || Number.isNaN(Date.parse(`${data}T00:00:00Z`))) {
    throw new HttpError(400, `${nome} deve estar no formato AAAA-MM-DD.`);
  }
  return data;
}

/** Horário no formato HH:MM (00:00 a 23:59) */
function validarHorario(horario, nome = 'horario') {
  if (typeof horario !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(horario)) {
    throw new HttpError(400, `${nome} deve estar no formato HH:MM.`);
  }
  return horario;
}

module.exports = {
  exigirCampos,
  validarEmail,
  validarSenha,
  parseId,
  parseNumero,
  validarData,
  validarHorario
};
