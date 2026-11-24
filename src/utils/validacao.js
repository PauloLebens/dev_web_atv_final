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

module.exports = { exigirCampos, validarEmail, validarSenha };
