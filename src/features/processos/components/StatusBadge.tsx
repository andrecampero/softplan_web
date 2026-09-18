import type { ProcessoStatus } from '../../../api/types';
import { STATUS_LABEL } from '../status';

const ICONE: Record<ProcessoStatus, string> = { em_andamento: '●', concluido: '✓' };

/** Status com texto + ícone: a informação nunca depende só da cor. */
export function StatusBadge({ status }: { status: ProcessoStatus }) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      <span aria-hidden="true">{ICONE[status]}</span> {STATUS_LABEL[status]}
    </span>
  );
}
