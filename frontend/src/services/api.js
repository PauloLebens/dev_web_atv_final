/**
 * Comunicação com a API (backend).
 * Envia o token automaticamente e transforma respostas de erro em exceções
 * com a mensagem que a API devolveu.
 *
 *   const servicos = await api.get('/servicos');
 *   await api.post('/agendamentos', { veiculoPlaca, data, horario, servicoIds });
 */
const CHAVE_TOKEN = 'lavajato_token';

export const tokenStorage = {
  get: () => localStorage.getItem(CHAVE_TOKEN),
  set: (token) => localStorage.setItem(CHAVE_TOKEN, token),
  remove: () => localStorage.removeItem(CHAVE_TOKEN)
};

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function request(metodo, caminho, body) {
  const token = tokenStorage.get();
  const resposta = await fetch(`/api${caminho}`, {
    method: metodo,
    headers: {
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  const texto = await resposta.text();
  const dados = texto ? JSON.parse(texto) : null;

  if (!resposta.ok) {
    throw new ApiError(resposta.status, dados?.error || 'Erro ao comunicar com o servidor.');
  }
  return dados;
}

export const api = {
  get: (caminho) => request('GET', caminho),
  post: (caminho, body = {}) => request('POST', caminho, body),
  put: (caminho, body = {}) => request('PUT', caminho, body),
  patch: (caminho, body = {}) => request('PATCH', caminho, body),
  delete: (caminho) => request('DELETE', caminho)
};
