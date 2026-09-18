/** Único ponto que lê import.meta.env (CLAUDE.md, seção 4.6). Variáveis VITE_* são públicas. */
function obrigatoria(nome: string, valor: string | undefined): string {
  if (!valor?.trim()) throw new Error(`Variável de ambiente ${nome} não configurada. Copie .env.example para .env.`);
  return valor.trim();
}

export const config = {
  apiUrl: obrigatoria('VITE_API_URL', import.meta.env.VITE_API_URL).replace(/\/$/, ''),
  tenants: obrigatoria('VITE_TENANTS', import.meta.env.VITE_TENANTS)
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean),
} as const;
