# CSS Architecture — Refactor Plan

> 2026-04-18 초안. `REFACTOR_CURRENT_STATE.md` + `REFACTOR_DESIGN.md` 읽은 뒤 이 문서 실행.
> 이 문서 맨 아래 **§ 다음 세션 시작 프롬프트** 섹션이 새 세션 단독으로 작업 시작하기 위한 진입점.

---

## 목표 요약

현재 627개 `.rcm-*` 클래스 + 4,960줄 `base.css` → primitive + data-attr 기반 **80개 이하 클래스 / 1,500줄 이하 CSS**. 시각 parity 유지.

## Phase 개요

| Phase | 작업 | 예상 변경량 | 시각 parity 검증 방법 |
|---|---|---|---|
| 0 | 설계 확정 (남겨둔 결정 4개) | 문서 수정만 | — |
| 1 | `primitives.css` 작성 (신규 22 primitive) | +700줄, src 코드 변경 없음 | 스모크 테스트 — 기존 UI 깨지지 않음만 확인 |
| 2 | Button / Icon-button 계열 → `rcm-button` + data-attr | 15+ 컴포넌트 JSX 치환 | Playwright: 모든 버튼 렌더 + hover/disabled state |
| 3 | Input / Textarea / Select / Checkbox / Radio | 10+ 파일 | Playwright: 폼 입력 + 포커스링 |
| 4 | Surface (Card / Panel / Notice / Badge / Chip / Tag) | 20+ 파일 | Playwright: alert, card item, fieldgroup 카드 |
| 5 | Navigation (Tab / Menu) + FilterDropdown | 8+ 파일 | Playwright: 탭 전환, 메뉴 열림 |
| 6 | Composite 삭제 — `rcm-card-m2o-*`, `rcm-adv-search-*`, `rcm-revision-*`, `rcm-ca-*`, `rcm-alerts-*`, `rcm-import-*` 블록 통째 제거 | `base.css` 줄 수 급감 | Playwright 전체 flow |
| 7 | `base.css` 정리 + `layouts.css` 분리 + `components.css` 슬림화 | CSS 재배치 | 시각 diff 확인 |
| 8 | `theme classNames` API 재정비 + public contract 문서화 | theme types | type-check + gjcu-experiment 빌드 |
| 9 | alpha 배포 + STATUS.md 업데이트 | 최종 배포 | 사용자 최종 확인 |

**각 Phase 끝나면 deploy.sh 로 alpha 버전 하나씩 올림**. rollback 필요 시 해당 alpha 로 되돌아갈 수 있게.

---

## Phase 0 — 설계 확정 (30분)

`REFACTOR_DESIGN.md` § 8 의 4가지 결정:

1. `rcm-button-group` vs `rcm-input-group` 명명 → **결정**: `rcm-input-group` 으로. input + trailing addon(button/copy icon) 구조가 주 use case.
2. Icon 라이브러리 size 규약 → **결정**: `rcm-icon` 에 `data-size` 로 통일. tabler/iconify 둘 다 className 으로 크기 오버라이드. 규약: `xs=10px, sm=12px, md=16px, lg=20px, xl=24px`.
3. Skeleton 통합 → **결정**: primitive `.rcm-skeleton` + `data-shape="line|circle|rect"` + `data-size`. 현재 Table/Card SubCollection skeleton 쉘 (`rcm-subcollection-skeleton-*`) 은 layouts.css 로 남김. 둘을 합성해서 사용.
4. Responsive 브레이크포인트 → **결정**: 현재 `640/768/1024/1280/1536` 이 섞여 있는데 표준화 없이 media query 에 직접 px 쓰는 지금 방식 유지 (CSS var 로 breakpoint 못 씀). 단, 규칙: 새 CSS 는 `768px` (mobile→desktop) 만 주 breakpoint 로 쓰기.

**세션 시작 시 위 4개 결정에 사용자 동의 먼저 구할 것**. 다른 의견 있으면 여기서 정정.

---

## Phase 1 — primitives.css 작성

1. 새 파일: `src/listgrid/styles/primitives.css`
2. 내용: `REFACTOR_DESIGN.md` § 2 의 22 primitive 를 모두 작성. base + data-attr variants 포함.
3. `src/listgrid/styles/index.ts` (또는 `dist/styles.css` concat 스크립트) 가 `primitives.css` 도 concat 하도록 build 스크립트 수정:
   ```json
   "build:styles": "mkdir -p dist/styles && cp src/listgrid/styles/*.css dist/styles/ && cat src/listgrid/styles/tokens.css src/listgrid/styles/primitives.css src/listgrid/styles/base.css > dist/styles.css"
   ```
