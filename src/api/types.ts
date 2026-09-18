import type { paths } from './schema';

/** Tipos derivados do contrato OpenAPI da API (gerado por `npm run api:types`). */
export type ListarProcessosResposta = paths['/processos']['get']['responses'][200]['content']['application/json'];
export type ListarProcessosQuery = NonNullable<paths['/processos']['get']['parameters']['query']>;
export type Processo = ListarProcessosResposta['data'][number];
export type ProcessoStatus = Processo['status'];

export type ObterTokenCorpo = paths['/auth/token']['post']['requestBody']['content']['application/json'];
export type TokenResposta = paths['/auth/token']['post']['responses'][200]['content']['application/json'];

export type ApiErroCorpo = paths['/processos']['get']['responses'][400]['content']['application/json'];
export type CodigoErroApi = ApiErroCorpo['error']['code'];
