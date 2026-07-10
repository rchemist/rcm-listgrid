> **[원자료 경고]** 2026-07-10 제로베이스 분석 워크플로우의 에이전트 산출물 원본이다. 일부 주장 심각도는 이후 적대적 검증에서 **정정**되었다 — 인용 전 반드시 [`../verification-log.md`](../verification-log.md)와 종합 보고서 [`../../2026-07-10-zero-base-review.md`](../../2026-07-10-zero-base-review.md)를 우선하라.

# API 표면·패키징 심판 — `@rchemist/listgrid` v0.3.25

심판 대상: 상용 라이브러리로서의 **공개 API 표면**과 **패키징/배포 계약**. 1차 입력은 `map-api-surface.md`, `map-packaging.md`, `map-providers.md` 세 지도이며, 판정의 근거가 되는 핵심 주장은 직접 재현·재확인했다(§0.1).

---

## 0. 한 줄 판정

이 패키지는 **"상용 라이브러리의 외형(exports 맵·서브패스·dist 위생·provenance)은 중견급으로 흉내 냈지만, 라이브러리의 가장 기본적인 두 계약 — (1) 어디서나 import 되는가, (2) 표면을 semver로 고정할 수 있는가 — 이 둘 다 지금 깨져 있다."** 현재 표면(배럴 580 export + 20개 통합 지점 + 9개 필수 peer)은 **그대로 semver-freeze 할 수 없고**, 표면을 대략 3분의 1로 잘라내는 **breaking v1이 불가피**하다. 다만 도려낼 대상이 어디에 몰려 있는지가 명확하고(Preset.tsx 한 파일 + 배럴의 `export *` 67개 + ApiClient 3-파일 경계), 이미 잘 만든 옵트인 서브패스 골격이 있어 — **v1 재단은 "재설계"가 아니라 "정리+확장"으로 도달 가능하다.** 즉 근본 결함이 아니라 큰 규모의 fixable 결함이다.

### 0.1 직접 재현한 것 (이 판정의 뼈대)

- **ESM/CJS 붕괴 재현 완료.** `node -e "require('./dist/index.js')"` → `ERR_UNSUPPORTED_DIR_IMPORT`. `node --input-type=module -e "import('./dist/index.js')"` → 동일하게 `ERR_UNSUPPORTED_DIR_IMPORT` + `MODULE_TYPELESS_PACKAGE_JSON` 경고. 번들러 없는 순정 Node 어느 경로로도 로드 불가를 직접 확인.
- **패키징 결함 근거 확인.** `package.json`의 루트 `"type"` 필드 부재(`grep '"type"'` → `repository.type: "git"` 한 건뿐, package.json:92), `tsconfig.json:5` `"module": "esnext"` + `:6` `"moduleResolution": "node"`, `dist/index.js:3`이 확장자 없는 디렉터리 재수출 `export * from './listgrid'`.
- **배럴 표면 확인.** `src/listgrid/index.ts` 411줄, `^export *` **67회**, "moved to opt-in subpath" 주석 8건(index.ts:239,247,254,262,280,311,315,404).
- **Envelope 결합 범위 실측.** `ResponseData`를 참조하는 소스 파일은 **10개**, 페이로드 shape(`.list`/`.content`/`.searchForm`/`isError()`)를 실제로 역참조하는 지점은 소스 기준 **form/Type.ts:144-173, config/EntityForm.tsx:176, form/Type.ts:104** — 즉 3파일에 수렴(§4).
- **필수 peer 실측.** `peerDependenciesMeta`에서 `optional:false`이거나 미표기(=기본 필수)인 것: react, react-dom, @headlessui/react, @iconify/react, @tabler/icons-react, date-fns, react-select, react-sortablejs, sortablejs = **9개**(라이브러리 peer만 세면 7개).

---

## 1. 질문 (1) — semver-freeze 가능한가? 몇 %가 죽거나 옮겨져야 하나

