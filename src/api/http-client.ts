import { config } from '../config';
import { notificarSessaoInvalida } from './sessao-eventos';
import type { ApiErroCorpo, CodigoErroApi } from './types';

export type CodigoErro = CodigoErroApi | 'ERRO_DE_REDE' | 'ERRO_INESPERADO';

const TIMEOUT_MS = 10_000;
const CODIGOS_DE_SESSAO_INVALIDA: ReadonlySet<CodigoErro> = new Set([
  'TOKEN_AUSENTE',
  'TOKEN_INVALIDO',
  'TOKEN_EXPIRADO',
  'TENANT_TOKEN_DIVERGENTE',
]);

/** Toda falha de chamada à API vira um ApiError (CLAUDE.md, seção 7.4). */
export class ApiError extends Error {
  /** Momento em que a resposta chegou: base para a contagem do Retry-After. */
  readonly recebidoEm = Date.now();

  constructor(
    readonly status: number,
    readonly code: CodigoErro,
    readonly mensagemApi?: string,
    readonly requestId?: string,
    readonly retryAfterSeconds?: number,
  ) {
    super(code);
    this.name = 'ApiError';
  }
}

export interface Credenciais {
  tenantId: string;
  accessToken?: string;
}

interface Opcoes {
  method?: 'GET' | 'POST';
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  signal?: AbortSignal;
}

function montarUrl(caminho: string, query: Opcoes['query'] = {}): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([chave, valor]) => valor !== undefined && params.set(chave, String(valor)));
  const busca = params.toString();
  return `${config.apiUrl}${caminho}${busca ? `?${busca}` : ''}`;
}

function lerJson(texto: string): unknown {
  try {
    return texto ? JSON.parse(texto) : undefined;
  } catch {
    return undefined;
  }
}

function isCorpoDeErro(corpo: unknown): corpo is ApiErroCorpo {
  return typeof corpo === 'object' && corpo !== null && 'error' in corpo && typeof corpo.error === 'object';
}

async function executarFetch(url: string, init: RequestInit, signal?: AbortSignal): Promise<Response> {
  const timeout = AbortSignal.timeout(TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: signal ? AbortSignal.any([signal, timeout]) : timeout });
  } catch (erro) {
    if (signal?.aborted) throw erro; // cancelamento pedido por quem chamou (ex.: troca de filtro)
    throw new ApiError(0, 'ERRO_DE_REDE');
  }
}

export async function requisicao<T>(caminho: string, credenciais: Credenciais, opcoes: Opcoes = {}): Promise<T> {
  const headers: Record<string, string> = { 'x-tenant-id': credenciais.tenantId };
  if (credenciais.accessToken) headers.authorization = `Bearer ${credenciais.accessToken}`;
  if (opcoes.body !== undefined) headers['content-type'] = 'application/json';

  const resposta = await executarFetch(
    montarUrl(caminho, opcoes.query),
    {
      method: opcoes.method ?? 'GET',
      headers,
      body: opcoes.body === undefined ? undefined : JSON.stringify(opcoes.body),
      cache: 'no-store',
    },
    opcoes.signal,
  );
  const corpo = lerJson(await resposta.text());

  if (resposta.ok) {
    if (corpo === undefined) throw new ApiError(resposta.status, 'ERRO_INESPERADO');
    return corpo as T;
  }

  if (!isCorpoDeErro(corpo)) throw new ApiError(resposta.status, 'ERRO_INESPERADO');

  const { code, message, requestId, retryAfterSeconds } = corpo.error;
  const retryHeader = Number(resposta.headers.get('retry-after'));
  const erro = new ApiError(resposta.status, code, message, requestId, retryAfterSeconds ?? (retryHeader || undefined));

  if (credenciais.accessToken && CODIGOS_DE_SESSAO_INVALIDA.has(code)) notificarSessaoInvalida(code);
  throw erro;
}
