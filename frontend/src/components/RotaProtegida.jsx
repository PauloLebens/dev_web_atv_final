/**
 * Protege páginas por perfil.
 *   <Route element={<RotaProtegida perfis={['ADMIN']} />}> ...páginas do admin... </Route>
 * - Não logado: vai para o login (e volta para a página depois de entrar).
 * - Logado com outro perfil: vai para a página inicial do próprio perfil.
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth, paginaInicial } from '../contexts/AuthContext';

export function RotaProtegida({ perfis }) {
  const { usuario } = useAuth();
  const location = useLocation();

  if (!usuario) return <Navigate to="/login" replace state={{ de: location.pathname }} />;
  if (perfis && !perfis.includes(usuario.perfil)) return <Navigate to={paginaInicial(usuario.perfil)} replace />;
  return <Outlet />;
}