**결론: 현재 배럴 그대로는 freeze 불가능. breaking v1이 필수이며, 메인 배럴(`.`)에서 대략 60~65%가 잘려나가거나 서브패스로 이동해야 한다.** 다만 대부분은 "죽음"이 아니라 "이동"이다.

### 왜 지금 상태로는 freeze가 자살행위인가

1. **표면이 580개로 너무 넓다** (map-api-surface §2, TS Compiler API `getExportsOfModule()` 실측). 배럴이 `export *`를 67회 써서 `config/*`·`validations/*`·`transfer/*`·`Preset`·필드 타입·훅을 통짜로 빨아들이므로, 내부 헬퍼 시그니처 변경조차 배럴을 통해 새어나가 이론상 breaking이 된다. freeze의 전제인 "무엇이 공개 계약인지"의 경계선 자체가 없다.
2. **`@deprecated`/`@experimental` 마커가 코드베이스 전체에 0건**(map-api-surface §4, `grep -rln "@deprecated\|@experimental" src/` → 0). 폐기를 신호할 메커니즘이 아예 없어, 실제로 이미 "조용한 삭제"로 breaking을 여러 번 했다 — `QrField`/`XrefPriceMappingField`가 배럴에서 사라졌지만 리다이렉트 스텁도 deprecation도 없이 그냥 없어졌다(index.ts:239,247). 소비자는 "왜 갑자기 사라졌는지" 알 방법이 없다.
3. **호스트 도메인 잔재가 "공개 API"로 취급되고 있다.** `AdjustmentTypes`/`getAdjustmentTypeLabel`(가격 조정), `SeoMetadataFields`, `DeviceTypes`/`DeviceTypeField`(가입 채널), `MarketingField`(주문서 마케팅 문구), `PublishStatusTypes` 계열(CMS 게시 상태), 한국어 하드코딩 라벨을 가진 `NameField`/`SlugField`/`ActiveField` 등 — 전부 `Preset.tsx`(442줄) 한 파일에서 `export * from './components/fields/Preset'`(index.ts:220)로 뭉텅이째 유출(map-api-surface §3.2). **지금 freeze하면 이 도메인 쓰레기가 영구 계약이 되어, 나중에 빼는 것 자체가 또 breaking이 된다.** 방치할수록 동결 비용이 복리로 커진다.
4. **CHANGELOG가 스스로 semver 위반을 자백한다**(map-packaging §9). `0.3.x` 라인 하나에서 최소 3회의 breaking(peer 재분류·서브패스 강제 이전 `CHANGELOG.md:35`, endpoint 계약 변경 `:198`, `### BREAKING CHANGES (6)` `:397`)이 MINOR "3"을 유지한 채 발생했다. 0.x semver 규약상 breaking은 MINOR를 올려야 하므로, 규율대로였다면 지금은 0.6~0.7대여야 한다. `^0.3.0` caret 소비자는 예고 없이 프로덕션이 깨진다.

### 재단 규모 (구체 수치)

map-api-surface §8의 최소 응집 스케치를 검증하면 합리적이다:
- **코어로 남길 것 ≈ 200개** — Provider/확장점 ~30, 필드+Abstract ~45, 핵심 컴포넌트(ViewListGrid/ViewEntityForm/FieldRenderer) ~15, Config/EntityForm 도메인 타입 ~60(대부분 interface/type이라 런타임 행동 없음), Validation ~12.
- **서브패스로 이동 ≈ 30%** — 이미 옵트인된 5개(qr/address/api-spec/xref-price/excel) 외에, 호스트 프리셋을 `@rchemist/listgrid/presets`(또는 별도 패키지)로.
- **완전 삭제 ≈ 5~10%** — `AdjustmentType`·`MarketingField`·`SeoMetadataFields` 등 특정 서비스 전용 매크로. 라이브러리 계약이 될 이유가 없다.

