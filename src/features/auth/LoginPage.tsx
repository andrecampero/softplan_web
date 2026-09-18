import { Navigate } from 'react-router';
import { config } from '../../config';
import { LoginForm } from './components/LoginForm';
import { useAuth } from './hooks/useAuth';
import { useLogin } from './hooks/useLogin';

export function LoginPage() {
  const { sessao, aviso } = useAuth();
  const login = useLogin();

  if (sessao) return <Navigate to="/processos" replace />;

  return (
    <main className="pagina pagina--centro">
      <section className="cartao cartao--login" aria-labelledby="titulo-login">
        <h1 id="titulo-login">1DOC — Consulta de processos</h1>
        {aviso && (
          <p className="aviso" role="status">
            {aviso}
          </p>
        )}
        <LoginForm tenants={config.tenants} enviando={login.isPending} erro={login.error} onEntrar={login.mutate} />
      </section>
    </main>
  );
}
