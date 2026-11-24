/**
 * Página provisória para os itens do menu que ainda não foram implementados.
 * Substitua pela página de verdade em App.jsx quando ela existir.
 */
import { Icon } from '../components/Icon';

export function EmConstrucao({ titulo, icone = 'construction' }) {
  return (
    <div className="pagina">
      <div className="pagina__titulo">
        <Icon name={icone} size={32} />
        <h1>{titulo}</h1>
      </div>
      <div className="card em-construcao">
        <Icon name="construction" size={48} />
        <p>Esta tela ainda está sendo desenvolvida.</p>
      </div>
    </div>
  );
}