즉 **"죽는다" 약 5~10% + "옮긴다" 약 30%**, 메인 배럴은 580 → 약 200으로 축소. 코어 200개 중 다수가 타입/인터페이스라 실제 런타임 계약 표면은 그보다 훨씬 작다 — freeze 가능한 규모다.

---

## 2. 질문 (2) — 9-필수-peer 자세는 용인 가능한가? 성숙 라이브러리는?

**결론: 용인 불가. "framework-free"를 표방하면서 필수 라이브러리 peer 7개(react/react-dom 제외)는 성숙 라이브러리 규범에서 크게 벗어난다.** 특히 **아이콘 라이브러리를 둘 다 필수로 강제하는 것은 명백한 결함**이다.

### 실측 필수 목록과 문제

필수(비옵셔널): `@headlessui/react`, `@iconify/react`, `@tabler/icons-react`, `date-fns`, `react-select`, `react-sortablejs`(+`sortablejs`) — react/react-dom을 빼면 7개.

- **아이콘 이중화**: `@tabler/icons-react`(src 전역 44파일)와 `@iconify/react`(4파일)가 **둘 다 필수**(map-packaging §4). 코어 UI 엔진이 아이콘 하나 그리는 데 서로 다른 두 생태계를 강제 설치시킨다. 4곳뿐인 iconify는 tabler로 통합하거나 서브패스로 내보내는 게 상식인데 안 되어 있다.
- **UI 킷 강결합**: `@headlessui/react`·`react-select`·`react-sortablejs`가 코어에 항상 필요하다는 것은 "framework-free 엔진"이라는 README 카피(README.md:3)와 정면 충돌한다. 정작 `UIProvider`가 이미 UI 원시 컴포넌트 65개를 host 주입으로 추상화하는데(map-providers §4), **그 추상화가 있음에도 headlessui/react-select를 여전히 라이브러리 peer로 요구**한다 — 추상화 경계와 의존성 경계가 어긋난 것이다. 이 peer들은 "기본 UI 구현"의 것이지 "엔진"의 것이 아니다.

### 성숙 라이브러리는 어떻게 하나 (규범 대조)

- **TanStack Table / react-hook-form**: 필수 peer는 `react`(+`react-dom`) **단 하나**. 헤드리스 엔진의 정석 — 렌더링 의존성을 코어에 두지 않는다.
- **react-admin**: 반대 전략 — MUI를 **peer가 아니라 번들**해 배터리 포함으로 판다. 소비자가 여러 UI peer를 손으로 배선하지 않는다.
- **공통점**: 둘 중 어느 전략이든 "소비자가 코어를 쓰기 위해 7개의 서로 다른 UI/유틸 peer를 직접 설치·버전 정합" 시키지는 않는다. listgrid는 두 전략의 나쁜 조합 — 헤드리스를 표방하면서 UI peer를 필수로 끌고 온다.

옵셔널 9개(next/nuqs/qr/kakao/daum/xlsx/file-saver/sweetalert2)를 `peerDependenciesMeta.optional`로 뺀 것(0.3.21)은 잘한 교정이다. 문제는 전적으로 **필수 7개 안**에 있다.

---

## 3. 질문 (3) — ESM/CJS/번들링 판정

**판정: 치명적 결함(CRITICAL), 실측 재현 완료. 상용화 이전 최우선 수정 대상.**

두 개의 독립 결함이 겹쳐 있다(map-packaging §2, 직접 재현):

1. **`"type"` 미선언** → Node가 `dist/*.js`를 CJS로 추정 → `require()` 실패 + `MODULE_TYPELESS_PACKAGE_JSON` 경고("ESM으로 재파싱, 성능 페널티").
2. **확장자 없는 배럴 재수출** `export * from './listgrid'`(dist/index.js:3, 디렉터리를 가리킴) → Node 네이티브 ESM 리졸버는 디렉터리 import 미지원 → `ERR_UNSUPPORTED_DIR_IMPORT`. **`"type":"module"`을 추가해도 이건 안 고쳐진다.**

