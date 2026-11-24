const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/auth');
const HttpError = require('../utils/HttpError');

/**
 * Exige um token válido no header: Authorization: Bearer <token>
 * Preenche req.usuario = { id, perfil }.
 */
function autenticar(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');

  if (tipo !== 'Bearer' || !token) {
    throw new HttpError(401, 'Token não informado.');
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.usuario = { id: Number(payload.sub), perfil: payload.perfil };
    return next();
  } catch {
    throw new HttpError(401, 'Token inválido ou expirado.');
  }
}

/**
 * Restringe a rota aos perfis informados. Usar depois de autenticar.
 *   router.post('/', autenticar, autorizar('ADMIN'), controller.criar)
 */
function autorizar(...perfis) {
  return (req, res, next) => {
    if (!perfis.includes(req.usuario?.perfil)) {
      throw new HttpError(403, 'Acesso negado para o seu perfil.');
    }
    return next();
  };
}

module.exports = { autenticar, autorizar };
