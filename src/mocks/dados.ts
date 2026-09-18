import type { Processo } from '../api/types';

/** Dados fictícios por tenant, só para testes. Cada órgão tem sua própria lista. */
export const PROCESSOS_POR_TENANT: Record<string, Processo[]> = {
  'pref-florianopolis': [
    { id: 'fln-1', numero: 'FLN-2026/000001', titulo: 'Solicitação de alvará', status: 'em_andamento', criadoEm: '2026-03-10T12:00:00.000Z' },
    { id: 'fln-2', numero: 'FLN-2026/000002', titulo: 'Pedido de poda de árvore', status: 'concluido', criadoEm: '2026-02-10T12:00:00.000Z' },
    { id: 'fln-3', numero: 'FLN-2026/000003', titulo: 'Licença ambiental', status: 'em_andamento', criadoEm: '2026-01-10T12:00:00.000Z' },
  ],
  'pref-joinville': [
    { id: 'joi-1', numero: 'JOI-2026/000001', titulo: 'Alvará sanitário', status: 'concluido', criadoEm: '2026-03-01T12:00:00.000Z' },
  ],
  'gov-sc': [],
};

/** Senha que o mock de login recusa. Qualquer outra é aceita (não há credencial real nos testes). */
export const SENHA_RECUSADA_NO_MOCK = 'senha-recusada';