핵심: `tsconfig.json:6`이 `moduleResolution:"node"`라 tsc가 상대 import에 확장자를 보정해 주지 않는다. 지금까지 안 터진 이유는 **유일한 소비처(원 host Next.js)의 webpack/turbopack 리졸버가 확장자·디렉터리 index를 대신 보정**해줬기 때문 — 번들러 뒤에 숨어 있었을 뿐이다. 순정 Node 스크립트, Jest 기본 transform, Node 네이티브 ESM 로더, 다수 서버리스/엣지 런타임에서 **지금 당장** 깨진다.

부수 결함:
- `exports` 조건이 `{types, default}`뿐 — `import`/`require` 분기 없음(package.json:27-30).
- 소스맵 전무: `tsconfig.build.json:9-10` `declarationMap:false`, `sourceMap:false` — 소비자가 라이브러리 내부 스택트레이스를 트랜스파일된 JS로만 봐야 하고 `.d.ts` cmd+click도 원본으로 안 간다. TanStack류는 소스맵을 동반 배포한다.
- 번들러 부재: devDeps에 rollup/esbuild/tsup/vite 전무(map-packaging §6). tsup 하나만 있었어도 dual(CJS+ESM)+확장자 보정+소스맵이 설정 몇 줄로 해결됐을 문제다.
- CI가 못 잡는 이유: `.github/workflows/ci.yml:34-42`가 `test -f dist/index.js`로 **존재만** 검증, import 가능 여부 미검증. `node -e "require('./dist/index.js')"` 한 줄이면 이 결함은 진작에 잡혔다.

**수정 방향**: (a) tsup/rollup 도입해 dual 산출, 또는 (b) 순수 ESM으로 갈 거면 `"type":"module"` + `moduleResolution:"nodenext"`(모든 상대 import에 `.js` 확장자 강제) + `exports.import` 조건 — 셋을 완결. 그리고 CI에 실제 import 스모크(require+import 둘 다) 추가. 소스맵 on.

---

## 4. 질문 (4) — RCM ResponseData envelope 결합: 어댑터로 고쳐지나, 만연한가?

**판정: 어댑터로 고쳐진다(adapter-fixable). 만연하지 않다.** 이건 이 심판에서 몇 안 되는 "생각보다 괜찮은" 결과다.

근거(직접 실측):
- `ResponseData`를 참조하는 소스 파일은 **10개**뿐이고, 그중 타입 정의(`api/types.ts`)·계약(`ApiClient.ts`)·배럴 재수출을 빼면 **실제 페이로드 shape를 역참조하는 지점은 3파일**: `form/Type.ts`(PageResult 역직렬화), `config/EntityForm.tsx:176`(단건 fetch), `form/Type.ts:104`(isError).
- `ResponseData` 자체는 얇은 봉투다(`api/types.ts:31-44`): `{ data, status?, error?, entityError?, isError() }`. HTTP transport는 전혀 없고 host가 `configureApiClient`로 주입한다 — **의존성 주입 경계가 이미 그어져 있다**(ApiClient.ts:10-13, JSDoc이 올바른 어댑터 예제까지 제시 — 문서화 모범 사례).
- 진짜 백엔드 결합인 페이지드-리스트 shape(`payload.list || payload.content`, `totalCount ?? totalElements`, `searchForm ?? searchRequest`)는 **`form/Type.ts:144-173` 단 한 곳**에 수렴하고, 이미 0.0.5/0.1.0/Spring `Page` 변종을 관용적으로 흡수한다(form/Type.ts:160,168-169). 즉 다른 백엔드를 붙이려면 **이 한 매핑 함수 + ApiClient 어댑터**만 바꾸면 된다. JSON:API·GraphQL·bare array를 쓰는 신규 채택자도 여기서 remap하면 코어를 건드릴 필요가 없다.

