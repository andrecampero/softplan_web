import type { Processo } from '../../../api/types';
import { StatusBadge } from './StatusBadge';

const formatoData = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeZone: 'America/Sao_Paulo' });

export function ProcessoCard({ processo }: { processo: Processo }) {
  return (
    <article className="processo-card" aria-labelledby={`processo-${processo.id}`}>
      <h3 id={`processo-${processo.id}`} className="processo-card__titulo">
        {processo.titulo}
      </h3>
      <p className="processo-card__numero">{processo.numero}</p>
      <div className="processo-card__rodape">
        <StatusBadge status={processo.status} />
        <span>
          Criado em <time dateTime={processo.criadoEm}>{formatoData.format(new Date(processo.criadoEm))}</time>
        </span>
      </div>
    </article>
  );
}
