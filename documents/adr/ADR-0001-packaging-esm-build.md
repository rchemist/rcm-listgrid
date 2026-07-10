# ADR-0001 — 패키징: 번들러 기반 dual(ESM+CJS) 산출 + 로드 스모크 게이트

**Status**: accepted · **Date**: 2026-07-10 · **선행**: 없음 (모든 작업의 선결, PRD 조건 C1)
**근거**: [분석 §5 패키징](../analysis/2026-07-10-zero-base-review.md), raw/critique-api-packaging, raw/map-packaging · 검증: critical 확정

## Context

- 현재 빌드는 순수 `tsc -p tsconfig.build.json`(module: esnext, moduleResolution: node). 산출물이 **확장자 없는 디렉터리 재수출**(`dist/index.js:3` `export * from './listgrid'`)로 도배돼 있고 package.json에 `"type"` 필드가 없다.
- **재현 확정**: Node 26에서 `require()`/`import` 모두 `ERR_UNSUPPORTED_DIR_IMPORT` 실패. 지금까지 은폐된 유일한 이유는 모든 소비자가 Next.js 번들러(확장자 자동 보정) 경유이기 때문.
- CI는 `test -f dist/index.js`로 파일 존재만 확인 — 로드 가능성 미검증 (.github/workflows/ci.yml:34-42).
- `moduleResolution: nodenext`를 쓰는 TS 소비자, 비번들러 환경, CJS 도구체인은 현재 전부 깨진다.
- 소스맵 미방출. `engines`/`.nvmrc` 부재로 Node 버전 의존이 강제되지 않음(Node 26에서 테스트 27건 실패 실측).

## Decision

1. **tsup 도입, dual 산출**: 각 진입점(메인 배럴 + 서브패스 12종)을 `dist/**/*.js`(ESM) + `dist/**/*.cjs`(CJS) + `.d.ts` + sourcemap으로 방출한다. exports 맵의 각 서브패스에 `import`/`require`/`types` 조건을 분리 기재한다.
2. **CSS 파이프라인 유지**: `build:styles`(concat) 방식은 검증된 자산 — 변경하지 않는다. `sideEffects` 배열 유지.
3. **환경 고정**: `"engines": { "node": ">=20" }` + `.nvmrc`(22 LTS). CI와 로컬이 같은 버전을 쓰게 한다.
4. **CI 로드 스모크 게이트**: build 후 매트릭스(Node 20/22 × require/import)로 실제 로드를 실행한다:
   `node -e "require('./dist/index.cjs')"` · `node --input-type=module -e "await import('./dist/index.js')"` + 대표 서브패스(/headless, /next 제외 — next는 peer 필요 시 skip 처리) 각 1회.
5. **publint + @arethetypeswrong/cli**를 CI에 추가해 exports 맵/타입 정합을 기계 검증한다.

## 기각한 대안

- **순수 ESM(`"type": "module"` + nodenext)**: 산출은 단순해지나 CJS 도구체인 소비자를 즉시 끊는다. 기존 소비자(edustack/GJCU)의 도구체인을 전수 확인하기 전까지 dual이 안전. v2에서 재검토 가능.
- **tsc 유지 + 확장자 후처리 스크립트**: 취약(재수출 그래프 전체를 정확히 재작성해야 함). 번들러가 정답.

## Consequences

- dist 구조가 바뀌므로 **0.4.0 (breaking 창구)** 에 실린다. deep-import(비공식) 소비자는 깨질 수 있음 — exports 맵이 원래 차단 의도였으므로 MIGRATION에 명시만 한다.
- 번들 산출로 내부 순환 의존(213건)이 "은폐"될 수 있으나 해소로 착각하지 말 것 — 순환 해소는 ADR-0003의 책임.

## 구현 계획 (sonnet 실행 가능)

1. `npm i -D tsup` → `tsup.config.ts`: entry = [src/index.ts, src/qr.ts, src/address.ts, src/api-spec.ts, src/xref-price.ts, src/excel.ts, src/adapters/next/index.ts, src/listgrid/form/SearchForm.ts, src/listgrid/form/Type.ts, src/listgrid/api/index.ts, src/listgrid/misc/index.ts, src/listgrid/ui/headless.tsx], format: ['esm','cjs'], dts: true, sourcemap: true, external: 모든 peer + react/jsx-runtime.
2. package.json: `exports` 각 항목을 `{ types, import, require }` 3-조건으로 재작성. `main`/`types`는 CJS 폴백 유지. `engines` 추가.
3. `build` 스크립트: `tsup && npm run build:styles`. `tsconfig.build.json`은 type-check 용도로 유지(`noEmit`).
4. ci.yml: Node 매트릭스 + 로드 스모크 + publint + attw 단계 추가.
5. `.nvmrc` 작성. vitest 27건 실패(jsdom×Node26 localStorage)는 .nvmrc 고정으로 우선 봉쇄하고, 별도로 jsdom 업그레이드/환경 셋업 수정을 시도한다.

## 수용 기준

- [ ] `npm pack` 후 신선한 임시 프로젝트에서: CJS `require`, ESM `import`, TS `moduleResolution: nodenext` 컴파일, Next.js(transpilePackages 없이) 빌드 — 4경로 전부 성공
- [ ] publint/attw 경고 0
- [ ] 기존 소비 패턴(main barrel + 각 서브패스 import) 전부 로드 성공 (스모크가 CI에서 상시 검증)
- [ ] tarball 크기가 현재(489KB) 대비 2.5배 이내 (dual + sourcemap 감안)
- [ ] `npm test` — .nvmrc 버전에서 930/930 green
