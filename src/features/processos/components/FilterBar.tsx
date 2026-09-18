import type { ProcessoStatus } from '../../../api/types';
import { STATUS_LABEL, STATUS_VALORES } from '../status';

interface FilterBarProps {
  valor: ProcessoStatus | undefined;
  onChange(status: ProcessoStatus | undefined): void;
}

const OPCOES: Array<{ valor: ProcessoStatus | undefined; rotulo: string }> = [
  { valor: undefined, rotulo: 'Todos' },
  ...STATUS_VALORES.map((status) => ({ valor: status, rotulo: STATUS_LABEL[status] })),
];

/** Componente controlado. Clicar no filtro já ativo não dispara nova busca. */
export function FilterBar({ valor, onChange }: FilterBarProps) {
  return (
    <div className="filtros" role="group" aria-label="Filtrar processos por status">
      {OPCOES.map((opcao) => {
        const ativo = opcao.valor === valor;
        return (
          <button
            key={opcao.rotulo}
            type="button"
            className="filtros__botao"
            aria-pressed={ativo}
            onClick={() => !ativo && onChange(opcao.valor)}
          >
            {opcao.rotulo}
          </button>
        );
      })}
    </div>
  );
}