4. **이 phase 에서는 src 코드 한 줄도 안 바꿈**. primitives.css 는 아직 아무도 안 씀.
5. 스모크 확인: `npm run build` 통과 + gjcu-experiment 빌드 통과.
6. **배포: alpha.28**

**Phase 1 끝난 뒤 primitives.css 는 "사용되지 않지만 전부 정의된" 상태**. 다음 phase 들이 하나씩 치환.

---

## Phase 2 — Button / Icon-button

대상 파일 (예상):
```
src/listgrid/components/
├── list/ui/HeaderActionButtons.tsx       — rcm-button → [data-variant]
├── list/ui/SearchBarActions.tsx          — rcm-button
├── list/ui/CardItem.tsx                  — rcm-card-item-action-btn* → rcm-icon-btn
├── list/ui/InlineSubCollectionView.tsx   — rcm-button
├── list/ui/buttons/PriorityButton.tsx    — rcm-button
├── list/AdvancedSearchFormV2.tsx         — rcm-button + rcm-icon-btn
├── form/ui/ViewEntityFormButtons.tsx     — rcm-button
├── form/ui/ViewEntityFormAlerts.tsx      — rcm-icon-btn (close/toggle)
├── form/ui/AlertItem.tsx                 — rcm-icon-btn (close)
├── fields/view/ManyToOneView.tsx         — rcm-button + rcm-menu-item
├── fields/view/LinkFieldView.tsx         — rcm-icon-btn
├── fields/view/CopyableTextView.tsx      — rcm-icon-btn
├── fields/view/SmsModal.tsx              — rcm-button
├── fields/view/PhoneNumberListView.tsx   — rcm-icon-btn + menu
├── fields/contentasset/components/*      — rcm-button + rcm-icon-btn
├── fields/StatusChangeReasonModal.tsx    — rcm-button
├── fields/address/PostCodeSelector.tsx   — rcm-button
├── fields/MultipleAssetField.tsx         — rcm-button
└── transfer/DataImportSample.tsx         — rcm-button
└── transfer/DataImporter.tsx             — rcm-button
```

규약:
- `rcm-button-primary` → `rcm-button data-variant="primary"`
- `rcm-button-outline` → `rcm-button data-variant="outline"`
- `rcm-button-outline-danger` → `rcm-button data-variant="outline" data-color="error"`
- `rcm-button-sm` → `rcm-button data-size="sm"`
- 아이콘 전용 버튼은 `rcm-icon-btn` 으로 (size 자동 정사각형)

각 파일 치환 후:
1. `npm run type-check`
2. Playwright 로 해당 컴포넌트 렌더되는 화면 스크린샷 + hover/disabled state 확인

**배포: alpha.29 (Phase 2 완료 시)**

---

## Phase 3 — Input / Textarea / Select / Checkbox / Radio

대상:
```
fields/view/SmsModal.tsx              — rcm-field-input → rcm-input
fields/view/DynamicSelectFieldView.tsx — loading spinner 는 skeleton primitive 로
fields/view/SelectBoxManyToOneView.tsx
fields/address/PostCodeSelector.tsx
list/ui/QuickSearchInput.tsx          — rcm-quick-search-input → rcm-input + rcm-input-group
fields/contentasset/components/AddContentDialog.tsx
fields/BirthdayField.tsx
```

규약:
- `rcm-field-input` / `rcm-quick-search-input` → `rcm-input [data-size]`
- `rcm-field-input-disabled` → native `disabled` attr + `[data-state="disabled"]` (필요시)
- `rcm-field-textarea` → `rcm-textarea`
- `rcm-field-select` → `rcm-select`

**배포: alpha.30**

---

## Phase 4 — Surface (Card / Panel / Notice / Badge / Chip / Tag)