**단, 두 가지 상용화 흠**:
1. `ResponseData<T = any>`의 `any` 기본값(types.ts:31,50-51)이 "callers dereference `response.data.field` directly"를 이유로 의도적으로 유지된다 — envelope는 얇지만 그 아래 payload 타입 안전성은 0.
2. 계약이 "제네릭 어댑터 포인트"로 문서화되어 있으나 이름·주석이 여전히 "RCM-framework backend"(types.ts:1-10)에 묶여 있어, 채택자에게 "이건 우리 백엔드 전용"이라는 인상을 준다. **실체는 어댑터블인데 네이밍이 그걸 감춘다** — 코드가 아니라 표현의 문제라 저비용 수정.

**요컨대 envelope 결합은 pervasive가 아니라 3-파일 경계 문제이며, v1에서 "backend adapter" 계약으로 명시적으로 승격하면 해소된다.** ApiEnvelope 지도(map-list-runtime의 SearchForm.toJSON 백엔드 400 대응 사례)도 이 팀이 백엔드 계약을 의식하고 있음을 보여준다.

---

## 5. 질문 (5) — provider/configure* 온보딩 비용, react-admin 대비 정직한 평가

**판정: 온보딩 비용이 react-admin의 한 자릿수 배 이상 크다. 문서가 "6개 계약"이라 말하지만 실제는 20개 통합 지점이고, 그중 11개는 문서에 한 줄도 없다.**

### listgrid의 첫 렌더까지 (map-providers §2 실측)

`grep`으로 확인된 `configure*`/`register*` 모듈 전역 싱글턴 **15개** + React Context 프로바이더 4개(Auth/UI/Router/UrlState) + 수동 마운트 `GlobalModalManager` = **통합 지점 20개**. `docs/getting-started.md:52-63`은 이 중 6개만 표로 소개하고, `registerSignOut`·`registerMenuPermissionChecker`·`configureLoading`·`configureDataTransfer`·`configureAssetServerUrl` 등 **11개는 문서에 부재**(grep 0건).

최소 첫 렌더에 실제로 필요한 단계(헤드리스 UI로 최대한 줄여도):
1. `<AuthProvider>` 마운트 + Session 어댑터
2. `<UIProvider components={...}>` — **63개 필수 컴포넌트**를 채워야 타입 통과(옵셔널은 2개뿐, UIProvider.tsx:13-65). 문서 스스로 "the biggest single integration cost"라 인정(getting-started.md:143-146). headless 세트로 때울 순 있으나 그것도 채워 넣는 행위.
3. `<RouterProvider>` + 5훅/Link 어댑터
4. `<UrlStateProvider>` — **urlSync를 안 써도 강제**(useListGridUrlState가 무조건 `useQueryStates` 호출, map-list-runtime의 강제결합 스멜)
5. `configureApiClient(...)` — envelope 어댑터
6. `configureMessages(...)`
7. `configureRuntime(...)`
8. `<GlobalModalManager/>` 마운트 — 안 하면 모달이 상태만 바뀌고 렌더 안 됨(조용한 무동작, GlobalModalManager.tsx:11-14)

즉 **최소 8단계 배선 + 63-필드 UI 어댑터**. 게다가 `registerMenuPermissionChecker` 미설정 시 권한 게이트 기본값이 전면 허용(`() => 'ALL'`)이라 **경고 없이 무권한 배포**가 가능(map-providers §3.2) — 온보딩 안전성까지 나쁘다.

### react-admin 대조

- 필수 계약 사실상 **1개**: `dataProvider`. `<Admin dataProvider={...}><Resource name="posts" list={...}/></Admin>` — **10~15줄, 프로바이더 1개**로 첫 그리드가 뜬다.
- UI는 peer 배선이 아니라 **번들된 MUI**로 즉시 렌더. `authProvider`·`i18nProvider`는 선택.
- 백엔드 어댑터도 `ra-data-simple-rest`·`ra-data-json-server` 등 **기성품**이 있어 대부분 0줄.

