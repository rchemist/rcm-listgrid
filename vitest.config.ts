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
      // Baseline (alpha.45 + utils/common tests): 8.1% statements / 6.46%
      // branches / 6.46% funcs / 8.19% lines. Floors sit just below baseline so
      // CI catches regressions. v0.3 에서 config/form/fields 영역으로 확대하며
      // 점진 상향 예정.
      thresholds: {
        statements: 8,
        branches: 6,
        functions: 6,
        lines: 8,
      },
    },
  },
});
