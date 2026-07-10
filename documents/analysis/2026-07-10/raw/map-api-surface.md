> **[원자료 경고]** 2026-07-10 제로베이스 분석 워크플로우의 에이전트 산출물 원본이다. 일부 주장 심각도는 이후 적대적 검증에서 **정정**되었다 — 인용 전 반드시 [`../verification-log.md`](../verification-log.md)와 종합 보고서 [`../../2026-07-10-zero-base-review.md`](../../2026-07-10-zero-base-review.md)를 우선하라.

# 공개 API 표면 전수 조사 — `@rchemist/listgrid` v0.3.25

조사 범위: `src/index.ts`, `src/listgrid/index.ts`(barrel, 411줄), 서브패스 엔트리(`src/qr.ts`, `src/address.ts`, `src/api-spec.ts`, `src/xref-price.ts`, `src/excel.ts`, `src/adapters/next/index.ts`), `docs/api/*`, `@deprecated`/`@experimental` 마커, import 그래프.

---

## 1. 요약 (TL;DR)

- 메인 배럴(`src/listgrid/index.ts` → `src/index.ts`)이 **총 580개의 최상위 심볼**을 export 한다 (TypeScript Compiler API로 `checker.getExportsOfModule()`을 직접 실행해 실측 — docs/api의 typedoc 산출물은 신뢰할 수 없어 이 값으로 대체함, §2 참조).
- 580개 중 클래스 79 / 함수 122 / 인터페이스 173 / 타입별칭 67 / 변수(상수·팩토리) 138 / enum 1 로 분해된다.
- **`@deprecated`/`@experimental` 마커가 코드베이스 전체에 단 한 건도 없다** — grep 결과 0건(`src/` 전체). 폐기 예정/실험적 API를 구분할 메커니즘이 아예 없다.
- 배럴에는 명백한 **호스트 앱(이커머스/CMS 어드민) 도메인 잔재**가 다수 섞여 있다: `AdjustmentTypes`/`getAdjustmentTypeLabel`(가격 조정 타입), `SeoMetadataFields`(meta title/description), `DeviceTypes`/`DeviceTypeField`(PC/모바일/앱 가입 채널), `MarketingField`(마케팅 메시지/링크), `XrefAtFieldPreset`("지정일" — xref 도메인), `PublishStatusTypes` 계열(등록/임시저장/폐기), `NameField`/`TitleField`/`SlugField`/`ContentField`/`ExternalIdField`/`LabelField`/`AliasField`/`ActiveField`/`HiddenField`/`PriorityField` 등. 이들은 `src/listgrid/components/fields/Preset.tsx`(442줄)와 `src/listgrid/config/CommonType.ts`(25줄) 두 파일에 몰려 있고, 배럴에서 `export * from './components/fields/Preset'`(`src/listgrid/index.ts:220`)과 `export * from './config/CommonType'`(`src/listgrid/index.ts:210`)로 통째로 새어나간다.
- **`docs/api/` 는 최신 소스와 어긋난 stale 문서다** — 마지막 재생성일 2026-04-21인데 `src/listgrid/index.ts`는 2026-06-16에 opt-in 서브패스 분리(QrField, XrefPriceMappingField 등을 배럴에서 제거)가 반영됨. 그 결과 `docs/api/listgrid/classes/QrField.md`, `XrefPriceMappingField.md`가 **더 이상 메인 배럴에 존재하지 않는데도** 문서에는 여전히 나온다. 자동 생성 문서를 그대로 "export 인벤토리"로 신뢰하면 안 된다.
- **패키징 결함**: `package.json`에 최상위 `"type"` 필드가 없고(root-level `"type"` 키 없음, 있는 것은 `repository.type: "git"` 뿐), `tsconfig.json`은 `"module": "esnext"`(`tsconfig.json:~`)로 순수 ESM 문법(`export * from ...`)을 방출한다. `main: "./dist/index.js"`, `exports` 조건도 `"default"` 하나뿐이라 `require`/`import` 조건이 분리되어 있지 않다. Node가 `.js`를 CJS로 취급하는 상태에서 `require('@rchemist/listgrid')`를 호출하면 `SyntaxError: Unexpected token 'export'`로 즉시 깨진다(번들러 경유 프로젝트에서만 우연히 동작).
- **배럴 비용**: 서브패스 opt-in(qr/address/api-spec/xref-price/excel)은 무거운 피어(sweetalert2, xlsx, kakao-map 등)를 배럴 밖으로 뺀 설계로 실제로 잘 작동한다(§5) — 이 부분은 칭찬할 만한 설계다. 그러나 `StringField` 하나만 쓰고 싶어도 여전히 `@rchemist/listgrid`에서 import해야 하고, 그 배럴은 auth/ui/message/loading/modal-store(zustand `create()` 모듈 스코프 부작용 포함)/router/urlState/api-client/40여 개 필드 컴포넌트/모든 validation/모든 config 타입을 단일 flat 그래프로 물고 있다. Tree-shaking 성공 여부는 전적으로 소비 앱의 번들러에 위임되어 있고, 라이브러리 쪽에서 이를 보장하는 장치(세분화된 서브패스, `sideEffects` 정확한 명시)가 부족하다.

