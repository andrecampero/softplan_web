import { ApiError, type CodigoErro } from './http-client';

export type AcaoDoErro = 'tentar-novamente' | 'aguardar' | 'login' | 'nenhuma';

const MENSAGEM_GENERICA = 'Algo deu errado do nosso lado. Tente novamente em instantes.';
const SESSAO_INVALIDA = 'Sua sessão não é mais válida. Faça login novamente.';

/** Espelho do catálogo da API, com textos pensados para a tela (CLAUDE.md, seção 7.4). */
const MENSAGENS: Partial<Record<CodigoErro, (erro: ApiError) => string>> = {
  ERRO_DE_REDE: () => 'Não foi possível conectar ao servidor. Verifique sua conexão.',
  RATE_LIMIT_EXCEDIDO: (e) =>
    `Muitas requisições em pouco tempo. Tente novamente em ${e.retryAfterSeconds ?? 60} segundos.`,
  CREDENCIAIS_INVALIDAS: () => 'E-mail ou senha incorretos.',
  TOKEN_EXPIRADO: () => 'Sua sessão expirou. Faça login novamente.',
  TOKEN_INVALIDO: () => SESSAO_INVALIDA,
  TOKEN_AUSENTE: () => SESSAO_INVALIDA,
  TENANT_TOKEN_DIVERGENTE: () => SESSAO_INVALIDA,
  ERRO_INTERNO: (e) => `${MENSAGEM_GENERICA}${e.requestId ? ` (Código: ${e.requestId})` : ''}`,
  ERRO_INESPERADO: () => MENSAGEM_GENERICA,
};

/** Mensagem amigável para qualquer erro. Nunca devolve error.message cru, stack ou JSON. */
export function getMensagemErro(erro: unknown): string {
  if (!(erro instanceof ApiError)) return MENSAGEM_GENERICA;
  return MENSAGENS[erro.code]?.(erro) ?? erro.mensagemApi ?? MENSAGEM_GENERICA;
}

export function getAcaoDoErro(erro: unknown): AcaoDoErro {
  if (!(erro instanceof ApiError)) return 'tentar-novamente';
  if (erro.code === 'RATE_LIMIT_EXCEDIDO') return 'aguardar';
  if (erro.status === 401 || erro.code === 'TENANT_TOKEN_DIVERGENTE') return 'login';
  if (erro.code === 'ERRO_DE_REDE' || erro.status >= 500 || erro.code === 'ERRO_INESPERADO') return 'tentar-novamente';
  return 'nenhuma';
}
