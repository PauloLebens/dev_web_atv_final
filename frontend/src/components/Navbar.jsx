/**
 * Barra de navegação. Os itens mudam conforme o perfil de quem está logado:
 * - Visitante: catálogo, entrar e criar conta
 * - CLIENTE: catálogo, agendar, meus agendamentos, meus veículos
 * - FUNCIONARIO: minhas tarefas
 * - ADMIN: agendamentos, serviços, agenda, funcionários, relatórios
 * No celular, os itens ficam num menu que abre pelo botão ☰.
 */
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Icon } from './Icon';
import './Navbar.css';

const MENUS = {
  VISITANTE: [],
  CLIENTE: [
    { para: '/agendar', icone: 'calendar_add_on', texto: 'Agendar' },
    { para: '/meus-agendamentos', icone: 'event_note', texto: 'Meus agendamentos' },
    { para: '/meus-veiculos', icone: 'directions_car', texto: 'Meus veículos' }
  ],
  FUNCIONARIO: [{ para: '/tarefas', icone: 'checklist', texto: 'Minhas tarefas' }],
  ADMIN: [
    { para: '/admin/agendamentos', icone: 'event_note', texto: 'Agendamentos' },
    { para: '/admin/servicos', icone: 'local_car_wash', texto: 'Serviços' },
    { para: '/admin/agenda', icone: 'calendar_month', texto: 'Agenda' },
    { para: '/admin/funcionarios', icone: 'badge', texto: 'Funcionários' },
    { para: '/admin/relatorios', icone: 'monitoring', texto: 'Relatórios' }
  ]
};

const NOME_PERFIL = { ADMIN: 'Administrador', FUNCIONARIO: 'Funcionário', CLIENTE: 'Cliente' };

export function Navbar() {
  const { usuario, logout } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Fecha o menu do celular ao trocar de página
  useEffect(() => setMenuAberto(false), [pathname]);

  const itens = MENUS[usuario?.perfil ?? 'VISITANTE'];

  function sair() {
    logout();
    navigate('/');
  }

  return (
    <header className="navbar">
      <div className="navbar__conteudo">
        <Link to="/" className="navbar__marca">
          <Icon name="local_car_wash" filled size={28} />
          <span>Lava-Jato</span>
        </Link>

        <button
          className="navbar__hamburguer"
          onClick={() => setMenuAberto((aberto) => !aberto)}
          aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuAberto}
        >
          <Icon name={menuAberto ? 'close' : 'menu'} />
        </button>

        <nav className={`navbar__menu ${menuAberto ? 'navbar__menu--aberto' : ''}`}>
          <ul className="navbar__links">
            {itens.map((item) => (
              <li key={item.para}>
                <NavLink to={item.para} className="navbar__link">
                  <Icon name={item.icone} />
                  {item.texto}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="navbar__usuario">
            {usuario ? (
              <>
                <div className="navbar__perfil">
                  <Icon name="account_circle" size={32} />
                  <div>
                    <strong>{usuario.nome.split(' ')[0]}</strong>
                    <small>{NOME_PERFIL[usuario.perfil]}</small>
                  </div>
                </div>
                <button className="navbar__botao navbar__botao--secundario" onClick={sair}>
                  <Icon name="logout" />
                  Sair
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="navbar__botao navbar__botao--secundario">
                  <Icon name="login" />
                  Entrar
                </NavLink>
                <NavLink to="/cadastro" className="navbar__botao">
                  <Icon name="person_add" />
                  Criar conta
                </NavLink>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
