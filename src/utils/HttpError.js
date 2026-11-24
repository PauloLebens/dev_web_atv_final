/**
 * Erro com status HTTP. Lançar em qualquer controller/middleware:
 *   throw new HttpError(404, 'Serviço não encontrado');
 * O errorHandler transforma em resposta JSON.
 */
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

module.exports = HttpError;
