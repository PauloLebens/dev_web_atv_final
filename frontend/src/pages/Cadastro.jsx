/**
 * Tela "Criar conta" (caso de uso 1, exceção 1a: "Não possui conta").
 * Cria um usuário CLIENTE pela API e já deixa logado.
 */
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth, paginaInicial } from '../contexts/AuthContext';
import { Icon } from '../components/Icon';

export function Cadastro() {
  const { usuario, registrar } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', senha: '', confirmarSenha: '' });
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Quem já está logado não precisa ver esta tela
  if (usuario) return <Navigate to={paginaInicial(usuario.perfil)} replace />;

  const alterar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  async function enviar(e) {
    e.preventDefault();
    setErro('');

    if (form.senha !== form.confirmarSenha) {
      setErro('As senhas não conferem.');
      return;
    }

    setEnviando(true);
    try {
      const { confirmarSenha, ...dados } = form;
      const novoUsuario = await registrar(dados);
      navigate(paginaInicial(novoUsuario.perfil), { replace: true });
    } catch (err) {
      setErro(err.status === 409 ? 'Já existe uma conta com este e-mail.' : err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="pagina-centralizada">
      <form className="card formulario" onSubmit={enviar}>
        <div className="formulario__cabecalho">
          <Icon name="person_add" size={40} />
          <h1>Criar conta</h1>
          <p>Cadastre-se para agendar a lavagem do seu veículo.</p>
        </div>

        {erro && (
          <div className="alerta alerta--erro">
            <Icon name="error" />
            {erro}
          </div>
        )}

        <label className="campo">
          <span>Nome completo</span>
          <input value={form.nome} onChange={alterar('nome')} autoComplete="name" required />
        </label>

        <label className="campo">
          <span>E-mail</span>
          <input type="email" value={form.email} onChange={alterar('email')} autoComplete="email" required />
        </label>

        <label className="campo">
          <span>Telefone (WhatsApp)</span>
          <input
            type="tel"
            value={form.telefone}
            onChange={alterar('telefone')}
            placeholder="(49) 99999-9999"
            autoComplete="tel"
            required
          />
        </label>

        <div className="campos-lado-a-lado">
          <label className="campo">
            <span>Senha</span>
            <input
              type="password"
              value={form.senha}
              onChange={alterar('senha')}
              minLength={6}
              autoComplete="new-password"
              required
            />
            <small>Mínimo de 6 caracteres</small>
          </label>

          <label className="campo">
            <span>Confirmar senha</span>
            <input
              type="password"
              value={form.confirmarSenha}
              onChange={alterar('confirmarSenha')}
              minLength={6}
              autoComplete="new-password"
              required
            />
          </label>
        </div>

        <button type="submit" className="botao botao--grande" disabled={enviando}>
          {enviando ? 'Criando conta...' : 'Criar conta'}
        </button>

        <p className="formulario__rodape">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </form>
    </div>
  );
}
