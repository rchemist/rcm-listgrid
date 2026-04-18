import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}', 'src/**/__tests__/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['src/test-setup.ts'],
    exclude: [
      'node_modules/**',
      'dist/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/listgrid/**/*.{ts,tsx}'],
      exclude: ['**/*.test.{ts,tsx}', '**/__tests__/**', 'src/_stubs/**'],
      // Baseline (alpha.45): 4.5% statements / 2.4% branches / 3.9% funcs / 4.6%
      // lines. Floors are set just below baseline so CI catches regressions.
      // v0.3 에서 점진 상향 예정.
      thresholds: {
        statements: 4,
        branches: 2,
        functions: 3,
        lines: 4,
      },
    },
  },
});
