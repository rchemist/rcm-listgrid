import { defineConfig } from 'tsup';

/**
 * ADR-0001 — 번들러 기반 dual(ESM+CJS) 산출.
 * 진입점(메인 배럴 + 서브패스 11종)마다 .js(ESM)/.cjs(CJS)/.d.ts(+.d.cts)/sourcemap을 방출한다.
 * peerDependencies + react/jsx-runtime은 절대 번들에 포함하지 않는다(external).
 */
export default defineConfig({
  entry: [
    'src/index.ts',
    'src/qr.ts',
    'src/address.ts',
    'src/api-spec.ts',
    'src/xref-price.ts',
    'src/excel.ts',
    'src/adapters/next/index.ts',
    'src/listgrid/form/SearchForm.ts',
    'src/listgrid/form/Type.ts',
    'src/listgrid/api/index.ts',
    'src/listgrid/misc/index.ts',
    'src/listgrid/ui/headless.tsx',
  ],
  format: ['esm', 'cjs'],
  // esbuild only code-splits CJS entries when explicitly asked (tsup defaults
  // splitting to ESM-only); without this every one of the 12 CJS entry
  // bundles inlines its own full copy of shared internals (Config, UIProvider,
  // etc.), which was the single largest contributor to tarball bloat.
  splitting: true,
  dts: {
    // tsup's dts rollup step does not fully inherit tsconfig.json's `target`;
    // without this override it defaults to a stricter useDefineForClassFields
    // semantics and trips TS2612 on TelephoneNumberField's `validations` field
    // override, even though `tsc --noEmit -p tsconfig.json` (target es2020) is clean.
    compilerOptions: {
      target: 'ES2020',
      useDefineForClassFields: false,
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
  external: [
    '@headlessui/react',
    '@iconify/react',
    '@tabler/icons-react',
    'date-fns',
    'file-saver',
    'next',
    'nuqs',
    'qrcode.react',
    'react',
    'react-daum-postcode',
    'react-dom',
    'react-kakao-maps-sdk',
    'react-select',
    'react-sortablejs',
    'sortablejs',
    'sweetalert2',
    'sweetalert2-react-content',
    'xlsx-js-style',
    'react/jsx-runtime',
  ],
});
