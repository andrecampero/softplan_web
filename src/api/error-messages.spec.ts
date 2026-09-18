import { describe, expect, it } from 'vitest';
import { getAcaoDoErro, getMensagemErro } from './error-messages';
import { ApiError } from './http-client';

describe('getMensagemErro', () => {
  it.each([
    [new ApiError(0, 'ERRO_DE_REDE'), 'Não foi possível conectar ao servidor. Verifique sua conexão.'],
    [new ApiError(429, 'RATE_LIMIT_EXCEDIDO', undefined, undefined, 42), 'Muitas requisições em pouco tempo. Tente novamente em 42 segundos.'],
    [new ApiError(401, 'CREDENCIAIS_INVALIDAS'), 'E-mail ou senha incorretos.'],
    [new ApiError(401, 'TOKEN_EXPIRADO'), 'Sua sessão expirou. Faça login novamente.'],
    [new ApiError(401, 'TOKEN_INVALIDO'), 'Sua sessão não é mais válida. Faça login novamente.'],
    [new ApiError(403, 'TENANT_TOKEN_DIVERGENTE'), 'Sua sessão não é mais válida. Faça login novamente.'],
    [new ApiError(500, 'ERRO_INTERNO', 'x', 'req-9'), 'Algo deu errado do nosso lado. Tente novamente em instantes. (Código: req-9)'],
    [new ApiError(502, 'ERRO_INESPERADO'), 'Algo deu errado do nosso lado. Tente novamente em instantes.'],
  ])('traduz %s', (erro, esperado) => {
    expect(getMensagemErro(erro)).toBe(esperado);
  });

  it('usa a mensagem amigável da API para códigos sem texto próprio', () => {
    expect(getMensagemErro(new ApiError(403, 'TENANT_NAO_AUTORIZADO', 'Este órgão não tem acesso à API.'))).toBe(
      'Este órgão não tem acesso à API.',
    );
  });

  it('nunca expõe a mensagem crua de um erro JavaScript', () => {
    const mensagem = getMensagemErro(new TypeError("Cannot read properties of undefined (reading 'x')"));

    expect(mensagem).toBe('Algo deu errado do nosso lado. Tente novamente em instantes.');
  });
});

describe('getAcaoDoErro', () => {
  it.each([
    [new ApiError(429, 'RATE_LIMIT_EXCEDIDO'), 'aguardar'],
    [new ApiError(401, 'TOKEN_EXPIRADO'), 'login'],
    [new ApiError(0, 'ERRO_DE_REDE'), 'tentar-novamente'],
    [new ApiError(500, 'ERRO_INTERNO'), 'tentar-novamente'],
    [new ApiError(400, 'REQUISICAO_INVALIDA'), 'nenhuma'],
  ] as const)('%s → %s', (erro, acao) => {
    expect(getAcaoDoErro(erro)).toBe(acao);
  });
});
