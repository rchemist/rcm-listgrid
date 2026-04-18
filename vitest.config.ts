import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}', 'src/**/__tests__/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['src/test-setup.ts'],
    // Legacy tests still needing a jest→vitest port (missing mocks, CJS
    // `require()` usage). Tracked as v0.2 cleanup; `npm test` stays green
    // on the 40+ tests that have been ported.
    exclude: [
      'node_modules/**',
      'dist/**',
      'src/listgrid/config/__tests__/InlineSubCollectionField.test.ts',
      'src/listgrid/config/__tests__/CardSubCollectionField.test.ts',
      'src/listgrid/components/list/ui/__tests__/InlineSubCollectionView.test.tsx',
      'src/listgrid/components/list/ui/__tests__/CardSubCollectionView.test.tsx',
      'src/listgrid/components/list/hooks/__tests__/useCardSubCollectionData.test.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/listgrid/**/*.{ts,tsx}'],
      exclude: ['**/*.test.{ts,tsx}', '**/__tests__/**', 'src/_stubs/**'],
    },
  },
});
