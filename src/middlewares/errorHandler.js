const { Prisma } = require('@prisma/client');
const HttpError = require('../utils/HttpError');

/**
 * Tratamento central de erros. O Express 5 já encaminha para cá
 * qualquer erro lançado (inclusive em funções async).
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }

  // JSON mal formado no corpo da requisição
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido.' });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Registro já existe.', campos: err.meta?.target });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Registro não encontrado.' });
    }
    if (err.code === 'P2003') {
      return res.status(400).json({ error: 'Referência inválida (registro relacionado não existe).' });
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({ error: 'Dados inválidos.' });
  }

  // Erro inesperado: registra no log, mas não expõe detalhes ao cliente
  console.error(err);
  return res.status(500).json({ error: 'Erro interno do servidor.' });
}

module.exports = errorHandler;
