import { renderHook, waitFor } from '@testing-library/react';
import { http } from 'msw';
import { describe, expect, it } from 'vitest';
import { contador, erroApi } from '../../../mocks/handlers';
import { server } from '../../../mocks/server';
import { criarProviders, sessaoDeTeste } from '../../../test/render';
import { useProcessos, type UseProcessosParams } from './useProcessos';

const URL = 'http://api.teste/processos';

function renderUseProcessos(params: UseProcessosParams = {}, tenant = 'pref-florianopolis') {
  const { Providers } = criarProviders({ sessao: sessaoDeTeste(tenant) });
  return renderHook((p: UseProcessosParams) => useProcessos(p), { wrapper: Providers, initialProps: params });
}

describe('useProcessos', () => {
  it('passa de carregando para sucesso com os processos do tenant', async () => {
    const { result } = renderUseProcessos();

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.processos).toHaveLength(3);
    expect(result.current.total).toBe(3);
  });

  it('envia o filtro de status para a API (não filtra no cliente)', async () => {
    let statusRecebido: string | null = null;
    server.use(
      http.get(URL, ({ request }) => {
        statusRecebido = new globalThis.URL(request.url).searchParams.get('status');
      }),
    );
    const { result } = renderUseProcessos({ status: 'concluido' });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(statusRecebido).toBe('concluido');
    expect(result.current.processos.every((p) => p.status === 'concluido')).toBe(true);
  });

  it('sinaliza lista vazia', async () => {
    const { result } = renderUseProcessos({}, 'gov-sc');

    await waitFor(() => expect(result.current.isEmpty).toBe(true));
  });

  it('expõe o erro e não repete requisições que falharam com 4xx', async () => {
    let chamadas = 0;
    server.use(
      http.get(URL, () => {
        chamadas++;
        return erroApi(400, 'REQUISICAO_INVALIDA', 'Dados inválidos');
      }),
    );
    const { result } = renderUseProcessos();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({ code: 'REQUISICAO_INVALIDA' });
    expect(chamadas).toBe(1);
  });

  it('não repete automaticamente após 429', async () => {
    let chamadas = 0;
    server.use(
      http.get(URL, () => {
        chamadas++;
        return erroApi(429, 'RATE_LIMIT_EXCEDIDO', 'Aguarde', { retryAfterSeconds: 30 });
      }),
    );
    const { result } = renderUseProcessos();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(chamadas).toBe(1);
  });

  it('repete falhas de rede/5xx no máximo 2 vezes', async () => {
    let chamadas = 0;
    server.use(
      http.get(URL, () => {
        chamadas++;
        return erroApi(500, 'ERRO_INTERNO', 'Erro');
      }),
    );
    const { result } = renderUseProcessos();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(chamadas).toBe(3);
  });
});

describe('useProcessos — chamadas repetidas', () => {
  it('dois consumidores dos mesmos dados geram UMA requisição', async () => {
    const { Providers } = criarProviders({ sessao: sessaoDeTeste() });
    const { result } = renderHook(() => [useProcessos(), useProcessos()], { wrapper: Providers });

    await waitFor(() => expect(result.current[0]?.isLoading).toBe(false));
    expect(contador.processos).toBe(1);
  });

  it('voltar a um filtro já visto (em menos de 30 s) usa o cache, sem nova requisição', async () => {
    const { result, rerender } = renderUseProcessos({});
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    rerender({ status: 'concluido' });
    await waitFor(() => expect(result.current.processos.every((p) => p.status === 'concluido')).toBe(true));
    rerender({});
    await waitFor(() => expect(result.current.total).toBe(3));

    expect(contador.processos).toBe(2);
  });
});
