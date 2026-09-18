import { useEffect, useRef, useState, type FormEvent } from 'react';
import { getMensagemErro } from '../../../api/error-messages';
import { useEsperaRestante } from '../../../shared/hooks/useEsperaRestante';
import type { DadosLogin } from '../hooks/useLogin';

interface LoginFormProps {
  tenants: readonly string[];
  enviando: boolean;
  erro: unknown;
  onEntrar(dados: DadosLogin): void;
}

export function LoginForm({ tenants, enviando, erro, onEntrar }: LoginFormProps) {
  const [tenantId, setTenantId] = useState(tenants[0] ?? '');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const campoSenha = useRef<HTMLInputElement>(null);
  const espera = useEsperaRestante(erro);

  useEffect(() => {
    if (erro) campoSenha.current?.focus();
  }, [erro]);

  function enviar(evento: FormEvent) {
    evento.preventDefault();
    if (enviando || espera > 0) return;
    onEntrar({ tenantId, email, senha });
    setSenha(''); // a senha não fica em memória depois do envio
  }

  const mensagemErro =
    erro && espera > 0
      ? `Muitas tentativas de login. Aguarde ${espera} segundos para tentar novamente.`
      : erro
        ? getMensagemErro(erro)
        : null;

  return (
    <form className="formulario" onSubmit={enviar} noValidate aria-describedby={mensagemErro ? 'login-erro' : undefined}>
      <label htmlFor="login-tenant">Órgão</label>
      <select id="login-tenant" value={tenantId} onChange={(e) => setTenantId(e.target.value)} required>
        {tenants.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <label htmlFor="login-email">E-mail</label>
      <input
        id="login-email"
        type="email"
        autoComplete="username"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <label htmlFor="login-senha">Senha</label>
      <input
        id="login-senha"
        ref={campoSenha}
        type="password"
        autoComplete="current-password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        required
      />

      {mensagemErro && (
        <p id="login-erro" className="formulario__erro" role="alert">
          {mensagemErro}
        </p>
      )}

      <button type="submit" className="botao" disabled={enviando || espera > 0 || !email || !senha}>
        {enviando ? 'Entrando…' : espera > 0 ? `Aguarde ${espera}s` : 'Entrar'}
      </button>
    </form>
  );
}
