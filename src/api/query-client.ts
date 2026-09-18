import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './http-client';

const MAXIMO_DE_TENTATIVAS_EXTRAS = 2;

/** Só vale repetir falhas transitórias: rede e 5xx. Nunca 4xx nem 429 (CLAUDE.md, seção 11). */
export function deveRepetir(tentativasFalhas: number, erro: unknown): boolean {
  if (tentativasFalhas >= MAXIMO_DE_TENTATIVAS_EXTRAS) return false;
  return erro instanceof ApiError && (erro.code === 'ERRO_DE_REDE' || erro.status >= 500);
}

export function criarQueryClient({ retryDelayMs }: { retryDelayMs?: number } = {}): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: deveRepetir,
        retryDelay: (tentativa) => retryDelayMs ?? Math.min(1000 * 2 ** tentativa, 8000),
      },
      mutations: { retry: false },
    },
  });
}
