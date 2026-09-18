import type { Processo } from '../../../api/types';
import { EmptyState } from '../../../shared/components/EmptyState';
import { ErrorState } from '../../../shared/components/ErrorState';
import { LoadingState } from '../../../shared/components/LoadingState';
import { ProcessoCard } from './ProcessoCard';

interface ProcessoListProps {
  processos: Processo[];
  isLoading: boolean;
  isFetching: boolean;
  isEmpty: boolean;
  error: unknown;
  onTentarNovamente(): void;
}

/** Escolhe entre carregando / erro / vazio / lista. Sem estado próprio. */
export function ProcessoList({ processos, isLoading, isFetching, isEmpty, error, onTentarNovamente }: ProcessoListProps) {
  if (isLoading) return <LoadingState mensagem="Carregando processos…" />;
  if (error) return <ErrorState erro={error} onTentarNovamente={onTentarNovamente} tentando={isFetching} />;
  if (isEmpty) return <EmptyState titulo="Nenhum processo encontrado.">Tente outro filtro de status.</EmptyState>;

  return (
    <ul className="processos" aria-busy={isFetching}>
      {processos.map((processo) => (
        <li key={processo.id}>
          <ProcessoCard processo={processo} />
        </li>
      ))}
    </ul>
  );
}
