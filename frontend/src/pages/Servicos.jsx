/**
 * Catálogo de serviços (RF01 / HU03): público, busca os serviços ativos na API.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Icon } from '../components/Icon';

const formatarPreco = (valor) =>
  Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatarDuracao = (minutos) =>
  minutos < 60 ? `${minutos} min` : `${Math.floor(minutos / 60)}h${minutos % 60 ? ` ${minutos % 60}min` : ''}`;

export function Servicos() {
  const { usuario } = useAuth();
  const [servicos, setServicos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    api
      .get('/servicos')
      .then(setServicos)
      .catch((err) => setErro(err.message))
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div className="pagina">
      <div className="pagina__titulo">
        <Icon name="local_car_wash" size={32} />
        <h1>Nossos serviços</h1>
      </div>

      {carregando && <p className="texto-suave">Carregando serviços...</p>}
      {erro && (
        <div className="alerta alerta--erro">
          <Icon name="error" />
          {erro}
        </div>
      )}
      {!carregando && !erro && servicos.length === 0 && (
        <p className="texto-suave">Nenhum serviço disponível no momento.</p>
      )}

      <div className="grade-cards">
        {servicos.map((servico) => (
          <article key={servico.id} className="card servico">
            {servico.imagemUrl ? (
              <img src={servico.imagemUrl} alt={servico.nome} className="servico__imagem" />
            ) : (
              <div className="servico__imagem servico__imagem--vazia">
                <Icon name="local_car_wash" size={48} />
              </div>
            )}
            <div className="servico__corpo">
              <h3>{servico.nome}</h3>
              <p>{servico.descricao}</p>
              <div className="servico__rodape">
                <span className="servico__preco">{formatarPreco(servico.preco)}</span>
                <span className="texto-suave servico__duracao">
                  <Icon name="schedule" size={18} />
                  {formatarDuracao(servico.duracaoMinutos)}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {!usuario && servicos.length > 0 && (
        <div className="card chamada">
          <p>Gostou? Crie sua conta para agendar.</p>
          <Link to="/cadastro" className="botao">
            <Icon name="person_add" />
            Criar conta
          </Link>
        </div>
      )}
    </div>
  );
}
