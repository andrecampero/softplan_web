import { useSearchParams } from 'react-router';
import type { ProcessoStatus } from '../../api/types';
import { useAuth } from '../auth/hooks/useAuth';
import { FilterBar } from './components/FilterBar';
import { ProcessoList } from './components/ProcessoList';
import { useProcessos } from './hooks/useProcessos';
import { isProcessoStatus } from './status';

export function ProcessosPage() {
  const { sessao, sair } = useAuth();
  const [params, setParams] = useSearchParams();
  const statusDaUrl = params.get('status');
  const status = isProcessoStatus(statusDaUrl) ? statusDaUrl : undefined;
  const resultado = useProcessos({ status });

  function alterarStatus(novo: ProcessoStatus | undefined) {
    setParams(novo ? { status: novo } : {});
  }

  return (
    <>
      <header className="topo">
        <p className="topo__marca">1DOC</p>
        <p className="topo__orgao">
          Órgão: <strong>{sessao?.tenantId}</strong>
        </p>
        <button type="button" className="botao botao--secundario" onClick={() => sair()}>
          Sair
        </button>
      </header>
      <main className="pagina">
        <h1>Processos</h1>
        <FilterBar valor={status} onChange={alterarStatus} />
        {!resultado.isLoading && !resultado.isError && (
          <p className="contador" aria-live="polite">
            {resultado.total} {resultado.total === 1 ? 'processo' : 'processos'}
          </p>
        )}
        <ProcessoList
          processos={resultado.processos}
          isLoading={resultado.isLoading}
          isFetching={resultado.isFetching}
          isEmpty={resultado.isEmpty}
          error={resultado.error}
          onTentarNovamente={() => void resultado.refetch()}
        />
      </main>
    </>
  );
}
