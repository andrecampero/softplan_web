import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { aoSessaoInvalida } from '../../api/sessao-eventos';
import type { CodigoErroApi } from '../../api/types';

/** Sessão SOMENTE em memória: nada em localStorage/sessionStorage/cookie (CLAUDE.md, seção 4.7). */
export interface Sessao {
  tenantId: string;
  accessToken: string;
  expiraEm: number;
}

export interface AuthContextValue {
  sessao: Sessao | null;
  aviso: string | null;
  entrar(dados: { tenantId: string; accessToken: string; expiresIn: number }): void;
  sair(aviso?: string): void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

const AVISO_EXPIRADA = 'Sua sessão expirou. Faça login novamente.';
const AVISO_INVALIDA = 'Sua sessão não é mais válida. Faça login novamente.';

function avisoPara(codigo: CodigoErroApi): string {
  return codigo === 'TOKEN_EXPIRADO' ? AVISO_EXPIRADA : AVISO_INVALIDA;
}

export function AuthProvider({ children, sessaoInicial = null }: { children: ReactNode; sessaoInicial?: Sessao | null }) {
  const queryClient = useQueryClient();
  const [sessao, setSessao] = useState<Sessao | null>(sessaoInicial);
  const [aviso, setAviso] = useState<string | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout>>(undefined);

  const sair = useCallback(
    (novoAviso?: string) => {
      clearTimeout(temporizador.current);
      queryClient.clear();
      setSessao(null);
      setAviso(novoAviso ?? null);
    },
    [queryClient],
  );

  const entrar = useCallback<AuthContextValue['entrar']>(
    ({ tenantId, accessToken, expiresIn }) => {
      queryClient.clear();
      setAviso(null);
      setSessao({ tenantId, accessToken, expiraEm: Date.now() + expiresIn * 1000 });
    },
    [queryClient],
  );

  // Encerra a sessão quando o token completa 1 hora.
  useEffect(() => {
    if (!sessao) return;
    temporizador.current = setTimeout(() => sair(AVISO_EXPIRADA), Math.max(0, sessao.expiraEm - Date.now()));
    return () => clearTimeout(temporizador.current);
  }, [sessao, sair]);

  // A API recusou o token (expirado, inválido, de outro órgão): volta ao login.
  useEffect(() => aoSessaoInvalida((codigo) => sair(avisoPara(codigo))), [sair]);

  const valor = useMemo(() => ({ sessao, aviso, entrar, sair }), [sessao, aviso, entrar, sair]);
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
