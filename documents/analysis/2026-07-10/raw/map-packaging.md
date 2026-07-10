> **[원자료 경고]** 2026-07-10 제로베이스 분석 워크플로우의 에이전트 산출물 원본이다. 일부 주장 심각도는 이후 적대적 검증에서 **정정**되었다 — 인용 전 반드시 [`../verification-log.md`](../verification-log.md)와 종합 보고서 [`../../2026-07-10-zero-base-review.md`](../../2026-07-10-zero-base-review.md)를 우선하라.

# 서브시스템 지도+비평: npm 패키징·빌드·배포 체계

대상: `package.json`, `tsconfig*.json`, `eslint.config.mjs`, `vitest.config.ts`, `typedoc.json`, `.npmrc`, `.github/workflows/*`, `CHANGELOG.md`, `README.md` (v0.3.25 시점)

검증 방법: 문서/설정 정독에 그치지 않고 **실제로 `npm ci` → `npm run build` → `node`로 dist import**까지 재현해 확인했다 (아래 "재현 결과" 참고).

---

## 0. 결론 먼저 (TL;DR)

`exports` 맵 서브패스 설계, `sideEffects` 명시, CSS 분리 배포, `prepublishOnly` 게이트, provenance 퍼블리시는 **중견급 이상**이다. 그런데 **가장 기본적인 "Node가 이 패키지를 import할 수 있는가"가 깨져 있다** — `package.json`에 `"type": "module"`이 없는데 `tsc`가 ESM 문법(`export`/`import`)을 방출하고, 게다가 확장자 없는 배럴 재수출(`export * from './listgrid'`)을 쓰기 때문에, Node의 네이티브 ESM/CJS 로더 어느 쪽으로도 `require`/순정 `import`가 실패한다. 이건 "이론상 문제"가 아니라 이 세션에서 직접 재현된 크래시다. Next.js/webpack처럼 자체 리졸버가 확장자를 보정해주는 번들러 아래에서만 우연히 동작하는 상태이고, `main` 필드를 통해 이 패키지를 쓰는 그 어떤 순정 Node 환경(스크립트, Jest 기본 설정, Node 네이티브 ESM 로더, 서버리스 런타임 다수)에서도 즉시 깨진다.

CI는 `dist/index.js`가 "존재하는지"만 확인하고 "import 가능한지"는 확인하지 않는다 — 그래서 이 결함이 CI를 통과한 채 0.3.25까지 누적됐다.

---

## 1. `exports` 맵 / 서브패스 설계 — 잘 만들었다 (강점)

`package.json:26-79`:

```json
"exports": {
  ".": { "types": "./dist/index.d.ts", "default": "./dist/index.js" },
  "./next": { ... },
  "./form/SearchForm": { ... },
  "./form/Type": { ... },
  "./api": { ... },
  "./misc": { ... },
  "./headless": { ... },
  "./qr": { ... },
  "./address": { ... },
  "./api-spec": { ... },
  "./xref-price": { ... },
  "./excel": { ... },
  "./styles.css": "./dist/styles.css",
  "./styles/tokens.css": "./dist/styles/tokens.css",
  "./styles/primitives.css": "./dist/styles/primitives.css",
  "./styles/layouts.css": "./dist/styles/layouts.css",
  "./styles/components.css": "./dist/styles/components.css",
  "./styles/base.css": "./dist/styles/base.css"
}
```

- 무거운 optional peer(엑셀, 카카오맵/우편번호, sweetalert2 기반 API 스펙 뷰어, QR)를 메인 배럴에서 완전히 분리하고 서브패스로 opt-in하게 만든 설계는 CHANGELOG 0.3.21(`CHANGELOG.md:28-82`)에서 "필수 peer만 설치한 consumer도 main barrel import로 빌드가 통과"하도록 명시적으로 고친 이력이 있다. 실제로 이 커밋 이후의 구조는 tanstack류 라이브러리가 하는 "코어는 얇게, 무거운 기능은 서브패스로"라는 원칙과 맞닿아 있다 — 이 리포의 몇 안 되는 "제품화 관점에서 자신 있게 잘했다"고 말할 수 있는 지점이다.
- CSS를 5개 레이어(`tokens/primitives/layouts/components/base`)로 쪼개 서브패스로 개별 노출하면서, 합본(`dist/styles.css`)도 `build:styles` 스크립트(`package.json:47`)로 같이 만들어 두 가지 소비 패턴(전체 로드 vs 레이어 선택)을 모두 지원한다.
- 다만 `"types"` 조건과 `"default"` 조건만 있고 **`"import"`/`"require"` 조건이 없다** — 이는 아래 2절의 근본 결함과 직결된다.

