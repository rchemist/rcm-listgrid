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
      // Baseline (v0.3 Task C, 525 tests 추가): 16.9% statements / 14.98%
      // branches / 17.97% funcs / 16.81% lines. Floors sit just below baseline
      // so CI catches regressions.
      thresholds: {
        statements: 16,
        branches: 14,
        functions: 17,
        lines: 16,
      },
    },
  },
});