---

## 2. 왜 docs/api가 아니라 TS Compiler API로 재조사했는가

`docs/api`는 typedoc(`typedoc.json`)으로 자동 생성되며 entry point는 `src/listgrid/index.ts` + `src/adapters/next/index.ts`다:

```json
// typedoc.json
"entryPoints": ["src/listgrid/index.ts", "src/adapters/next/index.ts"],
```

디렉터리별 파일 수:

```
docs/api/listgrid/classes/        82
docs/api/listgrid/type-aliases/   67
docs/api/listgrid/variables/      71
docs/api/listgrid/functions/     198
docs/api/listgrid/interfaces/    170
docs/api/listgrid/enumerations/   1
docs/api/adapters/next/*           4
```

그런데 `docs/api/listgrid/classes/QrField.md`, `docs/api/listgrid/classes/XrefPriceMappingField.md`가 존재하는 반면, 실제 `src/listgrid/index.ts`에는:

```
src/listgrid/index.ts:239: // XrefPriceMappingField moved to opt-in subpath `@rchemist/listgrid/xref-price` (sweetalert2 peer).
src/listgrid/index.ts:247: // QrField moved to opt-in subpath `@rchemist/listgrid/qr` (qrcode.react peer).
```

즉 이 두 클래스는 커밋 `3258760`(refactor(exports): leaf optional 컴포넌트를 subpath opt-in으로 분리)에서 배럴 밖으로 이동됐지만, `docs/api`는 그 이후 재생성되지 않았다:

```
$ git log -1 --format=%cd --date=short -- docs/api      → 2026-04-21
$ git log -1 --format=%cd --date=short -- src/listgrid/index.ts → 2026-06-16
```

**결론**: `docs/api`는 약 2개월 stale 하고, `npm run docs`가 릴리즈 프로세스에 강제되지 않는다(`package.json` scripts에 `docs`는 있지만 `prepublishOnly`/`release` 스크립트에서 호출되지 않음 — 아래 §6). 따라서 본 조사는 대신 TypeScript Compiler API로 `src/listgrid/index.ts`를 직접 컴파일해 `checker.getExportsOfModule()`을 호출, 배럴이 오늘 실제로 무엇을 export하는지 1차 자료로 재확인했다(스크립트: `/tmp/.../scratchpad/list-exports.cjs`, 대상 tsconfig: `tsconfig.build.json`).

실측 결과:

```
TOTAL EXPORTS: 580
alias 타입 해석 후 분류 →
  variable(const/팩토리 함수 포함): 138
  function(선언형 함수):            122
  interface:                        173
  typeAlias:                         67
  class:                             79
  enum:                               1
```

(참고: `docs/api`의 82/67/71/198/170/1 합계 589와 본 조사의 580이 다른 이유는 stale로 인한 QrField/XrefPriceMappingField류 잔존 항목 차이 + typedoc과 TS 컴파일러의 분류 기준 차이 때문 — 두 수치 모두 "약 580~590개"라는 규모 자체는 일치한다.)

---

## 3. 카테고리별 인벤토리와 "의도된 공개 API 대 유출된 내부 구현"

### 3.1 명백히 의도된 공개 API (host-agnostic, 잘 설계됨)

- **Provider 계열**: `AuthProvider`/`useSession`/`useAuth`(`src/listgrid/index.ts:6`), `UIProvider`/`useUI`(`:9`), `RouterProvider`/`useRouter`(`:78`), `UrlStateProvider`/`useQueryStates`(`:82`) — 각각 host가 구체 구현을 주입하는 확장점(injection seam) 패턴으로 일관되고, 문서 주석도 "host applications must wrap..." 식으로 의도가 명확하다.
- **필드 컴포넌트 40여 종**: `StringField`, `NumberField`, `BooleanField`, `SelectField`, `DateField` 등(`src/listgrid/index.ts:225-260`) — 이 라이브러리의 핵심 가치 제안과 정확히 일치.
- **설정/타입 배럴**: `EntityForm`, `EntityField`, `EntityTab`, `ListGrid` 등(`export * from './config/...'`, `src/listgrid/index.ts:196-208`) — 도메인 모델 자체이므로 공개되어야 함.

