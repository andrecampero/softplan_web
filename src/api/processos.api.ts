import { requisicao, type Credenciais } from './http-client';
import type { ListarProcessosQuery, ListarProcessosResposta } from './types';

export function listarProcessos(
  credenciais: Required<Credenciais>,
  query: ListarProcessosQuery,
  signal?: AbortSignal,
): Promise<ListarProcessosResposta> {
  return requisicao<ListarProcessosResposta>('/processos', credenciais, { query, signal });
}
