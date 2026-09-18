import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { listarProcessos } from '../../../api/processos.api';
import type { ProcessoStatus } from '../../../api/types';
import { useAuth } from '../../auth/hooks/useAuth';

export interface UseProcessosParams {
  status?: ProcessoStatus;
  page?: number;
}

/**
 * Toda a busca e o filtro de processos. O filtro é aplicado na API (?status=),
 * nunca no cliente. Deduplicação, cache e cancelamento vêm do TanStack Query.
 */
export function useProcessos({ status, page = 1 }: UseProcessosParams = {}) {
  const { sessao } = useAuth();

  const query = useQuery({
    queryKey: ['processos', sessao?.tenantId, status ?? 'todos', page],
    queryFn: ({ signal }) => {
      if (!sessao) throw new Error('Sessão ausente');
      return listarProcessos({ tenantId: sessao.tenantId, accessToken: sessao.accessToken }, { status, page }, signal);
    },
    enabled: Boolean(sessao),
    placeholderData: keepPreviousData,
  });

  const processos = query.data?.data ?? [];
  return {
    processos,
    total: query.data?.total ?? 0,
    page: query.data?.page ?? page,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    isEmpty: query.isSuccess && processos.length === 0,
    refetch: query.refetch,
  };
}