### 3.2 호스트 앱에서 새어나온 도메인 특화 잔재 (의심 확인됨)

증거는 모두 `export *`로 배럴에 흘러들어온다:

| 심볼 | 위치 | 성격 |
|---|---|---|
| `AdjustmentTypes`, `AdjustmentType`, `getAdjustmentTypeLabel` | `src/listgrid/config/CommonType.ts:3-25` | 가격 조정 도메인(`FIXED_PRICE`/`ADD_AMOUNT`/`OFF_PERCENT` 등) — listgrid 자체와 무관한 이커머스 개념 |
| `SeoMetadataFields` | `src/listgrid/components/fields/Preset.tsx:31-40` | `metaTitle`/`metaDescription`/`metaHeader` — 프론트 서비스 SEO 관행에 결합 |
| `XrefAtFieldPreset` | `Preset.tsx:276-285` | `xrefAt`("지정일") — xref 매핑 도메인 특정 필드 |
| `DeviceTypes`, `DeviceTypeField` | `Preset.tsx:287-301` | `PC`/`MOBILE`/`MOBILE_APP`/`UNDEFINED` 가입 채널 — 특정 서비스의 회원 가입 도메인 |
| `MarketingField` | `Preset.tsx:342-361` | `marketingMessage`/`marketingLink` — 주문서 마케팅 문구, 매우 좁은 유스케이스 |
| `PublishStatusTypes`/`DraftPublishStatusTypes`/`PublishedPublishStatusTypes`/`DiscardedPublishStatusTypes`/`PublishStatusFieldPreset`/`applyPublishStatusEntityForm` | `Preset.tsx:373-410`대 | CMS 게시 상태 워크플로 하드코딩 |
| `NameField`/`TitleField`/`SlugField`/`ContentField`/`ExternalIdField`/`LabelField`/`AliasField`/`ActiveField`/`HiddenField`/`PriorityField`/`DescriptionField` | `Preset.tsx:73-160`대 | CRUD 엔티티에서 흔한 필드지만, "라이브러리의 공개 API"라기보다 "원 서비스에서 자주 쓰던 매크로"에 가까움 — 라벨 문구가 전부 한국어 하드코딩(`'시스템 ID'`, `'가입 채널'`, `'사용 여부'` 등, `Preset.tsx:311,296,336`)이라 다국어/타 도메인 재사용 시 그대로 못 씀 |

이 전체가 `Preset.tsx` 한 파일(442줄)에 몰려 있고 배럴에서 `export * from './components/fields/Preset'`(`src/listgrid/index.ts:220`, 주석엔 `// Preset Components`라고만 표시)로 뭉텅이째 나간다 — 어떤 심볼이 "제네릭 프리셋"이고 어떤 게 "원 호스트 앱 전용"인지 export 선언만으로는 전혀 구분되지 않는다.

### 3.3 회색지대 — 프레임워크 상수처럼 보이지만 검증 필요했던 것

- `MANAGE_ENTITY_ALL/CREATE/UPDATE/NOT_DELETE`(`src/listgrid/config/Config.ts:567-589`)는 실제로는 범용 권한 프리셋(엔티티 CRUD 권한 조합)으로 도메인 종속이 아님 — 확인 결과 이 그룹은 **정상적인 공개 API**로 판단, 오탐 주의.

---

## 4. `@deprecated`/`@experimental` 마커 — 전무

```
$ grep -rln "@deprecated\|@experimental" src/   →  (0 결과)
```

580개 export 중 그 무엇도 폐기 예정이나 실험적으로 표시되지 않는다. `src/listgrid/index.ts` 안에는 "moved to opt-in subpath" 같은 **주석 기반** 이관 안내는 있지만(`:239,247,254,262,280,311,315,404`), 이는 TSDoc 태그가 아니라서 IDE 자동완성/린트/타입 경고로 전혀 드러나지 않는다. 실제로 옮겨진 지 오래된(`QrField`, `XrefPriceMappingField`) 항목들조차 `@deprecated` 리다이렉트 스텁 하나 없이 그냥 배럴에서 삭제되어, 과거 `docs/api`를 보고 있던 소비자 입장에선 "왜 갑자기 없어졌는지" 알 방법이 없다(§2).

---