대상:
- `rcm-notice-info/warning/error/success` → `rcm-notice [data-tone]`
- `rcm-alert-item` → `rcm-notice` 흡수 (alerts 컨테이너는 layouts.css)
- `rcm-bool-icon-frame*` + `rcm-num-icon-frame*` + `rcm-date-icon-frame*` → `rcm-icon-frame [data-color] [data-size]`
- `rcm-bool-label*` → 제거, `<span className="rcm-text" data-color="..." data-tone="emphasis">` 로
- `rcm-card-m2o-badge*`, `rcm-field-selector-count`, `rcm-revision-badge*` → `rcm-badge [data-color]`
- `rcm-m2o-multi-chip`, `rcm-revision-diff-label-chip` → `rcm-chip [data-color]`
- `rcm-fieldgroup` 의 card/panel 스타일 → `rcm-panel` 조합
- `rcm-card-item` → `rcm-card` + hover state

**배포: alpha.31**

---

## Phase 5 — Tab / Menu / FilterDropdown

대상:
- `rcm-tab-list` / `rcm-tab` / `rcm-tab-selected` / `rcm-tab-disabled` → `rcm-tab-list` primitive + `rcm-tab [data-state="selected|disabled"]`
- `rcm-m2o-dropdown-*` + `rcm-phone-list-dropdown-*` → `rcm-menu` + `rcm-menu-item`
- `rcm-filter-dropdown-*` → `rcm-popover` (신규 primitive) + `rcm-menu`
- `rcm-card-item-tab*` → primitive tab 재사용

**배포: alpha.32**

---

## Phase 6 — 대규모 composite 블록 삭제

각 대상 블록을 **한 번에 하나씩** 처리. 파일 수정 → 시각 확인 → commit → 다음.

순서:
1. `rcm-card-m2o-*` (CardManyToOneView) — 29 클래스 삭제
2. `rcm-card-item-*` (CardItem) — 29 클래스 삭제
3. `rcm-adv-search-*` + `rcm-adv-search-legacy-*` — 37 클래스 삭제
4. `rcm-revision-*` + `rcm-revision-diff-*` (RevisionField) — 28 클래스 삭제
5. `rcm-ca-*` (ContentAsset) — 22 클래스 삭제
6. `rcm-alerts-*` + `rcm-alert-item-*` (EntityFormAlerts) — 28 클래스 삭제
7. `rcm-import-*` + `rcm-importer-*` (DataImport) — 24 클래스 삭제
8. `rcm-field-selector-*` — 20 클래스 삭제
9. `rcm-filter-dropdown-*` — 11 클래스 삭제
10. `rcm-bool-*` + `rcm-num-*` + `rcm-date-*` — 20 클래스 삭제
11. `rcm-ca-dialog`, `rcm-phone-list-*`, `rcm-copy-*`, `rcm-status-*`, `rcm-permission-denied-*`, `rcm-tree-node-*`, `rcm-rule-*`, `rcm-api-spec-*`, `rcm-quick-search-*`, `rcm-image-field-*`, `rcm-file-field-*`, `rcm-link-cell-*`, `rcm-select-loading-*`, `rcm-sms-*`, `rcm-modal-*`, `rcm-postcode-*`, `rcm-select-renderer-*`, `rcm-notification-*`, `rcm-asset-*`, `rcm-listgrid-top-content`, `rcm-skeleton-placeholder-*`, `rcm-form-tab-*`, `rcm-form-header-*`, `rcm-form-sticky-header`, `rcm-form-scroll-container`, `rcm-input-group-*`, `rcm-copy-addon-*` — 약 100 클래스 삭제

각 그룹 삭제 후 **해당 기능을 쓰는 화면 Playwright 확인**.

**배포: alpha.33 ~ alpha.40 (그룹별로)**

---

## Phase 7 — base.css 재구성

Phase 6 까지 오면 base.css 에 남는 것:
- Subcollection 전용 구조 (`rcm-subcollection-*`)
- ListGrid 전용 구조 (`rcm-listgrid-*`)
- Form 레이아웃 (`rcm-form-panel`, `rcm-form-layout-wrapper`, `rcm-fieldgroup`, `rcm-field-grid`, `rcm-col-span-full`)
- Skeleton 쉘
- Tab (primitive 로 이동 후 남는 건 `rcm-tab-list-inline` 같은 layout variant)

이걸 `layouts.css` 로 분리, `components.css` 에 꼭 필요한 것만 남김. 남는 `base.css` 는 전역 리셋 / 루트 클래스만.

build:styles 스크립트 업데이트:
```json
"build:styles": "cat src/listgrid/styles/tokens.css src/listgrid/styles/primitives.css src/listgrid/styles/layouts.css src/listgrid/styles/components.css src/listgrid/styles/base.css > dist/styles.css"
```

