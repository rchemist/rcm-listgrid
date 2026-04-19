# @rcm/listgrid — 현재 상태

마지막 업데이트: 2026-04-19 (v0.3 Task E 세션 1 완료 — **설계 문서 `docs/GENERIC_DESIGN.md` 작성**. `EntityForm<T extends object = any>` + `FormField<TSelf, TValue = any, TForm extends object = any>` 구조 확정. 기본값 `any` 로 소비자 무수정 호환. 예상 any 감축 ~70~90 건. 구현은 세션 2.)

이 문서는 **작업 재개용 단일 진입점**입니다. 아키텍처 결정과 과거 맥락은 `DECISIONS.md`에 있고, 이 문서는 **지금 어디에 있고 다음에 뭘 해야 하는지**만 정리합니다.

---

## 0. 지금 당장 알아야 할 것

**배포된 현재 버전**: `v0.1.0-alpha.45` (v0.2 backlog 소진 — 테스트 포팅 마감 + `any` 정리 + `noImplicitAny: true`)

**이번 세션 성과 (v0.3 Task E 세션 1 — Generic refactor 설계)**:
- `docs/GENERIC_DESIGN.md` 작성 (11 섹션, 세션 2 구현용 단일 진입점)
- 핵심 결정:
  - `EntityForm<T extends object = any>` — 키 narrowing (`getValue<K extends keyof T & string>(name: K): Promise<T[K]>`). 기본값 any 로 `new EntityForm(...)` 무수정 호환
  - `FormField` 의 기존 F-bounded 셀프 타입을 `TSelf` 로 rename + `TValue = any, TForm extends object = any` append. 33+ concrete 서브클래스 무수정
  - `FieldValue<TValue = any>` — current/fetched/default 승격
  - Inheritance chain (EntityFormBase → ... → EntityForm 6 클래스) 전부 `<T>` 전파
  - `FieldRenderParameters<T, TValue>` 는 phase 2 (세션 2 스코프 외 — UI 컴포넌트 층 영향 폭증)
  - UIProvider `ComponentType<any>` 유지 (의도된 any, DECISIONS #21)
- gjcu 호스트 사용 패턴 측정: `new EntityForm(...)` 13 개소, `extends FormField<Self>` 1 개소 (RelatedMemoField), `entityForm.getValue('x')` 10+ 개소, cast 패턴 1 개소. **무수정 컴파일 예상**
- 예상 any 감축: 306 → ~200~230 (승격 가능 70~90 건 목록화). UIProvider wrapper / parse() / attributes 는 유지
- Breaking change 판정: 타입/런타임 모두 호환. **alpha.46 minor bump 권고**. v0.2.0 major 불필요
- 구현은 **세션 2** (1 에이전트로 충분. 5 phase 순서 엄수)

**이전 세션 성과 (v0.3 Task D — exactOpt 승격)**:
- `exactOptionalPropertyTypes: true` 승격. 430 errors → 0 (3 병렬 에이전트 + 1 재개)
  - D-1 (config/transfer/form): 151 → 0. EntityForm 29, InlineSubCollectionField 18, SubCollectionField 15, EntityFormBase 14, transfer/Type 17 등
  - D-2 (components/fields): 190 → 0 (2 분할: 101 + 89). FormField 25, SelectField 14, OptionalField 12, ManyToOneField 11 등 + abstract/ 베이스 + Xref/Address/ContentAsset 계열
  - D-3 (list+form+revision+validations+ui+adapters): 89 → 0. ViewListGrid, FieldRenderer, useEntityFormLogic 등
- 수정 패턴: TS2412 (201) — interface 옵셔널 필드에 `| undefined` 명시 / TS2375 (122) — 객체 리터럴 undefined 제거 또는 조건부 스프레드 / TS2379 (94) — 함수 인자 undefined 제거 / TS2532 (8) — narrow
- 의도된 any (DECISIONS #21/#65/Task E 대상) 는 유지. ComponentType<any> wrapper, entity 스키마 any 는 Task E generic refactor 에서 해소
- tsconfig strict 옵션 **5/5 전부 true**: strict + noImplicitAny + noImplicitReturns + noFallthroughCasesInSwitch + noUncheckedIndexedAccess + exactOptionalPropertyTypes
- 116 파일 수정 (타입 annotation only, 런타임 동작 무변경). 3 commit 블록 (D-1/D-2/D-3) + meta commit
- 모든 품질 게이트 PASS (type-check / test 900+1 / lint 0 errs / format:check / coverage 17.13% / build)

**이전 세션 성과 (v0.3 Task C — coverage 상향)**:
- **테스트**: 375 → **900 passing** + 1 todo (525 개 추가, 43 files, 3 병렬 에이전트)
  - C-1 (config/): 164 tests (Config 55, OnChangeEntityForm 22, EntityFormMethod 23, EntityTab 15, EntityFieldGroup 13 등 9 파일)
  - C-2 (form/misc/store/message/menu/router/urlState): 202 tests (misc 70, SearchForm 69, store 17, 나머지 6 영역)
  - C-3 (components/fields/abstract/): 159 tests + 1 todo (FormField 68, ListableFormField 28, OptionalField 28 등)
- **Coverage**: 8.1% → **16.9%** statements / 6.46% → 14.98% branches / 6.46% → 17.97% functions / 8.19% → 16.81% lines
  - config: 11.7% → **34.22%**
  - form: 6.97% → **94.5%** (SearchForm 96.4%)
  - misc: 6.78% → **92.4%**
  - fields/abstract: 1.18% → **60.86%**
  - store, menu, router, urlState: **100%**
- **vitest.config.ts thresholds** 상향: 8/6/6/8 → **16/14/17/16** (baseline 바로 아래)
- 모든 품질 게이트 PASS (lint 0 errors, type-check PASS, format:check 통과)

**이전 세션 (alpha.45 + 후속 정비) 성과 요약**:
- 테스트 포팅 (33 → 133), utils/common 유닛 242 추가 (→ 375), strict 옵션 4 개 승격 (noImplicitAny/Returns/Fallthrough/UncheckedIndexedAccess), ESLint v10 flat config, Prettier CI 강제, coverage 임계치 (8/6/6/8)
- 미승격: `exactOptionalPropertyTypes` (430 errs, v0.3 Task D)

**다음 세션 후보 (v0.3 잔여)**:
- **Task E 세션 2**: 구현. `docs/GENERIC_DESIGN.md` § 5 (Phase 1~5) 순서대로 1 에이전트 dispatch. § 9 의 프롬프트 사용
- **배포 판단**: Task D 의 public API 타입 확장 (`x?: T` → `x?: T | undefined`) 은 소비자 호환 (TypeScript 구문 호환 + 런타임 동일). alpha.46 배포는 선택 — gjcu 가 exactOpt 활성화 상태면 도움, 아니면 대기
- 시각 회귀 수동 검증 + Playwright 스냅샷 regression suite (DECISIONS #63 권고)

**alpha.37~40 하이라이트**:
- alpha.37: ManyToOneView 찾기 버튼 색상 + SearchBarActions 우측 정렬 fix
- alpha.38: `--rcm-color-secondary` (#805dca 보라) 토큰 추가 + ManyToOne addon 전용 rcm-* 클래스 + modal searchbar 레이아웃 fix
- alpha.39: AdvancedSearch 그리드를 container query 로 전환 (모달 2 cols cap, 풀스크린 3 cols)
- alpha.40: **Tailwind/gjcu-custom 하드코딩 전량 제거** — 3 병렬 에이전트로 list/form/fields 블록 분담, 메인이 fallback 정리. 최종 grep 검증 0건.

**CSS 최종 파일 구조** (alpha.36):
- `tokens.css` 110줄 (디자인 토큰)
- `primitives.css` 1,259줄 (22 primitive + data-attr)
- `layouts.css` 2,912줄 (구조적 composite, 377 classes) **신규**
- `components.css` 1,386줄 (component-specific 최소, 190 classes) **신규**
- `base.css` 100줄 (root/utilities/reset, 15 classes) **대폭 축소**
- 합계 5,767줄 (alpha.28 시점 ~6,200줄 대비 정돈됨, base.css 단독은 4,960 → 100)

**다음 작업**: **시각 수동 검증 필요** — HTTP 303 만으로는 시각 회귀 검출 불가. gjcu-experiment dev 서버 `localhost:9261` 에서 직접 확인:
- CardManyToOneView (alpha.35 이전과 selected/default/hover 정확도)
- RevisionField diff-indicator (warning 도트 변경됨)
- FieldSelector chip selected 색 강도
- AlertItem external link underline
- button variant (save/delete/list/close) 시각 일관성

회귀 발견 시 해당 commit 만 선택적 rollback 가능 (commit 구조: Phase 6 aggregate / Phase 7 split / Phase 8 theme 독립).

**설계 문서 3종 (다음 세션 시작 시 이것부터 읽기)**:
- `docs/REFACTOR_CURRENT_STATE.md` — 현재 CSS 인벤토리 + 문제 진단
- `docs/REFACTOR_DESIGN.md` — primitive 22종 + variant 규약 + 호스트 override 계약
- `docs/REFACTOR_PLAN.md` — Phase 0~9 단계별 계획 + **§ 다음 세션 시작 프롬프트** (맨 아래)

**alpha.20~27 세션 요약**: 라이브러리 JSX 내 Tailwind 하드코딩 413줄 → 0줄. `defaultTheme.ts` 전면 비움 (중복 클래스 적용 제거). 필드그룹 라벨/required 아이콘/탭 글자 색상/패널 좌우 패딩 등 시각 회귀 다수 수정. 하지만 그 과정에서 만들어진 627개 클래스가 다음 리팩터 대상.

---

## 1. 프로젝트 개요

**목표**: 납품 프로젝트(gjcu-academic-front)의 `packages/ui/listgrid/`를 다른 프로젝트에서도 쓸 수 있는 범용 라이브러리 `@rcm/listgrid`로 추출.

**핵심 원칙 (재확인)**:
- React 전용 (Vue/Svelte 지원 안 함)
- Next.js는 선택적 (어댑터로 분리)
- **UI 프레임워크 독립** — 라이브러리 JSX는 Tailwind utility 쓰지 않음. `rcm-*` scoped 클래스 전용.
- 호스트는 `@rcm/listgrid/styles.css` 한 줄 import로 완전 동작. Tailwind 설치/설정 필수 아님.
- 브랜드 override는 CSS 변수 (`--rcm-color-primary` 등)

---

## 2. 리포지토리 / 워크트리 구조

| 역할 | 경로 | 브랜치 |
|---|---|---|
| **라이브러리 소스** | `~/dev/rcm-listgrid` | `main` |
| **릴리즈 repo** | `~/dev/rchemist-rcm-listgrid-release` | `main` |
| **private 저장소** | github.com/rchemist/rcm-listgrid | `main` |
| **실험용 호스트** | `~/IdeaProjects/gjcu-experiment/gjcu-academic-front` | `experiment/rcm-listgrid-swap` |
| **원본 참조** | `~/IdeaProjects/gjcu-academic-backend/gjcu-academic-front` | 수정 금지 |

**실험 워크트리 dev 서버**: `localhost:9261` (env.local의 PORT=9261)

**로그인**: admin / Asdf4567!@#$ (메모리의 `reference_gjcu_dev_credentials.md`)

---

## 3. 배포 이력

| 버전 | 내용 | 현재 상태 |
|---|---|---|
| 0.1.0-alpha.15 | rcm-* 작업 진행 중, 필드그룹 타이틀/라벨/helpText 등 교체 완료 | 직전 안정 |
| 0.1.0-alpha.16 | ❌ Tailwind CLI 시도 — 호스트 CSS 전부 깨먹음 | revert됨 |
| 0.1.0-alpha.17 | ❌ Tailwind utilities-only — cascade 충돌 여전, login 페이지 레이아웃 깨짐 | revert됨 |
| 0.1.0-alpha.18 | revert: Tailwind CLI 제거, alpha.15 상태로 복귀 | 안정 |
| 0.1.0-alpha.19 | Top offender rank 1,2: TableSubCollectionView + CardSubCollectionView rcm-subcollection-* 전환 | ✅ 안정 |
| 0.1.0-alpha.20~27 | 라이브러리 JSX Tailwind 하드코딩 413줄 → 0줄. defaultTheme 전면 비움. 필드그룹/required/탭 등 회귀 수정 | ✅ 안정 |
| 0.1.0-alpha.28 | CSS 리팩터 Phase 1 — `styles/primitives.css` 신규 (~1,250줄, 22 primitive + data-attr variants). JSX/TS 무변경. dormant | ✅ 안정 |
| 0.1.0-alpha.29 | CSS 리팩터 Phase 2 — Button / Icon-button JSX 를 data-attr primitive 로 전환. 18 파일 | ✅ 안정 |
| 0.1.0-alpha.30 | CSS 리팩터 Phase 3 — Input/Textarea/Select JSX → primitive | ✅ 안정 |
| 0.1.0-alpha.31 | CSS 리팩터 Phase 4 부분 — icon-frame + notice JSX 전환 | ✅ 안정 |
| 0.1.0-alpha.32 | CSS 리팩터 Phase 5 부분 — ViewTab data-state 전환 | ✅ 안정 |
| 0.1.0-alpha.33 | CSS 리팩터 Phase 6 1차 — dead CSS 삭제. base.css 4,960 → 4,896 (−64) | ✅ 안정 |
| 0.1.0-alpha.34 | CSS 리팩터 Phase 6 2차 — icon-btn 전환 묶음 (FilterDropdown/AlertItem/Alerts/PhoneNumber/Copy) | ✅ 안정 |
| 0.1.0-alpha.35 | CSS 리팩터 Phase 6 3차 — ContentAssetItem remove 버튼 → rcm-icon-btn data-color="error". RevisionField badges/chips → rcm-badge + rcm-tag data-color. base.css ~4,780 → ~4,740 | ✅ 안정 |
| 0.1.0-alpha.36 | 한 턴 대규모 완료 — Phase 6 잔여 8 블록 병렬 + Phase 7 파일 분리 + Phase 8 theme cleanup | ✅ 안정 |
| 0.1.0-alpha.37 | 시각 회귀 1차 fix — ManyToOneView 찾기 버튼 색/크기 + SearchBarActions 우측 정렬 | ✅ 안정 |
| 0.1.0-alpha.38 | 시각 회귀 2차 fix — --rcm-color-secondary 토큰 (#805dca 보라) + ManyToOne addon 재구현 + modal searchbar 레이아웃 | ✅ 안정 |
| 0.1.0-alpha.39 | AdvancedSearch 그리드 container query 전환 (모달 2 cols cap) | ✅ 안정 |
| 0.1.0-alpha.40 | **framework-free 달성** — JSX 잔여 Tailwind/gjcu-custom 하드코딩 전량 제거. 3 병렬 에이전트 (list/form/fields). 최종 grep 0건. 신규 rcm-* 규칙 ~30개 추가. | ✅ 안정 |
| 0.1.0-alpha.41 | rcm-button:disabled 를 opacity 기반으로 변경 (variant 색 유지) | ✅ 안정 |
| 0.1.0-alpha.42 | components.css 의 중복 .rcm-button 블록 제거 — primitives 단일 소스 | ✅ 안정 |
| 0.1.0-alpha.43 | CSS 중복 3 개 제거 + indigo 토큰화 + 다크 모드 토큰 + docs/PRIMITIVES.md (272줄) | ✅ 안정 |
| 0.1.0-alpha.44 | **OSS 공개 준비 완료** — Apache-2 LICENSE, vitest/@testing-library 설치 + 33 tests pass + jest→vi 포팅, GitHub Actions CI (type-check/lint/test/build/dist 검증), ESLint + Prettier 구성, 소비자용 README 재작성 + 내부 로드맵은 docs/ROADMAP.md 로 분리, console.log/debug 69 → 9, @ts-ignore 3 → 0, 루트 아티팩트 정리 + gitignore 보강, package.json license/private/description/keywords 정리. | ✅ 안정 |
| **0.1.0-alpha.45** | **v0.2 backlog 소진** — (1) 테스트 포팅 5 파일 완성 (33 → 133 tests pass, vitest.config.ts exclude 0) (2) `any` 정리 459 → 328 (B-1/B-2/B-3 3 병렬 에이전트, 영역별 분담) (3) `tsconfig.json` `noImplicitAny: true` 승격 + 40 개 TS7006/TS7031 에러 수정 (20 파일). 블록별 commit 분리 (test / refactor-any / feat-types / bump). | ✅ **현재 설치 대상** |

---

## 4. 이미 완료된 rcm-* 전환 (유지되어 있음)

### 테마 파일 (중립화 완료)
- `src/listgrid/components/list/themes/defaultListGridTheme.ts` — ListGrid 기본 테마 전면 rcm-*
- `src/listgrid/components/list/themes/variants/{main,modal,subCollection}Theme.ts` — variant 3종
- `src/listgrid/components/form/themes/defaultTheme.ts` — EntityForm 기본 테마

### 개별 컴포넌트 완료
- `InlineSubCollectionField` / `CardSubCollectionField` / `TableSubCollectionField` 로딩 스피너
- `DataExporter` / `ExcelPasswordField` / `DynamicDataImporter`
- `ViewEntityFormSkeleton` / `ViewListGridSkeleton` (rcm-skeleton 시스템)
- `ViewFieldGroup` 타이틀/description/collapse
- `FieldRenderer` 라벨/required/dirty/tooltip/value
- `ViewHelpText` / `ViewHelpIcon` / `ViewFieldError`
- `ViewEntityFormButtons` 우측 정렬
- `ViewEntityForm` panel 구조 (rcm-form-panel/inner)
- `PhoneNumberFieldView` copy/SMS 버튼
- `SaveButton` / `DeleteButton` / `ListButton` / `ClosePopupButton` 스타일

### CSS 시스템 완성
- `src/listgrid/styles/tokens.css` — 디자인 토큰 (색/폰트/간격/radius/shadow/z-index)
- `src/listgrid/styles/primitives.css` — **alpha.28 신규** — 22 primitive + data-attr variants (~1,253줄, dormant)
- `src/listgrid/styles/base.css` — scoped `rcm-*` 클래스 + @layer 제거 + form/fieldgroup/tab/notice/skeleton/button/input-group 등 (4,960줄, Phase 6~7 에서 대폭 슬림화 예정)
- `utils/classNames.ts` — mergeSlot/resolveSlots 헬퍼

### CSS 리팩터 진행 (docs/REFACTOR_*.md)
- ✅ Phase 0 — Phase 0 의 4개 결정 확정 (icon size xs=12/sm=14/md=16/lg=20/xl=24 ; `rcm-input-group` 과 `rcm-button-group` 둘 다 primitive 유지 ; Skeleton primitive + subcollection 쉘 layouts.css 분리 ; breakpoint 768 주 사용)
- ✅ Phase 1 (alpha.28) — `primitives.css` 작성 + `index.css` 에 import + `build:styles` 에 concat 추가. JSX 한 줄도 변경 없음. 기존 base.css 와 선택자 중복 시 cat 순서(tokens → primitives → base) 상 base 가 이기도록 설계 → 시각 회귀 없음.
- ✅ Phase 2 (alpha.29) — 18 JSX 파일의 `rcm-button-{primary,outline,outline-danger,danger,secondary,sm,icon}` → `rcm-button data-variant=... data-color=... data-size=...` 전환. `rcm-card-item-action-btn*` → `rcm-icon-btn data-size="sm" data-color="error"`. 테마 파일은 Phase 8 유예.
- ✅ Phase 3 (alpha.30) — JSX 의 `rcm-field-input` / `rcm-field-select` / `rcm-field-textarea` / `rcm-quick-search-input` → `rcm-input` / `rcm-select` / `rcm-textarea` primitive. 5 파일. primitives.css `rcm-input/textarea/select` 디폴트 font-size → sm, focus border-color → primary (현재 시각에 맞춤). Input group 내부 버튼 (addon) 은 Phase 5 에서 처리.
- ✅ Phase 4 (alpha.31, 부분) — icon-frame + notice JSX 전환. Bool/Num/Date/Select/String/ManyToOne 필드의 `rcm-bool-icon-frame*` / `rcm-num-icon-frame*` / `rcm-date-icon-frame*` → `rcm-icon-frame [data-color]`. `rcm-bool-icon*` / `rcm-num-icon-*` / `rcm-date-icon` → `rcm-icon [data-size][data-tone][data-color]`. `rcm-bool-label*` → `rcm-text [data-weight][data-color][data-tone]`. DataExporter notice → data-tone. primitives.css 의 `rcm-icon-frame` 디폴트 shape → rounded + bg surface-muted, `rcm-text` 디폴트 → inherit (font-size/color 등). 테마 파일 / AlertItem / fieldgroup card 등 잔여 composite 은 Phase 5~6 에서.
- ✅ Phase 5 (alpha.32, 부분) — `ViewTab.tsx` 에서 `rcm-tab-selected` / `rcm-tab-disabled` 하드코딩 제거 → `data-state="selected"|"disabled"`. 나머지 dropdown/card-item-tab 은 composite 제거와 동반 처리 예정.
- ✅ Phase 6 1차 (alpha.33) — FormField.tsx `rcm-bool-icon` 잔여 JSX 수정 + dead CSS 삭제. base.css 4,960 → 4,896.
- ✅ Phase 6 2차 (alpha.34) — icon-btn 전환 묶음. base.css −116.
- ✅ Phase 6 3차 (alpha.35) — ContentAsset remove + Revision badge/tag. base.css −40.
- ✅ **Phase 6 잔여 병렬 (alpha.36)** — 8 블록 병렬 에이전트 dispatch 로 CardM2O/CardItem/AdvSearch/Revision/FieldSelector/DataImport/ContentAsset/Alerts 잔여 composite → primitive. base.css −360.
- ✅ **Phase 7 (alpha.36)** — base.css 를 `layouts.css` + `components.css` + `base.css(utilities only)` 3개 파일로 분리. cascade 순서 `tokens → primitives → layouts → components → base`. rule-level diff 0 (645 selector+body multiset match).
- ✅ **Phase 8 (alpha.36)** — theme 파일의 legacy button variant string("rcm-button rcm-button-primary" 등) → "rcm-button". JSX consumers 에 data-attr 직접 적용. components.css 의 .rcm-button-* variant 규칙 완전 삭제 (−70). grep 검증 0 references.
- ⏳ Phase 9 — 시각 수동 검증 + v0.2 major bump 준비 (deprecated theme slot 제거, primitives 튜닝 제안 반영)

### GlobalModalManager 포팅
- `src/listgrid/ui/GlobalModalManager.tsx` — ManyToOneField 모달 렌더러

### FileFieldValue 완전 포팅
- `src/listgrid/ui/UIProvider.tsx` — 원본 메서드 전부 (isDirty/clone/addNewValue/...)

### 테마 신호: blue primary
- `--rcm-color-primary: #2563eb` (Mantine/MUI/Chakra 스타일)

---

## 5. 남은 작업 — rcm-* 전수 마이그레이션

### 통계
- 비-rcm className 현재 **~409줄 / 61 파일** (실측 명령어는 섹션 9 참조)
- 이 중 상당수는 `className={cn('하드코딩-tailwind', classNames.X)}` 패턴 — 하드코딩 Tailwind 부분 제거해야 함

### 전체 대상 파일 (Top offenders, 수작업 순서)

| Rank | 파일 | 스타일 줄 수 |
|---|---|---|
| ~~1~~ | ~~`components/list/ui/TableSubCollectionView.tsx`~~ | ✅ alpha.19 |
| ~~2~~ | ~~`components/list/ui/CardSubCollectionView.tsx`~~ | ✅ alpha.19 |
| 3 | `components/fields/view/CardManyToOneView.tsx` | 38 |
| 4 | `components/list/AdvancedSearchFormV2.tsx` | 29 |
| 5 | `components/list/ui/CardItem.tsx` | 28 |
| 6 | `components/fields/contentasset/components/ContentAssetItemUI.tsx` | 21 |
| 7 | `components/revision/RevisionField.tsx` | 20 |
| 8 | `components/list/ui/FieldSelector.tsx` | 19 |
| 9 | `transfer/DataImportSample.tsx` | 15 |
| 10 | `components/list/ui/CardFieldSection.tsx` | 14 |
| 11 | `components/fields/view/SmsModal.tsx` | 13 |
| 12 | `components/fields/view/ManyToOneView.tsx` | 11 |
| 13 | `components/form/ViewEntityForm.tsx` | 10 (잔여) |
| 14 | `components/fields/view/ManyToOneMultiFilterView.tsx` | 10 |
| 15 | `components/fields/view/PhoneNumberListView.tsx` | 8 |
| 16 | `components/fields/view/LinkFieldView.tsx` | 8 |
| 17 | `components/fields/contentasset/components/AddContentDialog.tsx` | 8 |
| 18 | `components/list/ui/FilterDropdown.tsx` | 7 |
| 19 | `components/form/ui/AlertItem.tsx` | 7 |
| 20 | `components/fields/BooleanField.tsx` | 7 |
| ... | (추가 43 파일, 각 1~6 줄) | ~245 |

### 접근 방법

**각 파일당 수행**:
1. 파일 열고 `className=` 모든 줄 확인
2. Tailwind utility → rcm-* 시맨틱 또는 레이아웃 클래스로 교체
3. 필요한 rcm-* 클래스가 base.css에 없으면 추가
4. `cn('tailwind 하드코딩', classNames.X)` 패턴의 Tailwind 부분 제거
5. 복잡한 커스텀 스타일(`bg-[#fafafa]`, `h-[30px]` 같은 arbitrary)은 inline style로 옮기거나 신규 rcm-* 클래스 생성

**주의 포인트**:
- `lg:col-start-1`, `col-span-full` 같은 grid 관련: 이미 `rcm-col-span-full`, `rcm-col-start-1-lg` 존재
- `md:flex`, `md:justify-end`: 이미 `rcm-form-buttons-row` 같은 시맨틱 클래스에 흡수됨
- `panel`, `btn btn-primary`, `btn-outline-primary` (gjcu 커스텀): rcm-fieldgroup, rcm-button 시리즈로 교체

---

## 6. 자주 쓰는 명령어

### 라이브러리 개발 (`~/dev/rcm-listgrid`)
```bash
npm run type-check          # tsc --noEmit
npm run build               # tsc + copy CSS → dist/
echo "0.1.0-alpha.X" | ./deploy.sh   # 버전 bump + release repo push
git push origin main        # private repo에 소스 push
```

### 실험 워크트리 (`~/IdeaProjects/gjcu-experiment/gjcu-academic-front`)
```bash
# alpha.X 재설치 (lockfile 리셋 필수)
sed -i '' 's|v0.1.0-alpha.OLD|v0.1.0-alpha.NEW|' apps/admin/package.json
rm -rf node_modules/@rcm package-lock.json
npm install --legacy-peer-deps

# dev 서버 재시작 (9261 포트)
lsof -ti:9261 | xargs kill -9 2>/dev/null
rm -rf apps/admin/.next
cd apps/admin && NODE_OPTIONS='--max-old-space-size=8192' npx next dev --turbo -p 9261
```

### 남은 Tailwind 줄 수 체크
```bash
cd ~/dev/rcm-listgrid/src && \
  grep -rEc 'className="[^"]*\b(bg-|text-|flex|grid|p-[0-9]|m-[0-9]|w-|h-|rounded|border|shadow)[^"]*"' \
  --include="*.tsx" 2>/dev/null | awk -F: 'BEGIN{c=0} {if($2>0) c+=$2} END{print c}'
```

### Playwright 시각 검증
1. MCP 도구 로드: `ToolSearch "select:mcp__playwright__browser_navigate,..."`
2. 로그인 페이지 캡처 (변경 전후 비교용)
3. `/academic/course`, `/academic/admission/homepage/notice`, detail 페이지 각각 확인

---

## 7. 사용자와의 합의된 설계 원칙 (중요!)

1. **절대 호스트에게 Tailwind 강요 금지**. alpha.16/17의 Tailwind CLI 방향은 **잘못된 시도**로 판명되어 revert됨. 다시 시도하지 말 것.
2. **Library JSX는 Tailwind utility 쓰지 않음**. 모든 스타일은 `rcm-*` scoped 클래스.
3. **cascade 충돌 원천 차단**: 호스트와 같은 namespace(`flex`, `hidden` 등) 절대 재정의 안 함.
4. **느리더라도 수작업 전수 마이그레이션이 유일 정답**. 지름길 없음.

---

## 8. 재개 시 체크리스트

1. 이 STATUS.md 끝까지 읽기
2. `~/dev/rcm-listgrid`: `git log --oneline -10` 로 최근 작업 확인
3. 실험 워크트리에 alpha.18 설치되어 있는지 확인:
   ```bash
   grep version ~/IdeaProjects/gjcu-experiment/gjcu-academic-front/node_modules/@rcm/listgrid/package.json
   ```
4. dev 서버 상태: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:9261`
5. 서버 안 뜨면 섹션 6의 "dev 서버 재시작" 실행
6. **본 작업 시작**: 섹션 5의 Top offenders 중 rank 1번 파일부터 순차 rcm-* 교체

---

## 9. 참고 자료

- `DECISIONS.md` — 설계 결정 이력 #1~#58
- 메모리: `~/.claude/projects/.../memory/`
  - `project_rcm_listgrid_extraction.md`
  - `feedback_long_session_style.md` — "끝까지 밀어붙이기"
  - `reference_gjcu_dev_credentials.md` — 로그인
- 이전 세션 전체 transcript: `~/.claude/projects/.../{session-id}.jsonl`
