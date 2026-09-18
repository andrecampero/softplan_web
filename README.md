# softplan_web — 1DOC: consulta de processos

## 1. Objetivo

O **1DOC** é uma plataforma SaaS de gestão de documentos e trâmites usada por governos
municipais e estaduais. Uma nova camada de API
([softplan_api](https://github.com/andrecampero/softplan_api)) está substituindo aos poucos
o backend legado.

Esta é a **interface React para servidores públicos consultarem os processos** do seu
órgão. A tela faz login, lista os processos (título, status e data de criação) e filtra
por status, consumindo o contrato OpenAPI da nova API de ponta a ponta.

> Regras de arquitetura, estado, erros e acessibilidade estão no [CLAUDE.md](CLAUDE.md).

## 2. Stack

Node.js 22 (ver `.nvmrc`) · React 19 · TypeScript · Vite · TanStack Query · React Router ·
Vitest + Testing Library + MSW · ESLint (com `jsx-a11y`).

## 3. Pré-requisitos

- Node.js 22 e npm.
- **A API rodando** (`softplan_api`, `npm run dev` em http://localhost:3333).
- Não é preciso Docker.

## 4. Como subir

```bash
npm install
cp .env.example .env   # os valores padrão já apontam para a API local
npm run dev            # http://localhost:5173
```

| Variável | Para quê |
|---|---|
| `VITE_API_URL` | URL da API (padrão `http://localhost:3333`) |
| `VITE_TENANTS` | Órgãos exibidos no login, separados por vírgula |

Variáveis `VITE_*` vão para o bundle e são **públicas**: nunca coloque segredos nelas. A
interface não tem credencial própria; usa apenas o token obtido no login.

Para entrar, escolha o órgão e use o e-mail e a senha de um usuário mock. As senhas estão
no `.env` da API (veja o README da API, seção 7).

## 5. Como testar

```bash
npm test             # modo watch
npm run test:ci      # todos os testes + cobertura (igual ao CI)
npm run lint         # inclui acessibilidade e proibição de localStorage/sessionStorage
npm run typecheck
npm run build
```

Os testes não dependem da API: as respostas são simuladas com MSW (`src/mocks`).

Se o contrato da API mudar, regenere os tipos com a API ao lado (`../softplan_api`):

```bash
npm run api:types    # lê ../softplan_api/openapi.json e gera src/api/schema.d.ts
```

## 6. Estrutura de pastas

```
src/api/            cliente HTTP, tipos do contrato, catálogo de mensagens de erro, QueryClient
src/features/auth/      login, sessão (em memória) e rota protegida
src/features/processos/ useProcessos, StatusBadge, ProcessoCard, FilterBar, ProcessoList, página
src/shared/         estados de carregando/erro/vazio, ErrorBoundary, hooks
src/mocks/          handlers MSW usados nos testes
```

## 7. Decisões importantes

- **Estado:** a API é a fonte da verdade. O TanStack Query cuida do cache (30 s), da
  deduplicação e do cancelamento. O filtro fica na URL (`?status=`) e é aplicado pela API.
- **Segurança:** token e dados **somente em memória**, nunca em `localStorage`,
  `sessionStorage` ou cookie. Por isso, recarregar a página (F5) pede novo login. A sessão
  expira em 1 hora.
- **Erros:** toda falha vira uma mensagem amigável: rede, 429 com contagem regressiva,
  sessão expirada e erro interno com código de suporte.

## 8. Solução de problemas

| Sintoma | Causa / solução |
|---|---|
| Tela branca e erro `VITE_API_URL não configurada` no console | Crie o `.env` (`cp .env.example .env`) e reinicie o `npm run dev` |
| "Não foi possível conectar ao servidor" | A API não está rodando ou `VITE_API_URL` está errada |
| Erro de CORS no console do navegador | Adicione `http://localhost:5173` em `CORS_ORIGIN` no `.env` da API |
| "E-mail ou senha incorretos" com a senha certa | O órgão selecionado precisa ser o do usuário (cada órgão tem sua base) |
| "Muitas tentativas de login…" | Rate limit de 5 tentativas por minuto por conta: aguarde a contagem |
| Porta 5173 ocupada | Encerre o outro processo; a porta é fixa por causa do CORS |
