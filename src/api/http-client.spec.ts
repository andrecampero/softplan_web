import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { erroApi } from '../mocks/handlers';
import { server } from '../mocks/server';
import { ApiError, requisicao } from './http-client';
import { aoSessaoInvalida } from './sessao-eventos';

const URL_TESTE = 'http://api.teste/teste';

async function capturarErro(promessa: Promise<unknown>): Promise<ApiError> {
  const erro = await promessa.catch((e: unknown) => e);
  if (!(erro instanceof ApiError)) throw new Error('esperava ApiError');
  return erro;
}

describe('requisicao', () => {
  it('envia x-tenant-id e Authorization e devolve o JSON', async () => {
    let headers = new Headers();
    server.use(
      http.get(URL_TESTE, ({ request }) => {
        headers = request.headers;
        return HttpResponse.json({ ok: true });
      }),
    );

    const resposta = await requisicao('/teste', { tenantId: 'gov-sc', accessToken: 'abc' });

    expect(resposta).toEqual({ ok: true });
    expect(headers.get('x-tenant-id')).toBe('gov-sc');
    expect(headers.get('authorization')).toBe('Bearer abc');
  });

  it('converte o corpo de erro da API em ApiError, com retry-after', async () => {
    server.use(http.get(URL_TESTE, () => erroApi(429, 'RATE_LIMIT_EXCEDIDO', 'Aguarde', { retryAfterSeconds: 30 })));

    const erro = await capturarErro(requisicao('/teste', { tenantId: 'gov-sc' }));

    expect(erro).toMatchObject({ status: 429, code: 'RATE_LIMIT_EXCEDIDO', retryAfterSeconds: 30, requestId: 'req-teste-123' });
  });

  it('falha de rede vira ERRO_DE_REDE', async () => {
    server.use(http.get(URL_TESTE, () => HttpResponse.error()));

    expect((await capturarErro(requisicao('/teste', { tenantId: 'gov-sc' }))).code).toBe('ERRO_DE_REDE');
  });

  it('resposta de erro sem JSON vira ERRO_INESPERADO', async () => {
    server.use(http.get(URL_TESTE, () => new HttpResponse('<html>Bad Gateway</html>', { status: 502 })));

    expect((await capturarErro(requisicao('/teste', { tenantId: 'gov-sc' }))).code).toBe('ERRO_INESPERADO');
  });

  it('avisa o AuthProvider quando a API recusa o token', async () => {
    server.use(http.get(URL_TESTE, () => erroApi(401, 'TOKEN_EXPIRADO', 'Sua sessão expirou.')));
    const listener = vi.fn();
    const cancelar = aoSessaoInvalida(listener);

    await capturarErro(requisicao('/teste', { tenantId: 'gov-sc', accessToken: 'abc' }));
    cancelar();

    expect(listener).toHaveBeenCalledWith('TOKEN_EXPIRADO');
  });
});
