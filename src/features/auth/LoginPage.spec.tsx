import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { contador, erroApi } from '../../mocks/handlers';
import { SENHA_RECUSADA_NO_MOCK } from '../../mocks/dados';
import { server } from '../../mocks/server';
import { localizacao, renderApp, sessaoDeTeste } from '../../test/render';

async function preencherLogin(senha = 'qualquer-senha-de-teste') {
  await userEvent.selectOptions(screen.getByLabelText('Órgão'), 'pref-florianopolis');
  await userEvent.type(screen.getByLabelText('E-mail'), 'admin@florianopolis.sc.gov.br');
  await userEvent.type(screen.getByLabelText('Senha'), senha);
}

describe('Login', () => {
  afterEach(() => vi.useRealTimers());

  it('entra e leva à lista de processos do órgão escolhido', async () => {
    renderApp({ rota: '/login' });
    await preencherLogin();

    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByRole('heading', { name: 'Processos' })).toBeInTheDocument();
    await waitFor(() => expect(localizacao.atual).toBe('/processos'));
    expect(await screen.findAllByRole('listitem')).toHaveLength(3);
  });

  it('não grava token, senha nem dados no armazenamento do navegador', async () => {
    renderApp({ rota: '/login' });
    await preencherLogin();
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    await screen.findAllByRole('listitem');

    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
    expect(document.cookie).toBe('');
  });

  it('com credenciais inválidas mostra mensagem amigável, limpa a senha e foca o campo', async () => {
    renderApp({ rota: '/login' });
    await preencherLogin(SENHA_RECUSADA_NO_MOCK);

    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha incorretos.');
    expect(screen.getByLabelText('Senha')).toHaveValue('');
    expect(screen.getByLabelText('Senha')).toHaveFocus();
  });

  it('duplo clique em Entrar envia UMA requisição', async () => {
    renderApp({ rota: '/login' });
    await preencherLogin();

    await userEvent.dblClick(screen.getByRole('button', { name: 'Entrar' }));
    await screen.findByRole('heading', { name: 'Processos' });

    expect(contador.login).toBe(1);
  });

  it('com 429 no login mostra a espera e bloqueia o botão', async () => {
    server.use(
      http.post('http://api.teste/auth/token', () =>
        erroApi(429, 'RATE_LIMIT_EXCEDIDO', 'Muitas tentativas', { retryAfterSeconds: 60 }),
      ),
    );
    renderApp({ rota: '/login' });
    await preencherLogin();

    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Muitas tentativas de login. Aguarde 60 segundos');
    expect(screen.getByRole('button', { name: 'Aguarde 60s' })).toBeDisabled();
  });
});

describe('Sessão', () => {
  afterEach(() => vi.useRealTimers());

  it('expira após 1 hora, limpa o cache e volta ao login com aviso', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { queryClient } = renderApp({ rota: '/processos', sessao: sessaoDeTeste('pref-florianopolis', 3600_000) });
    await screen.findAllByRole('listitem');

    await act(async () => {
      vi.advanceTimersByTime(3600_000);
    });

    expect(await screen.findByText('Sua sessão expirou. Faça login novamente.')).toBeInTheDocument();
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
  });

  it('quando a API responde TOKEN_EXPIRADO, sai e mostra o aviso', async () => {
    server.use(http.get('http://api.teste/processos', () => erroApi(401, 'TOKEN_EXPIRADO', 'Sua sessão expirou.')));
    renderApp({ rota: '/processos', sessao: sessaoDeTeste() });

    expect(await screen.findByText('Sua sessão expirou. Faça login novamente.')).toBeInTheDocument();
    await waitFor(() => expect(localizacao.atual).toBe('/login'));
  });

  it('botão Sair encerra a sessão', async () => {
    renderApp({ rota: '/processos', sessao: sessaoDeTeste() });
    await screen.findAllByRole('listitem');

    await userEvent.click(screen.getByRole('button', { name: 'Sair' }));

    expect(await screen.findByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });
});
