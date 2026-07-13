import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { 'server-only': new URL('./src/test-server-only.ts', import.meta.url).pathname },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: [
      'src/**/*.test.{ts,tsx}',
      'src/**/__tests__/**/*.{test,spec}.{ts,tsx}',
      'tests/**/*.test.{ts,tsx}',
      // P3+ re-foundation packages carry their own package-local tests
      // (transplant-faithfulness suites live beside the code they cover).
      'packages/**/*.test.{ts,tsx}',
      'packages/**/__tests__/**/*.{test,spec}.{ts,tsx}',
      // Phase TB — apps/sample mock-backend unit suites (filter/sort engine
      // fidelity to rcm-backend-framework 0.1.0). `*.test.` only, so the
      // Playwright e2e (`e2e/*.spec.ts`) is never picked up here.
      'apps/**/*.test.{ts,tsx}',
    ],
    setupFiles: ['src/test-setup.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: [
        'src/listgrid/**/*.{ts,tsx}',
        'packages/*/src/**/*.{ts,tsx}',
        // App library code runs under Vitest. Next app/ pages are exercised
        // by Playwright + `next build`; including unexecuted route TSX here
        // makes the V8 uncovered-file parser exclude them with parse errors.
        'apps/*/lib/**/*.{ts,tsx}',
      ],
      exclude: ['**/*.test.{ts,tsx}', '**/__tests__/**', 'src/_stubs/**'],
      // Baseline (v0.4 post-review hardening, 2509 tests): 45.30% statements /
      // 39.64% branches / 48.01% funcs / 44.92% lines. Floors sit just below
      // baseline so CI catches regressions across every package source tree.
      thresholds: {
        statements: 45,
        branches: 39,
        functions: 47,
        lines: 44,
      },
    },
  },
});
