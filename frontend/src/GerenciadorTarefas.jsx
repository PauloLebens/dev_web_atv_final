// ==========================================
// IMPORTAÇÃO DE MÚLTIPLOS HOOKS (React)
// ==========================================
// Além do 'useState', importamos o 'useEffect', outro Hook essencial do React.
import { useState, useEffect } from 'react';
import './GerenciadorTarefas.css';

export function GerenciadorTarefas() {

  // ==========================================
  // ESTADOS MÚLTIPLOS (React)
  // ==========================================
  
  // Estado para armazenar a lista de tarefas (começa com um array de objetos)
  const [tarefas, setTarefas] = useState([
    { id: 1, texto: 'Estudar fundamentos do Vite', concluida: true },
    { id: 2, texto: 'Aprender conceitos avançados de React', concluida: false }
  ]);

  // Estado para controlar o texto que está sendo digitado no input no momento
  const [novaTarefaTexto, setNovaTarefaTexto] = useState('');

  // ==========================================
  // useEffect - O HOOK DE EFEITO COLATERAL (React)
  // ==========================================
  
  // O 'useEffect' serve para executar código quando algo acontece no ciclo de vida do componente.
  // O primeiro argumento é uma função com o código a ser executado.
  // O segundo argumento é o "Array de Dependências" ([]). Como ele está vazio, 
  // este código roda apenas UMA VEZ, assim que o componente aparece na tela (montagem).
  useEffect(() => {
    console.log('O componente GerenciadorTarefas foi montado na tela!');
    
    // Conceito Web API / JavaScript: Poderíamos buscar dados de uma API aqui usando 'fetch()'.
  }, []); // [] = Executa apenas na inicialização

  // ==========================================
  // FUNÇÕES E MANIPULAÇÃO DE DADOS (JavaScript Moderno)
  // ==========================================

  // Função para adicionar uma nova tarefa
  const adicionarTarefa = (e) => {
    // Evita o recarregamento da página
    e.preventDefault();

    // Validação simples em JS (retorna se o input estiver vazio)
    if (!novaTarefaTexto.trim()) return;

    // Criamos o objeto da nova tarefa
    const tarefaObjeto = {
      // 'Date.now()' gera um ID numérico único baseado no milissegundo atual
      id: Date.now(), 
      texto: novaTarefaTexto,
      concluida: false
    };

    // ==========================================
    // IMUTABILIDADE NO REACT (Conceito Fundamental)
    // ==========================================
    // NUNCA altere o estado diretamente com métodos como 'tarefas.push(tarefaObjeto)'.
    // O React precisa saber que o estado mudou criando um NOVO array.
    // Usamos o SPREAD OPERATOR (...) do JavaScript moderno para copiar o array antigo 
    // e adicionar o novo item no final.
    setTarefas([...tarefas, tarefaObjeto]);

    // Limpa o input zerando o estado correspondente
    setNovaTarefaTexto('');
  };

  // Função para remover uma tarefa pelo ID
  const removerTarefa = (idParaRemover) => {
    // ==========================================
    // MÉTODO .filter() (JavaScript Moderno)
    // ==========================================
    // O '.filter()' cria um NOVO array contendo apenas os elementos que passam no teste.
    // Aqui dizemos: "fique apenas com as tarefas cujo ID seja DIFERENTE do ID que queremos remover".
    const tarefasAtualizadas = tarefas.filter(tarefa => tarefa.id !== idParaRemover);
    
    // Atualiza o estado com a nova lista filtrada
    setTarefas(tarefasAtualizadas);
  };

  // Função para alternar o status de concluída da tarefa
  const alternarConclusao = (id) => {
    // ==========================================
    // MÉTODO .map() PARA TRANSFORMAÇÃO (JavaScript Moderno)
    // ==========================================
    // O '.map()' percorre o array original e retorna um NOVO array transformado.
    const tarefasModificadas = tarefas.map(tarefa => {
      // Se o ID bater, criamos um novo objeto invertendo o valor de 'concluida' 
      // usando o operador de negação (!)
      if (tarefa.id === id) {
        return { ...tarefa, concluida: !tarefa.concluida };
      }
      // Se não for a tarefa alterada, retornamos o objeto exatamente como ele está
      return tarefa;
    });

    setTarefas(tarefasModificadas);
  };

  // ==========================================
  // RENDERIZAÇÃO E JSX (React)
  // ==========================================
  return (
    <div className="gerenciador-container">
      <h2>Minha Lista de Tarefas</h2>

      {/* Formulário para adicionar nova tarefa */}
      <form onSubmit={adicionarTarefa} className="form-tarefa">
        <input 
          type="text" 
          value={novaTarefaTexto}
          onChange={(e) => setNovaTarefaTexto(e.target.value)}
          placeholder="O que você precisa fazer?"
        />
        <button type="submit">Adicionar</button>
      </form>

      {/* ========================================== */}
      {/* RENDERIZAÇÃO CONDICIONAL (React)           */}
      {/* ========================================== */}
      {/* Usamos o operador lógico '&&'. Se a primeira condição for verdadeira, ele renderiza o JSX à direita. */}
      {tarefas.length === 0 && (
        <p className="vazio-aviso">Parabéns! Você não tem nenhuma tarefa pendente.</p>
      )}

      {/* Listagem de Tarefas */}
      <ul className="lista-tarefas">
        {/* ========================================== */}
        {/* MÉTODO .map() NO JSX (React + JavaScript)  */}
        {/* ========================================== */}
        {/* Em React, transformamos arrays de dados em listas visuais usando o '.map()'. */}
        {tarefas.map((tarefa) => (
          
          /* 
            ATENÇÃO: Toda vez que usamos '.map()' para renderizar elementos em lista no React, 
            é OBRIGATÓRIO passar uma propriedade chamada 'key' com um valor único (como o 'id').
            Isso ajuda o React a otimizar a performance ao atualizar elementos individualmente.
          */
          <li key={tarefa.id} className={tarefa.concluida ? 'tarefa-item concluida' : 'tarefa-item'}>
            
            {/* 
              Renderização condicional inline usando operador ternário: 
              condição ? casoVerdadeiro : casoFalso 
            */}
            <span onClick={() => alternarConclusao(tarefa.id)}>
              {tarefa.concluida ? '✅ ' : '⏳ '} {tarefa.texto}
            </span>

            {/* Botão de deletar que chama a função passando o ID específico daquela linha */}
            <button 
              className="btn-remover" 
              onClick={() => removerTarefa(tarefa.id)}
            >
              Excluir
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}