import { defineConfig } from 'tsup';

/**
 * ADR-0001 — 번들러 기반 dual(ESM+CJS) 산출.
 * W7-1(2026-07-12) — published `@rchemist/listgrid` 진입점을 구 `src/` 엔진에서
 * v0.4 `packages/*` 워크스페이스로 전환(스펙 §2 subpath 계약, waves §W7 결정 1).
 * 각 subpath = 한 내부 패키지의 배럴을 한 tsup 엔트리로. `@listgrid/*` cross-package
 * import는 워크스페이스 해소→번들→`splitting`이 공유 청크로 dedup(import 재작성 불요).
 * 빈 스캐폴드(backend-rest·presets-rcm=`export {}`)는 omit-if-empty(결정 7).
 * 엔트리는 **객체 형식**(index.ts 출력명 충돌 방지 — 출력명=키).
 * peer + react/jsx-runtime은 절대 번들 금지(external).
 */
export default defineConfig({
  entry: {
    index: 'packages/react/src/index.ts',
    schema: 'packages/schema-core/src/index.ts',
    state: 'packages/state/src/index.ts',
    'ui-default': 'packages/ui-default/src/index.ts',
    'backend-rcm': 'packages/backend-rcm/src/index.ts',
    next: 'packages/next/src/index.ts',
    excel: 'packages/excel/src/index.ts',
  },
  format: ['esm', 'cjs'],
  // esbuild only code-splits CJS entries when explicitly asked (tsup defaults
  // splitting to ESM-only); without this every one of the 12 CJS entry
  // bundles inlines its own full copy of shared internals (Config, UIProvider,
  // etc.), which was the single largest contributor to tarball bloat.
  splitting: true,
  // W7-1: `@listgrid/*` cross-package 타입을 dts 롤업이 해소하도록 paths 매핑
  // (rollup-plugin-dts는 워크스페이스 심링크 대신 tsconfig paths로 소스 해소).
  dts: {
    compilerOptions: {
      target: 'ES2020',
      useDefineForClassFields: false,
      baseUrl: '.',
      paths: {
        '@listgrid/schema-core': ['packages/schema-core/src/index.ts'],
        '@listgrid/state': ['packages/state/src/index.ts'],
        '@listgrid/react': ['packages/react/src/index.ts'],
        '@listgrid/ui-default': ['packages/ui-default/src/index.ts'],
        '@listgrid/backend-rcm': ['packages/backend-rcm/src/index.ts'],
        '@listgrid/backend-rest': ['packages/backend-rest/src/index.ts'],
        '@listgrid/next': ['packages/next/src/index.ts'],
        '@listgrid/excel': ['packages/excel/src/index.ts'],
        '@listgrid/presets-rcm': ['packages/presets-rcm/src/index.ts'],
      },
    },
  },
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  // Keep mappings but drop embedded sourcesContent: dual (ESM+CJS) output
  // otherwise duplicates every source file's full text into two separate
  // .map files, which was blowing the published tarball past ADR-0001's
  // 2.5x-of-baseline budget. Consumers with the published sources (or
  // source-linked debuggers) still resolve via the map's `sources` paths.
  esbuildOptions(options) {
    options.sourcesContent = false;
  },
  // W7-1: peer는 v0.4 packages/* 실사용분으로 축소(스펙 §2 peer 열·charter C7
  // 호스트 제공 위젯이라 @headlessui/react-select/@tabler 등 구 UI peer는 미import).
  // 서브패스 특정자(react/jsx-runtime·next/navigation)는 명시(esbuild 미와일드).
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    'next',
    'next/navigation',
    'xlsx-js-style',
    'file-saver',
    'react-daum-postcode',
  ],
});
