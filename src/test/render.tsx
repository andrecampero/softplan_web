import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { useEffect, type ReactElement, type ReactNode } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { criarQueryClient } from '../api/query-client';
import { AppRoutes } from '../App';
import { AuthProvider, type Sessao } from '../features/auth/AuthProvider';

export function sessaoDeTeste(tenantId = 'pref-florianopolis', expiraEmMs = 3600_000): Sessao {
  return { tenantId, accessToken: `token-${tenantId}`, expiraEm: Date.now() + expiraEmMs };
}

/** Rota atual do MemoryRouter, para os testes conferirem redirecionamentos e a URL do filtro. */
export const localizacao = { atual: '' };

function RastrearLocalizacao() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    localizacao.atual = `${pathname}${search}`;
  }, [pathname, search]);
  return null;
}

interface Opcoes {
  rota?: string;
  sessao?: Sessao | null;
}

export function criarProviders({ rota = '/', sessao = null }: Opcoes = {}) {
  const queryClient = criarQueryClient({ retryDelayMs: 0 });
  function Providers({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider sessaoInicial={sessao}>
          <MemoryRouter initialEntries={[rota]}>
            <RastrearLocalizacao />
            {children}
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>
    );
  }
  return { Providers, queryClient };
}

/** Renderiza o app inteiro (rotas reais) em memória. */
export function renderApp(opcoes: Opcoes = {}) {
  const { Providers, queryClient } = criarProviders(opcoes);
  return { ...render(<AppRoutes />, { wrapper: Providers }), queryClient };
}

export function renderComProviders(ui: ReactElement, opcoes: Opcoes = {}) {
  const { Providers, queryClient } = criarProviders(opcoes);
  return {
    ...render(
      <Routes>
        <Route path="*" element={ui} />
      </Routes>,
      { wrapper: Providers },
    ),
    queryClient,
  };
}
