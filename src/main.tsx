import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { criarQueryClient } from './api/query-client';
import { App } from './App';
import { ErrorBoundary } from './shared/components/ErrorBoundary';
import './styles.css';

const raiz = document.getElementById('root');
if (!raiz) throw new Error('Elemento #root não encontrado');

createRoot(raiz).render(
  <StrictMode>
    <ErrorBoundary>
      <App queryClient={criarQueryClient()} />
    </ErrorBoundary>
  </StrictMode>,
);
