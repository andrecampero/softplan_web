import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http } from 'msw';
import { describe, expect, it } from 'vitest';
import { erroApi } from '../../mocks/handlers';
import { server } from '../../mocks/server';
import { localizacao, renderApp, sessaoDeTeste } from '../../test/render';

describe('ProcessosPage', () => {
  it('mostra o carregamento e depois a lista com título, status e data', async () => {
    renderApp({ rota: '/processos', sessao: sessaoDeTeste() });

    expect(screen.getByRole('status')).toHaveTextContent('Carregando processos…');
    const itens = await screen.findAllByRole('listitem');
    expect(itens).toHaveLength(3);
    expect(within(itens[0]!).getByRole('heading', { name: 'Solicitação de alvará' })).toBeInTheDocument();
    expect(within(itens[0]!).getByText('Em andamento')).toBeInTheDocument();
    expect(within(itens[0]!).getByText('10/03/2026')).toBeInTheDocument();
  });

  it('filtra por status e guarda o filtro na URL', async () => {
    renderApp({ rota: '/processos', sessao: sessaoDeTeste() });
    await screen.findAllByRole('listitem');

    await userEvent.click(screen.getByRole('button', { name: 'Concluído' }));

    await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(1));
    expect(screen.getByRole('button', { name: 'Concluído' })).toHaveAttribute('aria-pressed', 'true');
    await waitFor(() => expect(localizacao.atual).toBe('/processos?status=concluido'));
  });

  it('mostra o estado de lista vazia', async () => {
    renderApp({ rota: '/processos', sessao: sessaoDeTeste('gov-sc') });

    expect(await screen.findByText('Nenhum processo encontrado.')).toBeInTheDocument();
  });

  it('mostra erro amigável com "Tentar novamente" e recupera', async () => {
    server.use(http.get('http://api.teste/processos', () => erroApi(500, 'ERRO_INTERNO', 'x')), );
    renderApp({ rota: '/processos', sessao: sessaoDeTeste() });

    const alerta = await screen.findByRole('alert');
    expect(alerta).toHaveTextContent('Algo deu errado do nosso lado. Tente novamente em instantes. (Código: req-teste-123)');

    server.resetHandlers();
    await userEvent.click(within(alerta).getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findAllByRole('listitem')).toHaveLength(3);
  });

  it('com 429 mostra a contagem regressiva e bloqueia o botão', async () => {
    server.use(http.get('http://api.teste/processos', () => erroApi(429, 'RATE_LIMIT_EXCEDIDO', 'x', { retryAfterSeconds: 30 })));
    renderApp({ rota: '/processos', sessao: sessaoDeTeste() });

    const alerta = await screen.findByRole('alert');
    expect(alerta).toHaveTextContent('Muitas requisições em pouco tempo. Tente novamente em 30 segundos.');
    expect(within(alerta).getByRole('button', { name: 'Aguarde 30s' })).toBeDisabled();
  });

  it('sem sessão redireciona para o login', () => {
    renderApp({ rota: '/processos' });

    expect(screen.getByRole('heading', { name: '1DOC — Consulta de processos' })).toBeInTheDocument();
  });
});
