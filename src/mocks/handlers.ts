import { http, HttpResponse } from 'msw';
import { config } from '../config';
import { PROCESSOS_POR_TENANT, SENHA_RECUSADA_NO_MOCK } from './dados';

const url = (caminho: string) => `${config.apiUrl}${caminho}`;

/** Conta as chamadas recebidas pelo "servidor", para provar que não há requisições repetidas. */
export const contador = {
  processos: 0,
  login: 0,
  zerar() {
    this.processos = 0;
    this.login = 0;
  },
};

export function erroApi(status: number, code: string, message: string, extras: Record<string, unknown> = {}) {
  return HttpResponse.json({ error: { code, message, requestId: 'req-teste-123', ...extras } }, { status });
}

export const handlers = [
  http.post(url('/auth/token'), async ({ request }) => {
    contador.login++;
    const tenant = request.headers.get('x-tenant-id') ?? '';
    const corpo = (await request.json()) as { email: string; senha: string };
    if (corpo.senha === SENHA_RECUSADA_NO_MOCK) return erroApi(401, 'CREDENCIAIS_INVALIDAS', 'E-mail ou senha incorretos.');
    return HttpResponse.json({ accessToken: `token-${tenant}`, tokenType: 'Bearer', expiresIn: 3600 });
  }),

  http.get(url('/processos'), ({ request }) => {
    contador.processos++;
    const tenant = request.headers.get('x-tenant-id') ?? '';
    if (request.headers.get('authorization') !== `Bearer token-${tenant}`) {
      return erroApi(401, 'TOKEN_INVALIDO', 'Sua credencial de acesso é inválida. Faça login novamente.');
    }
    const status = new URL(request.url).searchParams.get('status');
    const data = (PROCESSOS_POR_TENANT[tenant] ?? []).filter((p) => !status || p.status === status);
    return HttpResponse.json({ data, total: data.length, page: 1 });
  }),
];
