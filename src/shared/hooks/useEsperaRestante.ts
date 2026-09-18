import { useSyncExternalStore } from 'react';
import { ApiError } from '../../api/http-client';

/** Relógio compartilhado que só "anda" enquanto algum componente precisa dele. */
const relogio = {
  agora: 0,
  intervalo: undefined as ReturnType<typeof setInterval> | undefined,
  ouvintes: new Set<() => void>(),
};

function assinar(ouvinte: () => void): () => void {
  relogio.ouvintes.add(ouvinte);
  if (!relogio.intervalo) {
    relogio.agora = Date.now();
    relogio.intervalo = setInterval(() => {
      relogio.agora = Date.now();
      relogio.ouvintes.forEach((o) => o());
    }, 1000);
  }
  return () => {
    relogio.ouvintes.delete(ouvinte);
    if (relogio.ouvintes.size === 0) {
      clearInterval(relogio.intervalo);
      relogio.intervalo = undefined;
    }
  };
}

const instanteAtual = () => (relogio.intervalo ? relogio.agora : Math.floor(Date.now() / 1000) * 1000);

/**
 * Segundos que faltam para poder tentar de novo após um 429 (0 se não há espera).
 * Calculado a partir do momento em que o erro chegou, sem estado local.
 */
export function useEsperaRestante(erro: unknown): number {
  const agora = useSyncExternalStore(assinar, instanteAtual);
  if (!(erro instanceof ApiError) || erro.code !== 'RATE_LIMIT_EXCEDIDO' || !erro.retryAfterSeconds) return 0;

  const fim = erro.recebidoEm + erro.retryAfterSeconds * 1000;
  return Math.min(erro.retryAfterSeconds, Math.max(0, Math.ceil((fim - agora) / 1000)));
}