---

## 2. CJS/ESM — 치명적 결함 (실측 재현 완료) ★ CRITICAL

### 2-1. `package.json`에 `"type": "module"`이 없다

`package.json` 전체를 grep한 결과 `"type"` 키는 `repository.type: "git"`(`package.json:92`) 하나뿐이고, 루트 레벨 `"type": "module"` 또는 `"type": "commonjs"` 선언이 **없다**. Node.js 규약상 이 경우 `.js` 확장자는 기본적으로 **CommonJS**로 해석된다.

### 2-2. 그런데 `tsconfig.json`은 ESM만 방출한다

`tsconfig.json:5` — `"module": "esnext"`. `tsconfig.build.json`(빌드용, `noEmit: false`)은 이를 그대로 상속하며 별도의 `module` 재정의가 없다(`tsconfig.build.json:1-16`). 즉 **CJS 빌드가 전혀 존재하지 않고, tsc가 방출하는 `.js`는 순수 ESM 문법**(`export`/`import`)이다. 직접 빌드해 확인한 산출물:

```js
// dist/index.js (재현 빌드 결과, 전체)
// Public entry — re-exports the listgrid library.
// The real exports live in `./listgrid/index.ts`.
export * from './listgrid';
```

### 2-3. 실제로 Node에서 깨지는 것을 재현했다

로컬에서 `npm ci --legacy-peer-deps && npm run build`로 실제 `dist/`를 만든 뒤, **번들러를 거치지 않은 순정 Node**로 두 가지 방식 모두 시도:

```
$ node -e "require('/…/dist/index.js')"
Error [ERR_UNSUPPORTED_DIR_IMPORT]: Directory import '/…/dist/listgrid' is not supported
resolving ES modules imported from /…/dist/index.js

$ node --input-type=module -e "import('/…/dist/index.js')..."
(node:xxxxx) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///…/dist/index.js
is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /…/package.json.
ERR Directory import '/…/dist/listgrid' is not supported resolving ES modules imported from /…/dist/index.js
```

두 가지 독립적인 결함이 겹쳐 있다:

1. **`"type"` 미선언** → Node가 `.js`를 CJS로 추정하고 `require()`가 먼저 실패하며, `MODULE_TYPELESS_PACKAGE_JSON` 경고와 함께 "ESM으로 재파싱"하는 성능 페널티까지 문서화된 안티패턴을 그대로 밟는다.
2. **확장자 없는 배럴 재수출** (`export * from './listgrid'` — 디렉터리를 가리키고 `.js`도 `/index.js`도 없음, `dist/index.js:3`) → Node의 네이티브 ESM 리졸버는 디렉터리 import를 지원하지 않으므로(`ERR_UNSUPPORTED_DIR_IMPORT`) `"type": "module"`을 추가해도 여전히 깨진다. `tsc`는 `moduleResolution: "node"`(`tsconfig.json:6`)로 컴파일했을 뿐 import 경로에 확장자를 보정해 주지 않는다.

즉 **`"type": "module"`을 추가하는 것만으로는 고칠 수 없고**, 모든 상대 import에 명시적 확장자(`.js`)를 강제하는 `moduleResolution: "nodenext"` 전환 + tsc 재출력이 필요하다.

### 2-4. 왜 지금까지 아무도 이걸 못 봤나 — 번들러 뒤에 숨어 있었다

