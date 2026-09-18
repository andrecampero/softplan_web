import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const ARMAZENAMENTO_PROIBIDO = 'Proibido persistir dados no navegador (CLAUDE.md, seção 4.7). Mantenha em memória.';

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'node_modules', 'src/api/schema.d.ts'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-console': 'error',
      'no-restricted-globals': [
        'error',
        { name: 'localStorage', message: ARMAZENAMENTO_PROIBIDO },
        { name: 'sessionStorage', message: ARMAZENAMENTO_PROIBIDO },
        { name: 'indexedDB', message: ARMAZENAMENTO_PROIBIDO },
      ],
      'no-restricted-properties': [
        'error',
        { object: 'window', property: 'localStorage', message: ARMAZENAMENTO_PROIBIDO },
        { object: 'window', property: 'sessionStorage', message: ARMAZENAMENTO_PROIBIDO },
        { object: 'window', property: 'indexedDB', message: ARMAZENAMENTO_PROIBIDO },
        { object: 'document', property: 'cookie', message: ARMAZENAMENTO_PROIBIDO },
      ],
    },
  },
  {
    // Somente src/config.ts lê import.meta.env.
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/config.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[object.type='MetaProperty'][property.name='env']",
          message: 'Leia variáveis de ambiente apenas em src/config.ts.',
        },
      ],
    },
  },
  {
    // Testes podem inspecionar o storage para provar que ele está vazio.
    files: ['src/**/*.spec.{ts,tsx}'],
    rules: { 'no-restricted-globals': 'off', 'no-restricted-properties': 'off' },
  },
);
