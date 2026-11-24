/**
 * Mapa de páginas do sistema.
 * Cada grupo de rotas protegidas só abre para os perfis indicados.
 * Páginas com <EmConstrucao> ainda precisam ser feitas.
 */
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { RotaProtegida } from './components/RotaProtegida';
import { Inicio } from './pages/Inicio';
import { Login } from './pages/Login';
import { Cadastro } from './pages/Cadastro';
import { Servicos } from './pages/Servicos';
import { EmConstrucao } from './pages/EmConstrucao';
import './App.css';

/** Estrutura comum: navbar em cima, página embaixo */
function Layout() {
  return (
    <div className="app">
      <Navbar />
      <main className="app__conteudo">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  const { carregando } = useAuth();

  // Enquanto confere se já havia alguém logado, evita "piscar" a tela de login
  if (carregando) return <div className="carregando-tela">Carregando...</div>;

  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Públicas */}
        <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/servicos" element={<Servicos />} />

        {/* Cliente */}
        <Route element={<RotaProtegida perfis={['CLIENTE']} />}>
          <Route path="/agendar" element={<EmConstrucao titulo="Agendar" icone="calendar_add_on" />} />
          <Route path="/meus-agendamentos" element={<EmConstrucao titulo="Meus agendamentos" icone="event_note" />} />
          <Route path="/meus-veiculos" element={<EmConstrucao titulo="Meus veículos" icone="directions_car" />} />
        </Route>

        {/* Funcionário */}
        <Route element={<RotaProtegida perfis={['FUNCIONARIO']} />}>
          <Route path="/tarefas" element={<EmConstrucao titulo="Minhas tarefas" icone="checklist" />} />
        </Route>

        {/* Administrador */}
        <Route element={<RotaProtegida perfis={['ADMIN']} />}>
          <Route path="/admin/agendamentos" element={<EmConstrucao titulo="Agendamentos" icone="event_note" />} />
          <Route path="/admin/servicos" element={<EmConstrucao titulo="Gerenciar serviços" icone="local_car_wash" />} />
          <Route path="/admin/agenda" element={<EmConstrucao titulo="Agenda" icone="calendar_month" />} />
          <Route path="/admin/funcionarios" element={<EmConstrucao titulo="Funcionários" icone="badge" />} />
          <Route path="/admin/relatorios" element={<EmConstrucao titulo="Relatórios" icone="monitoring" />} />
        </Route>

        {/* Endereço que não existe: volta para o início */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
