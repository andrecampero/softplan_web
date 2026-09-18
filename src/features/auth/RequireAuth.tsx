import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from './hooks/useAuth';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { sessao } = useAuth();
  return sessao ? children : <Navigate to="/login" replace />;
}
