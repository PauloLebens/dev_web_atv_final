/**
 * Guarda quem está logado e disponibiliza para qualquer componente:
 *   const { usuario, login, logout } = useAuth();
 *   usuario?.perfil  ->  'ADMIN' | 'FUNCIONARIO' | 'CLIENTE' | undefined (visitante)
 *
 * O token fica no localStorage; ao recarregar a página, os dados do
 * usuário são buscados de novo em /api/auth/me.
 */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, tokenStorage } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // Ao abrir o sistema: se já existe token salvo, recupera o usuário
  useEffect(() => {
    if (!tokenStorage.get()) {
      setCarregando(false);
      return;
    }
    api
      .get('/auth/me')
      .then(setUsuario)
      .catch(() => tokenStorage.remove()) // token expirado ou inválido
      .finally(() => setCarregando(false));
  }, []);

  const entrar = useCallback(({ usuario: dados, token }) => {
    tokenStorage.set(token);
    setUsuario(dados);
    return dados;
  }, []);

  const login = useCallback(
    async (email, senha) => entrar(await api.post('/auth/login', { email, senha })),
    [entrar]
  );

  const registrar = useCallback(
    async (dados) => entrar(await api.post('/auth/registrar', dados)),
    [entrar]
  );

  const logout = useCallback(() => {
    tokenStorage.remove();
    setUsuario(null);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, registrar, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

/** Página inicial de cada perfil depois do login */
export function paginaInicial(perfil) {
  return { ADMIN: '/admin/agendamentos', FUNCIONARIO: '/tarefas', CLIENTE: '/agendar' }[perfil] || '/';
}
