import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../api/http-client';
import { useEsperaRestante } from './useEsperaRestante';

describe('useEsperaRestante', () => {
  afterEach(() => vi.useRealTimers());

  it('conta o Retry-After de um 429 até zero', () => {
    vi.useFakeTimers({ now: new Date('2026-09-18T12:00:00.000Z') });
    const erro = new ApiError(429, 'RATE_LIMIT_EXCEDIDO', undefined, undefined, 3);
    const { result } = renderHook(() => useEsperaRestante(erro));

    expect(result.current).toBe(3);
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toBe(2);
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current).toBe(0);
  });

  it('é zero para erros que não são de rate limit', () => {
    const { result } = renderHook(() => useEsperaRestante(new ApiError(500, 'ERRO_INTERNO')));

    expect(result.current).toBe(0);
  });
});
