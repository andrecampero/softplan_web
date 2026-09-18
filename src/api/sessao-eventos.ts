import type { CodigoErroApi } from './types';

type Listener = (codigo: CodigoErroApi) => void;

const listeners = new Set<Listener>();

/** O http-client avisa quando a API recusa a sessão; o AuthProvider escuta e faz logout. */
export function aoSessaoInvalida(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notificarSessaoInvalida(codigo: CodigoErroApi): void {
  listeners.forEach((listener) => listener(codigo));
}
