/**
 * Tela de login. Depois de entrar, leva cada perfil para a sua página inicial
 * (ou para a página que a pessoa tentou abrir antes de fazer login).
 */
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, paginaInicial } from '../contexts/AuthContext';
import { Icon } from '../components/Icon';

export function Login() {
  const { usuario, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (usuario) return <Navigate to={paginaInicial(usuario.perfil)} replace />;

  async function enviar(e) {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      const logado = await login(email, senha);
      const destino = location.state?.de || paginaInicial(logado.perfil);
      navigate(destino, { replace: true });
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="pagina-centralizada">
      <form className="card formulario" onSubmit={enviar}>
        <div className="formulario__cabecalho">
          <Icon name="lock_open" size={40} />
          <h1>Entrar</h1>
          <p>Acesse sua conta para agendar e acompanhar seus serviços.</p>
        </div>

        {erro && (
          <div className="alerta alerta--erro">
            <Icon name="error" />
            {erro}
          </div>
        )}

        <label className="campo">
          <span>E-mail</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        </label>

        <label className="campo">
          <span>Senha</span>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        <button type="submit" className="botao botao--grande" disabled={enviando}>
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>

        <p className="formulario__rodape">
          Não tem conta? <Link to="/cadastro">Criar conta</Link>
        </p>
      </form>
    </div>
  );
}