Next.js(webpack/turbopack)나 Vite 같은 번들러의 리졸버는 확장자 생략과 디렉터리 index를 스스로 보정하기 때문에, 이 리포를 **직접 소비해 온 유일한 프로젝트(원래 host Next.js 서비스)에서는 증상이 드러나지 않는다.** 하지만 이 결함은 다음 모든 시나리오에서 즉시 발현된다:
- 순정 Node 스크립트/CLI에서 이 패키지를 import (SSR 이외 용도, 배치 스크립트, 스토리북 정적 빌드 등)
- Jest(대부분 기본 CJS transform) 등 webpack이 아닌 테스트 러너로 소비 프로젝트를 테스트할 때
- Node 네이티브 ESM 로더를 쓰는 서버리스/엣지 런타임
- Vitest 등에서도 번들러 설정에 따라 이형 동작 가능

이는 "언젠가 문제가 될 잠재 리스크"가 아니라 **번들러가 없는 모든 소비 경로에서 지금 당장 깨지는 버그**이며, 상용 라이브러리로 판매/배포하려면 최우선으로 고쳐야 하는 항목이다. tanstack, react-admin류는 최소한 `tsup`/`rollup`으로 dual(CJS+ESM) 빌드를 만들거나, 최소한 순수 ESM이라면 `"type": "module"` + `"exports"`의 `import` 조건 + 확장자 보정을 정확히 갖춘다 — 이 리포는 그 셋 중 무엇도 완결돼 있지 않다.

### 2-5. CI가 이 결함을 못 잡는 이유

`.github/workflows/ci.yml:34-42`:

```yaml
- name: Verify build output
  run: |
    test -f dist/index.js
    test -f dist/index.d.ts
    test -f dist/styles.css
    ...
```

파일 **존재만** 검증하고 **import 가능 여부는 검증하지 않는다.** `node -e "require('./dist/index.js')"` 한 줄만 추가해도 이번 결함은 CI에서 즉시 잡혔을 것이다. 이것이 실제로 없다는 사실 자체가 "빌드 통과 ≠ 작동" 원칙이 이 리포의 배포 파이프라인에도 적용됨을 보여준다.

---

## 3. 소스맵 — 없음 (구멍)

`tsconfig.build.json:9-10`:

```json
"declarationMap": false,
"sourceMap": false
```

`tsconfig.json`(개발용)은 `"declarationMap": true`(`tsconfig.json:16`)지만 정작 배포 빌드(`tsconfig.build.json`)에서는 `declarationMap`과 `sourceMap` 둘 다 명시적으로 꺼져 있다. 즉 **배포된 `dist/*.js`, `dist/*.d.ts` 어디에도 원본 TS로 되짚어갈 소스맵이 전혀 없다.** 소비 프로젝트에서 이 라이브러리 내부 스택트레이스를 마주치면 (61k LOC짜리 트랜스파일된 JS를 그대로 봐야 하고) 타입 정의로 점프해도(`.d.ts` cmd+click) 원본 위치로 가지 않는다. tanstack 계열은 대부분 소스맵을 동반 배포한다 — 이 부분은 "일부러 뺀 결정"이라기보다 방치에 가깝다(주석/CHANGELOG에 이유 설명 없음).

---

## 4. peerDependencies — 15개+ 정책, 절반은 타당하고 절반은 의심스럽다

`package.json:96-114`, `peerDependenciesMeta`(`package.json:115-146`) 기준 분류:

**필수(9개)**: `react`, `react-dom`, `@headlessui/react`, `@tabler/icons-react`, `@iconify/react`, `react-select`, `react-sortablejs`(+ 전이적으로 `sortablejs`), `date-fns`
**선택(9개)**: `next`, `nuqs`, `qrcode.react`, `react-kakao-maps-sdk`, `react-daum-postcode`, `xlsx-js-style`, `file-saver`, `sweetalert2`, `sweetalert2-react-content`

선택 쪽 분리(0.3.21에서 도입, `CHANGELOG.md:28-82`)는 합리적이고 위 1절에서 칭찬한 서브패스 설계와 짝을 이룬다. 문제는 **"필수 9개" 안에 있다**:

