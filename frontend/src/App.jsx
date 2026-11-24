import { useState, useEffect } from 'react';
import './App.css';

/**
 * Componente principal da aplicação frontend do Sistema Lava-Jato.
 * Gerencia o estado de comunicação com a API Express e renderiza o painel inicial.
 */
function App() {
  const [apiStatus, setApiStatus] = useState('Verificando conexão...');

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setApiStatus(`API Online (${data.status})`))
      .catch(() => setApiStatus('Erro ao conectar com a API'));
  }, []);

  return (
    <div className="container">
      <header className="header">
        <h1>Sistema Lava-Jato</h1>
      </header>
      <main className="main-content">
        <section className="card">
          <h2>Painel Principal</h2>
          <p>Frontend React integrado com sucesso ao backend Express.</p>
          <div className="status-badge">{apiStatus}</div>
        </section>
      </main>
    </div>
  );
}

export default App;