## 5. 서브패스 opt-in 설계 — 잘 만든 부분

`package.json`의 `exports` 필드(§시작 부분 확인)는 무거운 피어 의존성이 필요한 컴포넌트를 별도 엔트리로 분리한다:

```
./qr        → qrcode.react
./address   → react-kakao-maps-sdk, react-daum-postcode
./api-spec  → sweetalert2, sweetalert2-react-content
./xref-price→ sweetalert2, sweetalert2-react-content
./excel     → xlsx-js-style, file-saver
```

각 엔트리(`src/qr.ts`, `src/address.ts`, `src/api-spec.ts`, `src/xref-price.ts`, `src/excel.ts`)에는 "왜 배럴에서 뺐는지"를 설명하는 주석이 붙어 있고(예: `src/address.ts:1-8` "Pulled OUT of the main barrel so that consumers who don't use the Kakao map / Daum postcode address widgets are never forced to install those peers"), `peerDependenciesMeta`에서 해당 피어들이 정확히 `optional: true`로 표시되어 실제 npm install 경험과 일치한다. `excel.ts`는 한 걸음 더 나아가 `registerExcelDataTransfer()`라는 등록 함수로 core의 `configureDataTransfer` 주입 지점(`src/listgrid/transfer/registry.ts`)에 연결한다 — 이건 옵트인 피처를 코어 확장점에 연결하는 정석적인 패턴이다. **이 설계 자체는 "잘 설계된 부분"으로 인정한다.**

다만 이 설계가 커버하는 건 "무거운 서드파티 피어가 필요한 leaf 컴포넌트" 뿐이고, 배럴에 남은 core(필드 40종 + auth + ui + router 등)는 여전히 단일 barrel(`src/listgrid/index.ts`)에 뭉쳐 있다.

---

## 6. 배럴 임포트 비용 — "필드 하나만 써도 전체가 딸려온다"

- `StringField` 하나를 쓰려면 `import { StringField } from '@rchemist/listgrid'` 외 경로가 없다(서브패스 분리는 §5의 5개 옵트인 뿐, 필드 컴포넌트 자체는 세분화되어 있지 않음).
- 이 barrel은 `export *`를 67회(`src/listgrid/index.ts`에서 `grep -c "export \*"` 실측) 사용해 `config/*`, `validations/*`, `transfer/*`, `components/fields/Preset`, 필드 타입, 훅 등을 통짜로 흡수한다.
- 배럴에 도달 가능한 모듈 중 최소 하나는 **모듈 스코프 부작용**을 갖는다: `src/listgrid/store/index.ts:8`에서 `import { create } from 'zustand'` 후 파일 레벨에서 스토어를 생성한다(`export const useModalManagerStore = create(...)` 패턴). `package.json`의 `"sideEffects": ["**/*.css", "*.css"]`는 CSS 외 모든 JS를 side-effect-free로 선언하고 있어, 공격적인 트리쉐이킹 번들러가 이 zustand 초기화 코드를 포함한 모듈을 안전하다고 오판할 여지가 있다(반대로, 실제로는 `create()` 호출 자체가 부작용이라 트리쉐이킹이 제대로 되면 이 스토어의 export 바인딩이 미사용시 제거되어도 모듈 자체의 top-level 실행 여부는 번들러 구현에 따라 달라짐 — 즉 "관대한 `sideEffects` 선언 vs 실제 초기화 부작용의 존재"가 서로 모순되어 트리쉐이킹 신뢰성이 낮다).
- **패키징 인터롭 문제**: `package.json`에 최상위 `"type"` 필드가 없다(확인: `grep -n '"type"' package.json` → 92번째 줄의 `repository.type: "git"` 뿐). `tsconfig.json`은 `"module": "esnext"`이고 `dist/index.js`, `dist/listgrid/index.js` 실물은 `export * from './listgrid';` 같은 순수 ESM 문법이다. Node.js는 `"type"` 미지정 시 `.js`를 CommonJS로 취급하므로, 번들러(webpack/vite/Next.js) 없이 순수 Node에서 `require('@rchemist/listgrid')`를 호출하면 `SyntaxError: Unexpected token 'export'`로 즉시 실패한다. `exports` 필드도 조건이 `{"types":..., "default":...}` 뿐이라 `require`/`import` 조건을 분기하지 않는다 — 현재는 "Next.js/webpack 번들 환경에서만 동작을 보장"하는 상태이고, Node 스크립트·Jest(변환 미설정)·Vitest SSR 등 순수 ESM 로더가 아닌 컨텍스트에서 깨질 수 있다. 커머셜 라이브러리라면 dual-package(cjs+esm) 또는 최소한 `"type": "module"` 명시가 필요하다.
- 필수(non-optional) 피어도 6개나 된다: `@headlessui/react`, `@iconify/react`, `@tabler/icons-react`, `react-select`, `react-sortablejs`+`sortablejs`, `date-fns`(52개 파일에서 사용 확인) — 이건 필드 1개만 쓰는 소비자도 무조건 설치해야 하는 하드 종속성이다. Opt-in 서브패스 설계(§5)가 "무거운 선택적 기능"엔 적용됐지만, "코어에 붙어 있는 무거운 필수 피어"엔 적용되지 않았다는 뜻.

