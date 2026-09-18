import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
  // Sem source maps em produção (CLAUDE.md, seção 4.7).
  build: { sourcemap: false },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.spec.{ts,tsx}'],
    restoreMocks: true,
    env: {
      VITE_API_URL: 'http://api.teste',
      VITE_TENANTS: 'pref-florianopolis,pref-joinville,gov-sc',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/features/**', 'src/api/**', 'src/shared/**'],
      exclude: ['**/*.spec.{ts,tsx}', 'src/api/schema.d.ts'],
      thresholds: { lines: 80 },
    },
  },
});