- **아이콘 라이브러리가 두 개, 둘 다 필수다.** `@tabler/icons-react`는 `src/` 전역 44개 파일에서, `@iconify/react`는 4개 파일에서 사용된다(재현 확인: `grep -rl` 카운트). "framework-free"를 표방하는 코어 UI 엔진이 아이콘 하나 그리는 데 서로 다른 두 아이콘 생태계를 **둘 다 강제 설치**시키는 것은 번들 크기·의존성 표면 양쪽에서 나쁜 설계다. 4곳만 쓰는 `@iconify/react`를 지연 로드/서브패스로 옮기거나 tabler 하나로 통합하는 것이 상식적인데 이 정리가 안 되어 있다.
- `react-select`, `react-sortablejs`+`sortablejs`, `@headlessui/react`가 코어에 항상 필요하다는 것 자체가 "framework-free 엔진"이라는 README 카피(`README.md:3`)와 긴장 관계에 있다 — 실제로는 특정 UI 킷 조합에 강하게 결합된 엔진이고, 이것도 알려진 "새 프로젝트가 원래 host 아키텍처를 강제당한다"는 불만과 맞닿아 있다(패키징 관점에서도 같은 증상이 보인다).
- `next`/`nuqs`를 필수 목록에서 optional로 뺀 것(0.3.21)은 좋은 교정이었다.

15개+라는 숫자 자체는 "무겁지만 명시적으로 옵션 처리됐다"는 점에서 아주 나쁘진 않다 — 다만 필수 9개 중 최소 1~2개(아이콘 이중화)는 명백한 정리 대상이다.

---

## 5. `sideEffects` / tree-shaking — 방어선은 쳤으나 검증은 안 했다

`package.json:21-24`:

```json
"sideEffects": ["**/*.css", "*.css"]
```

CHANGELOG 0.3.21에 "tree-shaking 방어선"이라고 명시(`CHANGELOG.md:74`)했지만, **이 리포에는 tree-shaking이 실제로 되는지 검증하는 빌드(rollup/esbuild로 번들해서 unused export가 제거되는지 확인)가 전혀 없다.** `sideEffects` 배열이 CSS 패턴만 커버하고, 그 외 모듈에 부수효과(zustand store 초기화, 전역 registry 등록 등)가 없다는 보장은 코드 감사가 아니라 CI 어디에도 없다. `sideEffects: [...]`는 "선언"이지 "검증"이 아니다 — 번들러가 이 배열을 믿고 실제로 tree-shake했을 때 런타임이 깨지지 않는지 한 번도 실측되지 않았다.

---

## 6. 빌드 방식 — "번들러 없음"이 사실이다

`package.json:37` — `"build": "tsc -p tsconfig.build.json && npm run build:styles"`. `devDependencies`(`package.json:150-183`) 전체를 훑어도 `rollup`, `esbuild`, `tsup`, `vite`, `webpack` 등 번들러가 **하나도 없다.** 순수 `tsc` 트랜스파일이며, `src/` 트리 구조를 1:1로 `dist/`에 복제한다(파일 수 실측: `dist/*.js` 299개, `dist/*.d.ts` 299개 — `find dist -name '*.js' | wc -l` = 299).

- 장점: 트리 구조 그대로 나오므로 딥임포트 tree-shaking 관점에서 파일 단위 granularity는 오히려 세밀하다 (번들 하나로 뭉치는 것보다 유리할 수 있음).
- 단점: 위 2절의 ESM/CJS 결함이 바로 "번들러가 없어서 확장자·모듈타입 문제를 아무도 보정해 주지 않는" 데서 기인한다. tsup/rollup 같은 최소 번들러 하나만 있었어도 dual CJS/ESM 산출 + 확장자 보정이 설정 몇 줄로 해결됐을 문제다.

---

## 7. dist 위생 — 양호

- `.gitignore:8`에 `dist/`가 있어 dist가 레포에 커밋되지 않는다(정상).
- `npm pack --dry-run`으로 실측한 결과 총 608개 파일, unpacked 2.2MB, tarball 489KB — 테스트 파일(`*.test.*`)이나 `_stubs`가 tarball에 전혀 포함되지 않음을 확인(`find dist -name '*.test.*'` 결과 0건). `tsconfig.build.json:12-19`의 `exclude`가 `__tests__`/`.test.ts(x)`/`test-setup.ts`를 정확히 걸러낸다.
- `package.json:80-85`의 `"files"` 필드(`dist`, `README.md`, `LICENSE`, `docs/PRIMITIVES.md`)도 정확하고 과다 포함이 없다.
- 이 부분은 "제품화 관점에서 이미 합격점"이라고 말할 수 있는 몇 안 되는 영역이다.