**정직한 격차**: react-admin은 "1개 계약, ~15줄, 첫 렌더". listgrid는 "20개 통합 지점 중 최소 8개 배선 + 63-필드 UI 어댑터, 문서엔 6개만". 온보딩 비용은 **정성적으로 한 자릿수 배 이상** 크고, 그 대부분이 UIProvider(63 필수 필드)와 문서화 안 된 11개 registry에서 온다.

### 다만 공정하게 — 잘 설계된 부분

- Router/UrlState 프로바이더는 **진짜로 프레임워크 독립적**이며 최소 인터페이스(map-providers §5). Next 어댑터는 4파일 ~120줄로 작고 깨끗.
- headless UI 베이스라인(`ui/headless.tsx`)은 스텁이 아니라 실사용 가능 품질 — `stripLibraryProps`로 실전 DOM 경고까지 처리(map-providers §4.3).
- `i18n.ts`의 팩토리+identity fallback+try/catch, `AuthContext`의 `NO_PROVIDER` 심볼 구분은 사려 깊다.
- **문제는 이 설계 일관성이 나머지 14개 싱글턴엔 적용 안 됐다는 것.** `useLoadingStore`는 이름이 훅인데 구독 메커니즘이 없어 리렌더 안 되는 조용한 버그(map-providers §6). 표면이 "일관된 아키텍처"가 아니라 "잘 만든 프로바이더 4개 위에 뜯어낸 15개 registry가 누적된 것".

---

## 6. 구체 목표 — v1.0의 exports / 서브패스 / peers가 되어야 할 것

### 6.1 peers (필수를 react/react-dom으로 수렴)

```
필수(required):
  react            >=18
  react-dom        >=18
  (선택: date-fns를 dependency로 내재화하거나 유일한 필수 lib-peer로)

옵셔널 + 서브패스 스코프:
  @headlessui/react, react-select, react-sortablejs, sortablejs
      → @rchemist/listgrid/ui-default 가 소비 (엔진 코어는 UIProvider로 추상)
  @tabler/icons-react   → ui-default 또는 아이콘 서브패스 (iconify는 tabler로 통합해 제거)
  @iconify/react        → 삭제(4곳을 tabler로 통합) 또는 opt-in 아이콘 어댑터
  next, nuqs            → 이미 옵셔널 (유지)
  qrcode.react / kakao / daum / xlsx-js-style / file-saver / sweetalert2(+content)
      → 이미 서브패스 (유지)
```
목표: **엔진 코어(`.`)를 import할 때 강제되는 lib peer는 0~1개**. UI 구현 의존성은 `@rchemist/listgrid/ui-default` 서브패스로 옮겨, "헤드리스로 쓸 사람"과 "기본 UI로 쓸 사람"을 install 단계에서 분리.

### 6.2 exports / 서브패스

```
"."                         엔진 코어 — 화이트리스트 배럴(export * 67 → 명시 재수출로 축소, ~200 symbol)
"./ui-default"              headlessui/react-select/sortablejs 기반 기본 UI 구현 (신설)
"./presets"                 NameField/SlugField/PublishStatus 등 (호스트 도메인 프리셋 격리)
"./backend/rcm"             ResponseData/PageResult 매핑 = RCM 백엔드 어댑터 (envelope를 명시적 어댑터로 승격)
"./next"                    (유지)
"./qr" "./address" "./api-spec" "./xref-price" "./excel"   (유지 — 이미 잘 됨)
"./form/SearchForm" "./form/Type" "./api" "./misc" "./headless"   (유지)
"./styles*.css"             (유지 — 5레이어 분리 우수)
+ 각 조건에 "import"/"require" 분기, 소스맵 동반
```

