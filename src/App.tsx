import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { AuthProvider, type Sessao } from './features/auth/AuthProvider';
import { LoginPage } from './features/auth/LoginPage';
import { RequireAuth } from './features/auth/RequireAuth';
import { ProcessosPage } from './features/processos/ProcessosPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/processos"
        element={
          <RequireAuth>
            <ProcessosPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/processos" replace />} />
    </Routes>
  );
}

export function App({ queryClient, sessaoInicial }: { queryClient: QueryClient; sessaoInicial?: Sessao | null }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider sessaoInicial={sessaoInicial}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