---

## 8. CI/배포 파이프라인

`.github/workflows/ci.yml` 전체: install → type-check → lint → format:check → test:coverage(임계치 강제) → build → 산출물 존재 확인. 게이트 구성 자체는 표준적이고 나쁘지 않다. 다만:

- **import 스모크 테스트 없음** (2-5절 참고) — 가장 중요한 구멍.
- **matrix 없음**: Node 버전 하나(20)만 테스트한다. peerDependency로 `react >=18`을 지원한다고 주장하면서 CI는 React 19(`devDependencies`의 `react: "^19.2.1"`, `package.json:181`)로만 돌아간다 — React 18 호환성은 CI에서 전혀 검증되지 않는다. `>=18` 지원 주장과 실제 CI 검증 범위가 어긋난다.
- `publish.yml:20-28`은 태그 push 시 `npm ci` → `npm publish --provenance`로 가고, `prepublishOnly`(`package.json:44`: clean+type-check+test+build)가 다시 한번 게이트 역할을 한다 — provenance 첨부까지 하는 건 최근 npm 보안 모범 사례를 따른 것으로 평가할 만하다. 0.2.x 태그는 `legacy-0.2` dist-tag로 분리(`publish.yml:23-25`)하는 것도 세심하다.
- typedoc(`typedoc.json`)으로 `docs/api/`를 생성하지만 **CI/publish 어느 워크플로우에도 `npm run docs` 실행이나 최신성 검증이 없다** — `docs/api/`가 커밋되어 있음(`git ls-files`로 확인)에도 소스와 드리프트될 위험을 아무도 감시하지 않는다.

---

## 9. semver 규율 vs CHANGELOG 현실 — 심각한 불일치 ★ CRITICAL

`CHANGELOG.md`의 버전 헤더를 모두 추출하면:

```
0.3.22, 0.3.21, 0.3.19, 0.3.10, 0.3.7, 0.3.6, 0.3.5, 0.3.4, 0.3.3, 0.3.1, 0.2.15 … 0.2.0
```

0.x 버전의 semver 관례(`0.MINOR.PATCH`에서 **MINOR가 사실상의 "major" 슬롯**이고 PATCH는 breaking-free 수정만 담아야 함)에 따르면, breaking change는 매번 MINOR(가운데 자리, 이 경우 "3")를 올려야 한다. 그런데 실측 결과:

- `CHANGELOG.md:35` — `## [0.3.21]`의 섹션 제목이 `### Changed (BREAKING)`: peer 필수/옵션 재분류 + 서브패스 강제 이전(컨슈머 import 경로 변경 필요) → **명백한 breaking**인데 `0.3.19 → 0.3.21`, MINOR "3"는 그대로다.
- `CHANGELOG.md:198` — `## [0.3.1]`에 `### BREAKING — rcm-framework 0.1.0 endpoint 표준 정합 (Decision #31)` → 역시 MINOR "3" 안에서 발생.
- `CHANGELOG.md:397` — 더 이전 버전에도 `### BREAKING CHANGES (6)` 섹션이 있고, 마이그레이션 스크립트(`npm run type-check`로 6개 breaking 항목 진단, `CHANGELOG.md:572-579`)까지 문서화돼 있다 — 즉 이 팀은 스스로 "이건 breaking이다"라고 정확히 인지하고 기록하면서도, **버전 번호에 그 신호를 반영하지 않는다.**
- 결과적으로 `0.3.x` 라인 하나에서 최소 3회 이상의 breaking change가 관측된다(0.3.1, 0.3.3 계열, 0.3.21). semver를 곧이곧대로 따랐다면 지금 버전은 0.3.25가 아니라 0.6~0.7대 어딘가여야 한다.

