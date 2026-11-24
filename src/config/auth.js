const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET ausente ou muito curto (mínimo 32 caracteres). Defina no arquivo .env');
}

module.exports = {
  JWT_SECRET,
  JWT_EXPIRES_IN: '12h',
  BCRYPT_ROUNDS: 10
};