**삭제 대상**: `AdjustmentType(s)`/`getAdjustmentTypeLabel`, `SeoMetadataFields`, `MarketingField`, `DeviceType*`, `XrefAtFieldPreset` 등 특정 서비스 전용 심볼 — presets 서브패스로도 남길 가치가 낮으면 완전 제거. 배럴에서 `export * from './config/CommonType'`(index.ts:210), `export * from './components/fields/Preset'`(index.ts:220)를 **명시 재수출로 대체**해 유출 차단.

### 6.3 규율 (freeze의 전제)

- `@deprecated` TSDoc 태그 도입 + 최소 1 MINOR 유예. `QrField`류 이동은 리다이렉트 스텁 + deprecation으로.
- 다음 breaking부터 즉시 버전 규율 준수(0.4.0으로 교정) — caret 소비자 보호.
- `npm run docs`를 CI/prepublish 게이트에 연결(현재 docs/api는 ~2개월 stale, map-api-surface §2).
- CI에 import 스모크(require+import) + Node/React 18·19 matrix 추가.

---

## 7. 종합 — fixable인가 fundamental인가

**결정적 판정: 큰 규모의 fixable. 재설계가 아니라 재단(裁斷)이다.**

- **패키징(ESM/CJS)** — 순수 fixable. tsup 도입 or nodenext+확장자 보정 + CI 스모크. 며칠 규모.
- **envelope 결합** — fixable. 3-파일 경계를 `./backend/rcm` 어댑터로 승격.
- **API 표면 축소** — fixable하지만 breaking. Preset.tsx 격리 + 배럴 화이트리스트화 + deprecation 규율. 도려낼 곳이 한 파일과 `export *` 67개에 몰려 있어 외과적 절제가 가능.
- **peer 정리** — fixable. ui-default 서브패스 신설 + iconify 제거.
- **온보딩 비용** — 절반은 fixable(문서를 20개 표면과 일치, `checkAdminMenuPermission` 중립화, `useLoadingStore` 구독형 수정), 절반은 구조적(UIProvider 63 필수 필드는 공식 어댑터/프리셋 번들 없이는 안 줄어듦 — 여기가 유일하게 "설계 결정" 급).

가장 무거운 단일 항목은 **UIProvider 63-필수-필드 온보딩**이다. 이건 exports/packaging 재단만으로는 안 없어지고, "공식 ui-default 어댑터를 번들로 제공"하는 제품 결정이 필요하다 — react-admin이 MUI를 번들한 것과 동형의 선택. 이 하나만 결단하면 나머지는 전부 기계적 정리에 가깝다.

---

## 부록 — 이미 잘 된 것 (공정성)

- **옵트인 서브패스 설계**(qr/address/api-spec/xref-price/excel + registry.ts DI): 무거운 optional peer를 코어에서 정확히 분리. TanStack류 "코어는 얇게, 무거운 기능은 서브패스" 원칙과 부합. 이 리포에서 자신 있게 잘했다고 말할 수 있는 지점(map-packaging §1, map-api-surface §5).
- **CSS 5-레이어 서브패스 + 합본**(styles/tokens·primitives·layouts·components·base + styles.css): 두 소비 패턴 모두 지원.
- **dist 위생**: tarball 489KB, 테스트/스텁 미포함, `files` 정확(map-packaging §7).
- **배포 안전장치**: `prepublishOnly`(clean+type-check+test+build) 게이트, `--provenance`, 0.2.x legacy dist-tag 분리.
- **ApiClient JSDoc**(ApiClient.ts:33-49): 계약 위반 시 실패 모드까지 예제로 남긴 문서화 모범.
- **Router/UrlState/Next 어댑터·i18n·AuthContext NO_PROVIDER**: 프레임워크 독립 설계의 실제 성공 사례.

이 강점들이 있기에 v1 재단이 "처음부터 다시"가 아니라 "잘라내고 옮기고 이름 고치기"로 도달 가능하다는 판정이 성립한다.