---

## 7. Semver 동결 가능성 평가

현재 상태로 semver를 신뢰성 있게 운영하기는 **어렵다**:

1. **표면이 너무 넓다(580개)** — 어떤 변경이 "breaking"인지 판단할 기준선 자체가 방대해서, 사소한 내부 리팩터(예: `Preset.tsx` 안 helper 함수 시그니처 변경)도 이론적으로 배럴을 통해 새어나가 breaking이 될 수 있다.
2. **`@deprecated` 관행이 없다(§4)** — 이관/삭제가 "조용히 사라짐"으로 처리되므로(`QrField`/`XrefPriceMappingField` 사례), 실제로는 이미 여러 차례 암묵적 breaking 변경이 있었을 가능성이 높다(커밋 `3258760` "refactor(exports): leaf optional 컴포넌트를 subpath opt-in으로 분리" 자체가 exports를 줄이는 변경인데 버전 로그상 이게 major bump였는지 확인 필요 — package.json 현재 0.3.x는 아직 semver 0.x라 breaking이 minor에 허용되는 구간이긴 하다).
3. **문서(docs/api)가 소스보다 뒤처져 있다(§2)** — semver 계약을 문서로 검증할 방법이 현재 깨져 있다.
4. **도메인 잔재(§3.2)가 "공개 API의 일부"로 취급되고 있다** — 이걸 나중에 빼려면 그 자체가 breaking change가 된다. 지금 방치하면 방치할수록 동결 비용이 커진다.

**권고**: v1.0 동결 전에 (a) `Preset.tsx`의 호스트 도메인 프리셋을 별도 옵트인 서브패스(예: `@rchemist/listgrid/presets/legacy` 또는 완전 제거 후 별도 패키지)로 이관, (b) 실제 유지할 API에 대해 명시적 화이트리스트 배럴 재작성(`export *` 최소화), (c) `@deprecated` TSDoc 태그 + 최소 1마이너 유예 기간 정책 도입, (d) `docs` 생성을 `prepublishOnly`/CI 게이트에 연결.

---

## 8. 최소 응집 공개 API 스케치 (있다면 이렇게)

오늘의 580개 대신, 아래 규모로도 "프레임워크 프리 CRUD UI 엔진"의 핵심 가치는 전부 전달된다(대략적 추정치):

- Provider/확장점: Auth/UI/Message/Loading/Router/UrlState/ApiClient/RuntimeConfig — 약 30개 export
- 필드 컴포넌트 + Abstract 베이스: 약 45개
- 핵심 컴포넌트(ViewListGrid/ViewEntityForm/FieldRenderer 등): 약 15개
- Config/EntityForm 도메인 타입: 약 60개(대다수가 인터페이스/타입이라 실제 "행동"은 아님)
- Validation: 약 12개
- 나머지(Preset의 호스트 도메인 프리셋 138개 variable 중 다수, CommonType의 AdjustmentType 등)는 **별도 패키지 또는 서브패스**로 분리 가능

즉 코어는 대략 **200개 안팎**으로도 충분하고, 나머지 380개 중 상당수는 "재사용 가능한 필드/검증/타입"이라기보단 "원 서비스의 매크로 모음"이다.

---

## 9. 조사에 사용한 산출물

- `/tmp/.../scratchpad/list-exports.cjs` — TypeScript Compiler API로 `src/listgrid/index.ts`의 `checker.getExportsOfModule()` 실행, alias 해석 후 카테고리 집계
- `/tmp/.../scratchpad/export-buckets.json` — 카테고리별 전체 심볼 이름 목록(variable 138개는 §3.2 표의 근거)
- 빌드 산출물 `dist/`는 세션 중 `tsc -p tsconfig.build.json`으로 실시간 재생성해 실제 배포 형태(`dist/index.js`, `dist/listgrid/index.js`)를 직접 확인함
