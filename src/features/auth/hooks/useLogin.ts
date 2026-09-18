import { useMutation } from '@tanstack/react-query';
import { obterToken } from '../../../api/auth.api';
import { useAuth } from './useAuth';

export interface DadosLogin {
  tenantId: string;
  email: string;
  senha: string;
}

export function useLogin() {
  const { entrar } = useAuth();

  return useMutation({
    mutationFn: ({ tenantId, email, senha }: DadosLogin) => obterToken(tenantId, { email, senha }),
    onSuccess: (token, { tenantId }) =>
      entrar({ tenantId, accessToken: token.accessToken, expiresIn: token.expiresIn }),
  });
}
