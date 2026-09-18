import { requisicao } from './http-client';
import type { ObterTokenCorpo, TokenResposta } from './types';

export function obterToken(tenantId: string, corpo: ObterTokenCorpo): Promise<TokenResposta> {
  return requisicao<TokenResposta>('/auth/token', { tenantId }, { method: 'POST', body: corpo });
}