**배포: alpha.41**

---

## Phase 8 — theme classNames API 재정비

현재 `defaultTheme.ts` 의 `panel / fieldGroup / field / tabs` 등은 전부 `""`. 리팩터 완료 후엔:

- 각 slot 의 기본값 = primitive + 필요 attr 를 컴포넌트 JSX 가 hardcode
- theme classNames 는 **additive class 주입** 전용 (호스트가 `my-custom-class` 추가)
- `defaultTheme.ts` 는 빈 객체에 가까워짐 — 단 타입 유지

Types 업데이트: `ViewEntityFormClassNames` 의 deprecated field (예: `rcm-heading-sm`, `rcm-row-between` 처럼 세부 클래스 조합을 theme 으로 노출하던 것) 제거 or deprecated 표시.

`DECISIONS.md` 에 호스트 override contract 새 버전 추가.

**배포: alpha.42**

---

## Phase 9 — 최종 검증 + STATUS.md 업데이트

1. 전체 Playwright flow — login → 각 주요 페이지 → 시각 parity 확인
2. `npm run type-check` + gjcu-experiment `next build` 통과
3. STATUS.md 업데이트 — "CSS 리팩터 완료, primitive 기반 구조" 기록
4. DECISIONS.md #59~ 추가 — 이번 리팩터 결정 이력

**배포: alpha.43 (또는 0.2.0-beta.1)**

---

## 위험 요소 + Mitigation

| 위험 | Mitigation |
|---|---|
| Phase 중간에 시각 regression 발견 | Phase 단위로 alpha 배포. gjcu-experiment 에서 바로 확인. 문제 시 이전 alpha 로 rollback |
| composite 삭제 시 참조 누락 | Phase 6 각 블록 삭제 전 `grep -r "rcm-card-m2o-" src/` 로 참조 0 확인 후 삭제 |
| primitive CSS 버그 | Phase 1 에서 primitives.css 작성 후 Phase 2 이전에 **간단 demo 페이지로 눈검** (선택) |
| 호스트 (gjcu-experiment) 가 private class override 중 | 현재 consumer 1 개뿐. grep 으로 확인 후 해당 부분 같이 마이그레이션 |
| 문서와 구현 drift | 각 Phase 끝에 REFACTOR_DESIGN.md 의 해당 primitive 섹션을 실제 CSS 와 대조 |

---

## § 다음 세션 시작 프롬프트

> 아래 내용을 새 세션 시작 프롬프트로 그대로 붙여넣으면 됨.

```
@rcm/listgrid (현재 alpha.27) CSS 아키텍처 리팩터를 진행.

먼저 아래 3개 문서를 전부 읽어:
  docs/REFACTOR_CURRENT_STATE.md
  docs/REFACTOR_DESIGN.md
  docs/REFACTOR_PLAN.md

그 다음:
1. REFACTOR_DESIGN.md § 8 의 "남겨둔 결정" 4개 + REFACTOR_PLAN.md Phase 0
   의 제안을 나한테 확인. 다른 의견 있으면 거기서 확정.
2. 확정되면 Phase 1 (primitives.css 작성) 시작. primitives.css 파일 만들고
   REFACTOR_DESIGN.md § 2 의 22 primitive 를 전부 작성. 이 phase 에서
   src/ 코드는 한 줄도 수정 안 함.
3. Phase 1 끝나면 npm run build + gjcu-experiment 빌드 통과 확인 후
   alpha.28 배포. STATUS.md 업데이트.
4. 이후 Phase 2 진행 여부는 나한테 확인.

제약:
- 시각 parity 유지 (gjcu-experiment 에서 /academic/admission/applicant,
  /academic/student 상세 화면 기준)
- dark mode / Tailwind plugin / 후방호환 shim 전부 out-of-scope
- 각 Phase 끝 alpha 배포
- base.css 는 지금 건드리지 말 것 (Phase 6~7 에서 처리)

참고:
- gjcu-experiment 경로: ~/IdeaProjects/gjcu-experiment/gjcu-academic-front
- 라이브러리 경로: ~/dev/rcm-listgrid (Git main)
- 배포 스크립트: echo "0.1.0-alpha.X" | ./deploy.sh
- 재설치 명령: STATUS.md 섹션 6 참조
```
