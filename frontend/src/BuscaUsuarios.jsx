// ==========================================
// IMPORTAÇÕES (React)
// ==========================================
import { useState, useEffect } from 'react';
import './BuscaUsuarios.css';

export function BuscaUsuarios() {

  // ==========================================
  // MÚLTIPLOS ESTADOS PARA CONTROLE DE FLUXO (React)
  // ==========================================
  const [usuarios, setUsuarios] = useState([]);       // Armazena os dados vindos da API
  const [carregando, setCarregando] = useState(true); // Controla se a aplicação está a carregar dados
  const [erro, setErro] = useState(null);             // Armazena mensagens de erro caso a requisição falhe
  const [termoBusca, setTermoBusca] = useState('');   // Armazena o que o utilizador digita no campo de pesquisa

  // ==========================================
  // REQUISIÇÕES ASSÍNCRONAS COM useEffect (JS + React)
  // ==========================================
  useEffect(() => {
    // ATENÇÃO (Conceito JS/React): A função passada para o 'useEffect' NÃO PODE ser 'async' diretamente.
    // Por isso, a boa prática em JavaScript é criar uma função interna assíncrona (como a 'buscarDados') 
    // e executá-la logo em seguida dentro do próprio efeito.
    const buscarDados = async () => {
      try {
        // Antes de buscar, ativamos o estado de carregamento
        setCarregando(true);
        setErro(null);

        // 'fetch()' é uma Web API nativa do JavaScript para fazer requisições HTTP (AJAX/REST).
        // A palavra-chave 'await' pausa a execução da função até que a resposta da rede chegue.
        // Usamos uma API pública gratuita de teste chamada JSONPlaceholder.
        const resposta = await fetch('https://jsonplaceholder.typicode.com/users');

        // O 'fetch' não dispara um erro automaticamente se a rota falhar (ex: erro 404 ou 500).
        // Precisamos verificar manualmente a propriedade 'ok' da resposta HTTP.
        if (!resposta.ok) {
          throw new Error('Não foi possível obter os dados do servidor.');
        }

        // '.json()' é um método assíncrono que converte o corpo da resposta crua em um objeto/array JavaScript.
        const dados = await resposta.json();

        // Guardamos os dados no estado do React
        setUsuarios(dados);

      } catch (err) {
        // Bloco 'catch' do JavaScript: captura qualquer erro de rede ou exceção lançada acima
        setErro(err.message);
      } finally {
        // Bloco 'finally': executa SEMPRE no final, independentemente de ter dado certo ou errado.
        // Usamos para desligar o carregador da tela.
        setCarregando(false);
      }
    };

    buscarDados();
  }, [] ); // Array de dependências vazio = roda apenas uma vez quando o componente aparece no ecrã.

  // ==========================================
  // FILTRAGEM DINÂMICA DE DADOS (JavaScript Moderno)
  // ==========================================
  // Usamos o método '.filter()' combinado com '.toLowerCase()' e '.includes()' 
  // para criar uma busca instantânea que ignora maiúsculas e minúsculas.
  const usuariosFiltrados = usuarios.filter(usuario => {
    const nomeMinusculo = usuario.name.toLowerCase();
    const emailMinusculo = usuario.email.toLowerCase();
    const buscaMinuscula = termoBusca.toLowerCase();

    // Retorna verdadeiro se o nome ou o e-mail contiverem o texto digitado na busca
    return nomeMinusculo.includes(buscaMinuscula) || emailMinusculo.includes(buscaMinuscula);
  });

  // ==========================================
  // RENDERIZAÇÃO CONDICIONAL MÚLTIPLA (React)
  // ==========================================
  return (
    <div className="busca-container">
      <h2>Diretório de Utilizadores</h2>

      {/* Input de Pesquisa Controlado */}
      <input 
        type="text" 
        placeholder="Pesquisar por nome ou e-mail..."
        value={termoBusca}
        onChange={(e) => setTermoBusca(e.target.value)}
        className="input-pesquisa"
      />

      {/* Condicional 1: Se estiver a carregar, exibe mensagem de carregamento */}
      {carregando && <p className="status-aviso">A carregar dados da API...</p>}

      {/* Condicional 2: Se houver erro, exibe a mensagem de falha */}
      {erro && <p className="status-erro">Erro: {erro}</p>}

      {/* Condicional 3: Se já terminou de carregar e não há erros, exibe a lista */}
      {!carregando && !erro && (
        <ul className="lista-cards">
          {/* Sub-condicional: Se a busca não retornar nenhum resultado */}
          {usuariosFiltrados.length === 0 ? (
            <p className="status-aviso">Nenhum utilizador encontrado com "{termoBusca}".</p>
          ) : (
            // Mapeia o array filtrado gerando os elementos visuais
            usuariosFiltrados.map((usuario) => (
              <li key={usuario.id} className="card-usuario">
                <h3>{usuario.name}</h3>
                <p><strong>E-mail:</strong> {usuario.email}</p>
                <p><strong>Cidade:</strong> {usuario.address.city}</p>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}