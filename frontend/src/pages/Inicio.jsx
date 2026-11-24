/**
 * Página inicial pública. Convida o visitante a criar a conta ou ver os serviços.
 * Quem já está logado é levado direto para a página do seu perfil.
 */
import { Link, Navigate } from 'react-router-dom';
import { useAuth, paginaInicial } from '../contexts/AuthContext';
import { Icon } from '../components/Icon';

const VANTAGENS = [
  { icone: 'calendar_add_on', titulo: 'Agende em poucos cliques', texto: 'Escolha o serviço, o dia e o horário livre.' },
  { icone: 'track_changes', titulo: 'Acompanhe em tempo real', texto: 'Saiba quando seu veículo foi recebido, está em serviço ou pronto.' },
  { icone: 'payments', titulo: 'Pague pela plataforma', texto: 'PIX ou cartão, com o resumo claro dos valores.' }
];

export function Inicio() {
  const { usuario } = useAuth();
  if (usuario) return <Navigate to={paginaInicial(usuario.perfil)} replace />;

  return (
    <div className="inicio">
      <section className="inicio__destaque">
        <Icon name="local_car_wash" filled size={64} />
        <h1>Seu carro limpo, sem fila e sem ligação</h1>
        <p>Agende a lavagem online e acompanhe cada etapa do serviço pelo celular.</p>
        <div className="inicio__acoes">
          <Link to="/cadastro" className="botao botao--grande">
            <Icon name="person_add" />
            Criar minha conta
          </Link>
          <Link to="/servicos" className="botao botao--grande botao--contorno">
            <Icon name="local_car_wash" />
            Ver serviços
          </Link>
        </div>
      </section>

      <section className="inicio__vantagens">
        {VANTAGENS.map((v) => (
          <div key={v.titulo} className="card inicio__vantagem">
            <Icon name={v.icone} size={36} />
            <h3>{v.titulo}</h3>
            <p>{v.texto}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