**영향**: `peerDependencies`/`dependencies` range를 `^0.3.0`처럼 caret으로 고정하는 컨슈머는 npm의 caret 규칙(`0.x.y`에서는 오른쪽에서 두 번째 자리까지 고정, 즉 `0.3.y`만 허용)상 **자동으로 breaking 패치를 받아버린다.** 0.3.21의 마이그레이션 경고 문구("⚠️ 컨슈머 주의…")가 CHANGELOG에 존재한다는 것 자체가, 저자들도 이 위험을 알고 있으면서 버전 번호 규율로 방어하지 않고 "글로 경고"하는 방식에 의존하고 있음을 보여준다. 이건 상용 라이브러리라면 컨슈머의 프로덕션 빌드를 예고 없이 깨뜨릴 수 있는 배포 규율 결함이다.

---

## 10. 테스트 커버리지 게이트 — "회귀 방지"이지 "품질 기준"이 아니다

`vitest.config.ts:16-24`:

```ts
// Baseline (v0.3 Task C, 525 tests 추가): 16.9% statements / 14.98%
// branches / 17.97% funcs / 16.81% lines. Floors sit just below baseline
// so CI catches regressions.
thresholds: {
  statements: 16,
  branches: 14,
  functions: 17,
  lines: 16,
},
```

주석에 스스로 "baseline보다 살짝 낮게 뒀다"고 적혀 있다 — 즉 **커버리지를 올리라는 압력이 CI에 전혀 없고, 현재의 낮은 커버리지(약 17%)를 고착시키는 바닥선**일 뿐이다. 919+ 테스트가 있다는 숫자와 실제 커버리지 비율(17%)의 간극이 여기서 설명된다: 테스트 개수는 많아도 넓이(파일당 커버리지)가 얕다. 상용화를 노린다면 이 임계치를 "현상 유지"가 아니라 "점진 상향"으로 바꾸는 정책이 필요하다.

---

## 11. README 주장 vs 실측 — 과장은 없으나 조용히 생략된 사실이 있다

README는 ESM/CJS, 소스맵, tree-shaking 실측치에 대해 **아무 주장도 하지 않는다**(grep 결과 `README.md`/`CHANGELOG.md`에 "tree-shak" 언급은 CHANGELOG 한 줄뿐, README에는 전무). 이 자체가 문제라기보다, "프레임워크 프리"·"딥임포트 가능" 같은 인상을 주는 카피(`README.md:3, 33-40`) 대비 실제로는:
- 순정 Node로 import가 안 되고,
- 두 개의 아이콘 라이브러리를 강제하며,
- 소스맵이 없다

는 사실이 README 어디에도 언급되지 않는다. "거짓 주장"은 아니지만 **잠재 채용자가 README만 보고 판단할 경우 이 결함들을 전혀 예측할 수 없다**는 의미의 정보 비대칭이 있다.

---

## 12. 종합 판정

| 항목 | 평가 | 근거 |
|---|---|---|
| exports 맵 / 서브패스 | 우수 | §1 |
| CSS 배포 전략 | 우수 | §1, §7 |
| dist 위생 | 양호 | §7 |
| prepublishOnly / provenance | 양호 | §8 |
| **CJS/ESM 상호운용** | **치명적 결함 (실측 재현)** | §2 |
| 소스맵 | 없음 | §3 |
| peerDeps 정책 | 절반 타당·절반 정리 필요(아이콘 이중화) | §4 |
| tree-shaking 검증 | 선언만 있고 실측 없음 | §5 |
| CI 스모크 테스트 | 존재 확인만, import 검증 없음 | §2-5, §8 |
| **semver 규율** | **CHANGELOG 자체 증거로 위반 확인** | §9 |
| 커버리지 게이트 | 현상 유지용, 상향 압력 없음 | §10 |

**한 줄 요약**: 패키지 "표면"(exports 설계, dist 위생, CSS 전략)은 상용 라이브러리 흉내를 제법 잘 냈지만, "이 패키지가 실제로 어디서나 import되는가"라는 가장 기본적인 계약이 깨져 있고, 스스로 기록한 CHANGELOG가 semver 위반을 자백하고 있다. 상용화 이전에 최우선으로 고쳐야 할 것은 (1) ESM/CJS 이원화 또는 최소한 `nodenext`+확장자 보정, (2) CI에 실제 import 스모크 테스트 추가, (3) 향후 breaking change부터는 버전 번호 규율 준수(즉시 0.4.0 등으로 교정) 세 가지다.
