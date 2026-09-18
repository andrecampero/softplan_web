import type { ProcessoStatus } from '../../api/types';

/** Mapa único de rótulos, tipado pelo contrato: status novo na API quebra a compilação. */
export const STATUS_LABEL: Record<ProcessoStatus, string> = {
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
};

export const STATUS_VALORES = Object.keys(STATUS_LABEL) as ProcessoStatus[];

export function isProcessoStatus(valor: string | null): valor is ProcessoStatus {
  return valor !== null && (STATUS_VALORES as string[]).includes(valor);
}
