// ==========================================
// IMPORTAÇÕES (JavaScript ES6 / React)
// ==========================================

// 'import { useState } from 'react'' é uma importação nomeada do React.
// O 'useState' é um Hook fundamental do React (explicado mais abaixo).
import { useState } from 'react';

// Importa um arquivo de folha de estilos (CSS) diretamente no JavaScript.
// PARTICULARIDADE DO VITE: Ferramentas modernas de frontend permitem importar CSS 
// diretamente nos arquivos JS; o Vite injeta isso no HTML de forma otimizada para você.
import './Login.css';

// ==========================================
// CRIAÇÃO E EXPORTAÇÃO DO COMPONENTE (React)
// ==========================================

// 'export function Login()' cria e exporta um Componente Funcional do React.
// Em React, componentes nada mais são do que funções JavaScript que retornam a interface visual.
export function Login() {

  // ==========================================
  // ESTADO - useState (Particularidade do React)
  // ==========================================
  
  // 'useState' é um Hook do React que serve para gerenciar "estados" (dados que mudam com o tempo na tela).
  // Sempre que o valor dessas variáveis muda, o React atualiza (re-renderiza) a tela automaticamente.
  // Ele retorna um array com duas posições que desestruturamos com colchetes []:
  // 1. A variável com o valor atual (ex: 'email').
  // 2. A função que altera esse valor (ex: 'setEmail').
  // O valor passado dentro de 'useState('')' é o valor inicial da variável (uma string vazia).
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // ==========================================
  // FUNÇÃO DE ENVIO (JavaScript Moderno - ES6+)
  // ==========================================

  // Declaração de função usando Arrow Function: 'const nomeDaFuncao = (parametros) => { ... }'
  const handleSubmit = (e) => {
    // 'e.preventDefault()' é um método nativo do DOM do JavaScript.
    // Ele impede o comportamento padrão do navegador ao enviar um formulário (que é recarregar a página inteira).
    // No React, evitamos o recarregamento para manter a aplicação fluida e rápida (estilo SPA - Single Page Application).
    e.preventDefault();

    // Template Literals (ou Template Strings): recurso do JavaScript moderno que usa crases (``) 
    // e o ${} para interpolar variáveis dentro de textos de forma limpa, sem precisar usar o operador '+' de concatenação.
    alert(`Tentando logar com: ${email}`);
  };

  // ==========================================
  // O RENDERIZADOR / JSX (Particularidade do React)
  // ==========================================

  // O 'return' devolve o JSX (JavaScript XML), que mistura a sintaxe de HTML com o poder do JavaScript.
  // IMPORTANTE: Os navegadores não entendem JSX nativamente. O Vite/Babel converte isso para JavaScript puro por debaixo dos panos.
  return (
    // Em JSX, usamos 'className' em vez de 'class' (que é o padrão do HTML), 
    // porque 'class' é uma palavra reservada do JavaScript (usada para criar classes de orientação a objetos).
    <div className="login-container">
      
      {/* O atributo 'onSubmit' do React escuta o evento de envio disparado pelo formulário */}
      <form onSubmit={handleSubmit} className="login-form">
        
        <h2>Entrar no Sistema</h2>
        
        <div className="input-group">
          <label>E-mail</label>
          
          {/* Elemento <input> controlado pelo React */}
          <input 
            type="email" 
            
            // 'value={email}' faz com que o valor exibido no input seja exatamente a nossa variável de estado.
            // Isso garante que o componente do React esteja sempre sincronizado com o que está na tela (Controlled Component).
            value={email} 
            
            // 'onChange' é um evento disparado toda vez que o usuário digita um caractere.
            // Usamos uma arrow function inline '(e) => setEmail(e.target.value)' para capturar 
            // o que foi digitado (e.target.value) e atualizar imediatamente a nossa variável de estado 'email'.
            onChange={(e) => setEmail(e.target.value)} 
            
            placeholder="seu@email.com"
            
            // 'required' é um atributo HTML padrão que valida se o campo está preenchido antes de enviar o form.
            required 
          />
        </div>

        <div className="input-group">
          <label>Senha</label>
          <input 
            type="password" 
            value={senha} 
            // Faz exatamente a mesma coisa que o input de email, mas controlando a variável 'senha'
            onChange={(e) => setSenha(e.target.value)} 
            placeholder="Sua senha"
            required 
          />
        </div>

        {/* Um botão com 'type="submit"' serve como gatilho para disparar o evento 'onSubmit' do <form> */}
        <button type="submit">Entrar</button>
      
      </form>
    </div>
  );
}