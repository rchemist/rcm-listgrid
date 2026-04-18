# 다음 세션 실행 가이드 — Phase 6 연속 + Phase 7/8 한 턴에 완료

> 목표: **한 턴** 에서 남은 CSS 리팩터 대부분 완료. 에이전트 병렬 활용으로 메인 컨텍스트 보호.
>
> 전제: alpha.35 배포 완료. `base.css` 4,750줄 / `primitives.css` 1,259줄. gjcu-experiment 에 설치되어 dev 서버 9261 정상.

---

## 0. 세션 시작 시 메인이 먼저 할 일

1. 이 문서를 끝까지 읽기
2. `docs/PHASE_6_HANDOFF.md` 한번 훑기 (배경)
3. `docs/REFACTOR_DESIGN.md` § 2 (primitive 목록) 빠르게 확인
4. `src/listgrid/styles/primitives.css` 상단 주석만 (전체 읽지 말 것)
5. 아래 "§ 3 에이전트 병렬 dispatch" 섹션의 프롬프트를 그대로 Agent 도구로 **병렬 실행**

**메인 세션 context 보호 원칙**:
- 컴포넌트 소스 전체를 메인이 읽지 말 것 → 에이전트가 읽음
- base.css 전체 내용도 메인이 보지 말 것 → 에이전트가 grep + 보고
- 메인은 **집계 + CSS 적용 + 빌드 + 커밋 + 배포** 만 담당
- 각 에이전트는 **이하 형식의 report** 를 반환해야 메인이 파싱 가능

---

## 1. 현재 상태 요약 (alpha.35)

### 완료된 것
- Phase 1 (primitives.css 도입) ✅
- Phase 2 (Button JSX → data-attr, 18 파일) ✅
- Phase 3 (Input/Textarea/Select JSX → primitive) ✅
- Phase 4 부분 (icon-frame + notice JSX) ✅
- Phase 5 부분 (ViewTab data-state) ✅
- Phase 6-1 (dead CSS 삭제) ✅
- Phase 6-2 (icon-btn 전환 묶음) ✅
- Phase 6-3 (ContentAsset remove + Revision badge/tag) ✅

### 미완료 (이번 세션 목표)
- Phase 6 큰 composite 블록 정리 (card-m2o / card-item / adv-search / revision 잔여 / ca 잔여 / import / field-selector / alerts 잔여)
- Phase 7: `base.css` → `layouts.css` + `components.css` 분리
- Phase 8: theme 파일 legacy variant class 제거 + base.css variant 규칙 삭제
- Phase 9: STATUS/DECISIONS 최종 업데이트

### 재기준 데이터
- 배포 스크립트: `echo "0.1.0-alpha.X" | ./deploy.sh`
- 라이브러리 repo: `/Users/kunner/IdeaProjects/rcm-listgrid` (main branch)
- 실험 호스트: `/Users/kunner/dev/gjcu-experiment/gjcu-academic-front`
- **원본 참조** (수정 금지, 시각 intent 확인용): `/Users/kunner/IdeaProjects/gjcu-academic-backend/gjcu-academic-front`
- Dev 서버 재설치 절차: `STATUS.md § 6` 참조

---

## 2. 실행 플랜 (한 턴)

```
┌──────────────────────────────────────────────────────────────┐
│ Step 1: 에이전트 8개 병렬 dispatch (§3)                        │
│  - 각 에이전트는 자기 블록의 JSX 전환 + CSS 삭제 목록 반환         │
│  - isolation 없음 (각자 다른 파일만 수정)                       │
│  - 단, base.css 는 에이전트가 직접 편집하지 말고 "삭제할 규칙 리스트" 보고 │
├──────────────────────────────────────────────────────────────┤
│ Step 2: 메인이 집계 + base.css 일괄 삭제                        │
│  - 8 에이전트 report 에서 CSS 삭제 리스트 merge                  │
│  - base.css 에서 해당 규칙 삭제 (한 번에)                        │
│  - 규칙 중복 체크 (같은 rule 여러 에이전트가 올렸을 수 있음)          │
├──────────────────────────────────────────────────────────────┤
│ Step 3: 메인 type-check + build 검증                           │
│  - npm run type-check                                         │
│  - npm run build                                              │
│  - 실패 시 원인 블록의 에이전트 re-dispatch 또는 수동 수정          │
├──────────────────────────────────────────────────────────────┤
│ Step 4: 블록별 commit (8 commits)                             │
│  - 각 에이전트 변경을 단일 commit 으로 분리 (롤백 포인트)            │
├──────────────────────────────────────────────────────────────┤
│ Step 5: Phase 7 에이전트 dispatch (순차)                        │
│  - base.css → layouts.css + components.css 분리                │
│  - build:styles 스크립트 + index.css 업데이트                   │
├──────────────────────────────────────────────────────────────┤
│ Step 6: Phase 8 에이전트 dispatch (순차)                        │
│  - defaultListGridTheme/defaultTheme/subCollectionTheme 정리     │
│  - ListGrid JSX 의 classNames.subCollectionButtons 등 소비처에    │
│    primitive data-attr 추가 + theme string 비우기                │
│  - base.css 에서 .rcm-button-* variant 규칙 완전 삭제             │
├──────────────────────────────────────────────────────────────┤
│ Step 7: 메인 최종 빌드 + alpha.36 배포                          │
│  - type-check + build                                         │
│  - git commit (phase 7/8)                                     │
│  - deploy.sh → alpha.36                                       │
│  - gjcu-experiment sed + reinstall + dev 서버 재기동              │
│  - HTTP 303 확인                                               │
├──────────────────────────────────────────────────────────────┤
│ Step 8: STATUS.md + DECISIONS.md 최종 업데이트                   │
│  - alpha.28~36 전체 이력 정리                                   │
│  - Phase 1~9 완료 표시                                          │
│  - base.css 최종 줄 수 기록                                     │
└──────────────────────────────────────────────────────────────┘
```

예상 소요: 30~60분 (에이전트 병렬 + 직렬 phase 7/8 + deploy)

---

## 3. 에이전트 병렬 dispatch 프롬프트

**모두 한 메시지에 병렬로 dispatch**. `subagent_type: "general-purpose"`. 각 프롬프트는 자기-완결적 (에이전트가 메인 대화 모름).

### 에이전트 A — CardManyToOneView

```
@rcm/listgrid 리팩터 Phase 6. 작업 대상: CardManyToOneView composite classes.

경로:
- 편집 대상 JSX: /Users/kunner/IdeaProjects/rcm-listgrid/src/listgrid/components/fields/view/CardManyToOneView.tsx
- primitive 스펙: /Users/kunner/IdeaProjects/rcm-listgrid/src/listgrid/styles/primitives.css (섹션 5 Display primitives + 6 Surface 참조)
- CSS 삭제 후보: /Users/kunner/IdeaProjects/rcm-listgrid/src/listgrid/styles/base.css 의 .rcm-card-m2o-* 블록 (약 36 규칙)
- 원본 시각 참조 (수정 금지): /Users/kunner/IdeaProjects/gjcu-academic-backend/gjcu-academic-front/packages/ui/listgrid/ (해당하는 원본 파일 찾아 시각 intent 참고)

작업 규칙:
1. JSX 의 rcm-card-m2o-* 클래스 중 **primitive 로 치환 가능한 것** 만 전환. 매핑:
   - rcm-card-m2o-badge + rcm-card-m2o-badge-primary → <span className="rcm-badge" data-color="primary">
   - rcm-card-m2o-badge + rcm-card-m2o-badge-neutral → <span className="rcm-badge" data-color="neutral">
   - rcm-card-m2o-check (체크 아이콘 원형 프레임) → <span className="rcm-icon-frame" data-shape="circle" data-color="success">
   - rcm-card-m2o-action-btn / -btn-primary / -btn-muted → <button className="rcm-icon-btn" data-size="sm" data-variant="ghost"> 또는 rcm-button 에 맞춤
   - rcm-card-m2o-search-submit → <button className="rcm-button" data-variant="primary" data-size="sm">
   - rcm-card-m2o-search-clear → <button className="rcm-icon-btn" data-size="sm">
   - rcm-card-m2o-search-icon → <IconSearch className="rcm-icon" data-size="sm" data-tone="muted">
   - rcm-card-m2o-search-empty-icon → <IconX className="rcm-icon" data-size="lg" data-tone="disabled">
   - rcm-card-m2o-search-input → <input className="rcm-input" data-size="sm">
   - rcm-card-m2o-page (페이지네이션 버튼) / rcm-card-m2o-page-active → <button className="rcm-button" data-variant={isActive ? 'primary' : 'ghost'} data-size="sm">
   - rcm-card-m2o-page-nav → <button className="rcm-icon-btn" data-size="sm">
   - rcm-card-m2o-spinner / -spinner-inverse → 유지 (커스텀 로더, primitive 로 대체 어려움). 또는 inline style 로.
   - rcm-card-m2o-title → <h4 className="rcm-text" data-weight="semibold">
   - rcm-card-m2o-description → <p className="rcm-text" data-tone="muted" data-size="sm">
   - rcm-card-m2o-change-title → <h4 className="rcm-text" data-weight="semibold">
   - rcm-card-m2o-change-cancel → <button className="rcm-icon-btn" data-size="sm">
   - rcm-card-m2o-search-status → <span className="rcm-text" data-size="xs" data-tone="muted">
   - rcm-card-m2o-search-empty-text → <p className="rcm-text" data-tone="muted">

2. **layout-specific 클래스는 유지** (Phase 7 에서 layouts.css 로 이동 예정):
   - rcm-card-m2o-wrapper / -stack / -clickable / -selected / -default / -image-wrap / -image / -title-sm / -description-clamp / -action / -actions / -loading / -empty-readonly / -change-header / -search-section / -search-row / -search-input-wrap / -grid / -no-results / -pagination / -page-numbers 등

3. 원본 gjcu-academic-backend 코드에서 해당 컴포넌트 찾아 원본 동작 intent 검증. 특히 hover / selected / disabled 동작 보존.

4. JSX 수정 후 **CSS 삭제 목록** 작성. 여기에 포함할 조건: "이 규칙을 쓰는 JSX 가 CardManyToOneView.tsx 하나뿐" + "primitive 로 치환됨".

**반환 포맷** (정확히 이 구조 지켜):
```
## Agent A: CardManyToOneView

### Files modified
- src/listgrid/components/fields/view/CardManyToOneView.tsx

### Primitive replacements applied
- rcm-card-m2o-badge-primary → rcm-badge data-color="primary"
- ... (모두 나열)

### CSS rules to delete from base.css
| line | rule |
|---|---|
| 1096 | .rcm-card-m2o-badge |
| 1105 | .rcm-card-m2o-badge-primary |
| ... | ... |

### Layout classes kept (for Phase 7)
- .rcm-card-m2o-wrapper
- ... (나열)

### Original behavior preserved?
- Hover ring on card: [yes/no/notes]
- Selected state: [yes/no/notes]
- Disabled action btn: [yes/no/notes]

### Primitive tuning suggested (if any)
- None / specific
```

끝. 다른 파일 편집 금지. base.css 편집 금지 (보고만).
```

### 에이전트 B — CardItem (나머지 composite)

```
@rcm/listgrid 리팩터 Phase 6. 작업 대상: CardItem.tsx 의 rcm-card-item-* 나머지 composite.

경로:
- 편집 대상: /Users/kunner/IdeaProjects/rcm-listgrid/src/listgrid/components/list/ui/CardItem.tsx
- primitive: /Users/kunner/IdeaProjects/rcm-listgrid/src/listgrid/styles/primitives.css
- CSS 삭제 후보: base.css 의 .rcm-card-item-* 블록 (action-btn 은 이미 삭제됨, 남은 건 tabbar/tab/title/body/section/skel 등)
- 원본 참조: /Users/kunner/IdeaProjects/gjcu-academic-backend/gjcu-academic-front/packages/ui/listgrid/

작업 규칙:
1. Primitive 치환 가능한 것만 전환:
   - rcm-card-item-tab / rcm-card-item-tab-active → rcm-tab + data-state="selected" (단 base.css .rcm-tab-list 와 맞지 않을 수 있음. 필요 시 유지 및 Phase 7 layouts.css 이동)
   - rcm-card-item-title → rcm-text data-weight="semibold"
   - rcm-card-item-empty → rcm-text data-tone="disabled"
   - rcm-card-item-sub-label → rcm-text data-weight="medium"
   - rcm-card-item-skel-* → rcm-skeleton data-shape="line" 로 가능한 것만. skel-line/skel-line-title/skel-line-subtitle 등 primitive 치환 시도.
   - rcm-card-item-chevron-icon → rcm-icon data-size="sm" data-tone="muted"

2. Layout 유지 대상 (Phase 7 layouts.css 이동):
   - rcm-card-item / -hover / -clickable / -body / -header / -header-row / -header-left / -title-row / -actions / -chevron-wrap / -tabbar / -tabnav / -sections / -subcollections / -sub / -sub-view / -sub-loading-wrap / -skel-stack / -skel-group / -skel-rows / -skel-row

3. 원본 시각 참조 후 동작 보존 확인.

**반환 포맷** (Agent A 와 동일).
```

### 에이전트 C — AdvancedSearchFormV2

```
@rcm/listgrid 리팩터 Phase 6. 대상: AdvancedSearchFormV2.tsx 의 rcm-adv-search-* 나머지.

경로:
- 편집 대상: /Users/kunner/IdeaProjects/rcm-listgrid/src/listgrid/components/list/AdvancedSearchFormV2.tsx
- 버튼 3개는 이미 Phase 2 에서 data-variant 로 변경됨 (rcm-adv-search-btn 클래스는 layout 으로 남음)
- CSS 삭제 후보: base.css 의 .rcm-adv-search-* 블록 (~37 규칙). -btn 기본 layout 은 유지.
- 원본 참조: gjcu-academic-backend 의 AdvancedSearchForm

작업 규칙:
1. Primitive 치환 가능한 것:
   - rcm-adv-search-qs-input / -input-panel-input → rcm-input
   - rcm-adv-search-qs-input-panel-icon → rcm-icon data-size="sm" data-tone="muted"
   - rcm-adv-search-close / -remove → rcm-icon-btn data-size="sm"
   - rcm-adv-search-title → rcm-text data-weight="semibold"
   - rcm-adv-search-field-label → rcm-label
   - rcm-adv-search-add → rcm-button data-variant="outline" data-size="sm"
   - rcm-adv-search-legacy-* → 아예 삭제 가능한지 확인 (deprecated)

2. Layout 유지: -container, -header, -body, -section, -field-group, -field-row, -footer, -btn, -qs-*, -input-group, -popover-* 등

**반환 포맷**: Agent A 와 동일.
```

### 에이전트 D — RevisionField 나머지

```
@rcm/listgrid Phase 6. 대상: RevisionField.tsx 의 rcm-revision-* 나머지 (badge/chip 이미 완료, 나머지 layout + text).

경로:
- 편집 대상: /Users/kunner/IdeaProjects/rcm-listgrid/src/listgrid/components/revision/RevisionField.tsx
- CSS 후보: base.css .rcm-revision-* 블록 (~18 규칙 잔여)
- 원본 참조: gjcu-academic-backend 의 RevisionField

작업 규칙:
1. Primitive 치환:
   - rcm-revision-state-text / -item-name / -item-date → rcm-text data-size / data-tone
   - rcm-revision-state-icon / -state-icon-spin → rcm-icon + 회전 애니메이션만 CSS 유지
   - rcm-revision-diff-indicator → rcm-icon-frame data-shape="circle" data-size="xs" data-color="warning"

2. Layout 유지: -diff-container, -diff-banner, -diff-banner-changed/-same, -diff-banner-row, -diff-labels, -wrap, -panel, -list, -item, -item-latest/-muted/-default, -item-row, -state, -state-empty, -pagination

**반환 포맷**: Agent A 와 동일.
```

### 에이전트 E — FieldSelector

```
@rcm/listgrid Phase 6. 대상: FieldSelector.tsx 의 rcm-field-selector-*.

경로:
- 편집 대상: /Users/kunner/IdeaProjects/rcm-listgrid/src/listgrid/components/list/ui/FieldSelector.tsx
- CSS 후보: base.css .rcm-field-selector-* 블록 (~20 규칙)
- 원본 참조: gjcu-academic-backend

작업 규칙:
1. Primitive 치환:
   - rcm-field-selector-title → rcm-text data-weight="medium"
   - rcm-field-selector-count → rcm-badge data-color="primary" data-size="sm"
   - rcm-field-selector-hint → rcm-text data-size="xs" data-tone="muted"
   - rcm-field-selector-toggle → rcm-icon-btn data-size="sm"
   - rcm-field-selector-chevron → rcm-icon data-size="sm" data-tone="muted"
   - rcm-field-selector-search-input → rcm-input data-size="sm"
   - rcm-field-selector-search-icon → rcm-icon data-size="sm" data-tone="muted" (position absolute 는 남김)
   - rcm-field-selector-action / -action-primary → rcm-button data-variant="ghost" data-size="sm"
   - rcm-field-selector-action-muted → rcm-button data-variant="ghost" data-size="sm" (text-muted 톤)
   - rcm-field-selector-chip / -chip-selected → rcm-chip data-interactive data-state={selected ? 'selected' : undefined}
   - rcm-field-selector-chip-check / -chip-check-selected / -chip-check-icon → rcm-icon data-size="xs" 또는 커스텀 (체크박스 primitive 활용)
   - rcm-field-selector-empty → rcm-text data-tone="muted"

2. Layout 유지: -field-selector, -header, -header-left, -header-right, -body, -search-row, -search-input-wrap, -list, -grid

**반환 포맷**: Agent A 와 동일.
```

### 에이전트 F — DataImportProcessor + DataImporter + Sample

```
@rcm/listgrid Phase 6. 대상: rcm-import-* / rcm-importer-* blocks.

경로:
- 편집 대상:
  - /Users/kunner/IdeaProjects/rcm-listgrid/src/listgrid/transfer/DataImportProcessor.tsx
  - /Users/kunner/IdeaProjects/rcm-listgrid/src/listgrid/transfer/DataImporter.tsx (있다면)
  - /Users/kunner/IdeaProjects/rcm-listgrid/src/listgrid/transfer/DataImportSample.tsx
  - /Users/kunner/IdeaProjects/rcm-listgrid/src/listgrid/transfer/DataImportPreview.tsx (있다면)
  - /Users/kunner/IdeaProjects/rcm-listgrid/src/listgrid/transfer/DataImportResultView.tsx (있다면)
- CSS 후보: base.css .rcm-import-* / .rcm-importer-* 블록 (~24 규칙)

작업 규칙:
1. Primitive 치환:
   - rcm-import-sample-download-btn (buttons 이미 data-variant 변경됨, layout 만 남음)
   - rcm-import-step-title / -row-title → rcm-text data-weight
   - rcm-import-step-label / -row-label → rcm-text data-size="sm" data-tone="muted"
   - rcm-importer-header → rcm-text data-weight="semibold"
   - rcm-importer-error → rcm-text data-color="error"
   - rcm-importer-success → rcm-text data-color="success"

2. Layout 유지: -wrap, -row, -step, -section, -stepper, -preview, -result 등

**반환 포맷**: Agent A 와 동일.
```

### 에이전트 G — ContentAsset 나머지 + AddContentDialog

```
@rcm/listgrid Phase 6. 대상: rcm-ca-* 잔여 (remove 버튼 이미 완료).

경로:
- 편집 대상:
  - /Users/kunner/IdeaProjects/rcm-listgrid/src/listgrid/components/fields/contentasset/components/ContentAssetItemUI.tsx
  - /Users/kunner/IdeaProjects/rcm-listgrid/src/listgrid/components/fields/contentasset/components/AddContentDialog.tsx
- CSS 후보: base.css .rcm-ca-* 잔여 (~18 규칙)

작업 규칙:
1. Primitive 치환:
   - rcm-ca-required → rcm-text data-color="error" (간단 inline 이면 유지 OK)
   - rcm-ca-optional → rcm-text data-tone="muted" data-size="xs"
   - rcm-ca-item-label → rcm-label
   - rcm-ca-item-error-msg / -error → rcm-text data-color="error" data-size="sm"
   - rcm-ca-empty-text → rcm-text data-tone="muted"
   - rcm-ca-input-error → input 에 [data-state="error"] attr (단 TextInput 컴포넌트가 data attr 전달 가능한지 확인)
   - rcm-ca-add-btn / -add-btn-text → rcm-button data-variant="outline" (점선 border 스타일이면 유지도 가능)

2. Layout 유지: -wrap, -empty, -errors, -item, -item-error, -item-header, -item-title-col, -item-remove-wrap, -add-btn-row, -dialog, -dialog-footer, -loading

**반환 포맷**: Agent A 와 동일.
```

### 에이전트 H — Alerts 잔여 + useAlertManager

```
@rcm/listgrid Phase 6. 대상: rcm-alerts-* 잔여 (toggle/chevron 이미 완료).

경로:
- 편집 대상:
  - /Users/kunner/IdeaProjects/rcm-listgrid/src/listgrid/components/form/ui/ViewEntityFormAlerts.tsx
  - /Users/kunner/IdeaProjects/rcm-listgrid/src/listgrid/components/form/hooks/useAlertManager.ts (조심 — hook 이 string 반환)
- CSS 후보: base.css .rcm-alerts-* / .rcm-alert-item-* 잔여 (~15 규칙)

작업 규칙:
1. AlertItem:
   - rcm-alert-item-icon → rcm-icon data-size="md"
   - rcm-alert-item-content / -body / -message / -description → rcm-text data-size 및 layout 분리
   - rcm-alert-item-external / -external-icon → rcm-button data-variant="link" + rcm-icon

2. Alerts (wrapper):
   - rcm-alerts-header-title / -header-left → rcm-text
   - rcm-alerts-indicator / -indicator-dot → rcm-icon-frame data-shape="circle" data-size="xs" 또는 커스텀

3. Layout 유지: -alerts-single, -alerts-multi, -alerts-header, -alerts-header-collapsed/-expanded, -alerts-body, -alerts-body-collapsed/-expanded, -alerts-list, -alert-item, -alert-item-content, -alert-item-body

4. useAlertManager.ts 의 bg string:
   - 현재: `rcm-notice rcm-notice-{success,error,warning,info}` 반환
   - 변경: `rcm-notice` 만 반환, data-tone 은 consumer 에서 style attribute 로 전달 필요 → 아니면 hook 을 data-attr 객체 반환하도록 변경
   - 옵션 선택: 안전하게 "hook 반환은 그대로 + 소비하는 JSX 에서 data-tone 추가" 식으로. 또는 hook 이 `{className: 'rcm-notice', dataTone: 'success'}` 형태로 반환.

**반환 포맷**: Agent A 와 동일. useAlertManager 변경이 consumers 에 영향 있으면 명시.
```

---

## 4. Phase 7 에이전트 (에이전트 dispatch 완료 후 순차 실행)

```
@rcm/listgrid Phase 7 — base.css 를 3개 파일로 분리.

경로:
- 입력: /Users/kunner/IdeaProjects/rcm-listgrid/src/listgrid/styles/base.css (현재 ~4,500줄)
- 출력:
  - src/listgrid/styles/layouts.css (신규, 구조적 composite — rcm-*-wrap/-row/-column/-grid/-header/-body/-footer 등)
  - src/listgrid/styles/components.css (신규, 꼭 필요한 component-specific)
  - src/listgrid/styles/base.css (대폭 축소 — 전역 리셋 + root + 유틸리티 + primitive 보완)

분리 기준:
- layouts.css: 컴포넌트의 구조적 flex/grid 배치를 담당하는 composite. 예: rcm-card-m2o-wrap, rcm-subcollection-toolbar, rcm-form-panel, rcm-field-grid, rcm-listgrid-panel, rcm-alerts-header, rcm-card-item-body 등
- components.css: 진짜 component-specific 스타일 (색/행동/special case). 예: rcm-subcollection-pagination-pill, rcm-api-spec-json, rcm-status-change-* 등 — 최소화
- base.css: .rcm-root, @keyframes rcm-spin/pulse, .rcm-flex-1, .rcm-gap-*, .rcm-ml-auto, .rcm-radius-full, .rcm-bg-*, .rcm-cursor-* 등 유틸리티

작업 규칙:
1. base.css 를 섹션별로 읽고 각 rule 을 3개 파일 중 하나로 분류
2. 분리 후 세 파일이 cat 되었을 때 현재 base.css 와 동일한 효과여야 함
3. package.json build:styles 업데이트:
   "build:styles": "mkdir -p dist/styles && cp src/listgrid/styles/tokens.css src/listgrid/styles/primitives.css src/listgrid/styles/layouts.css src/listgrid/styles/components.css src/listgrid/styles/base.css dist/styles/ && cat src/listgrid/styles/tokens.css src/listgrid/styles/primitives.css src/listgrid/styles/layouts.css src/listgrid/styles/components.css src/listgrid/styles/base.css > dist/styles.css"
4. src/listgrid/styles/index.css 업데이트 — 새 파일들 @import 추가
5. package.json exports 에 ./styles/layouts.css, ./styles/components.css 추가
6. type-check + build 가 통과해야 함

**반환 포맷**:
```
## Phase 7 split

### New files
- src/listgrid/styles/layouts.css (N lines)
- src/listgrid/styles/components.css (N lines)

### Modified
- src/listgrid/styles/base.css (old 4,500 → new N lines)
- src/listgrid/styles/index.css
- package.json (build:styles + exports)

### Split summary
- layouts.css: N classes (mostly structural flex/grid)
- components.css: N classes (residual component-specific)
- base.css: N lines (root + utilities + keyframes)

### Build verified
- npm run type-check: PASS
- npm run build: PASS
- dist/styles.css byte count unchanged vs previous (minor diff OK if whitespace)
```
```

---

## 5. Phase 8 에이전트 (Phase 7 완료 후)

```
@rcm/listgrid Phase 8 — theme 파일 정리 + base.css button variant 규칙 삭제.

경로:
- 편집:
  - src/listgrid/components/list/themes/defaultListGridTheme.ts
  - src/listgrid/components/form/themes/defaultTheme.ts
  - src/listgrid/components/list/themes/variants/subCollectionTheme.ts
  - src/listgrid/components/list/themes/variants/mainTheme.ts (있다면)
  - src/listgrid/components/list/themes/variants/modalTheme.ts (있다면)
- 함께 수정 (consumers 가 legacy class 를 받으면 깨지므로 data-attr 추가 필요):
  - HeaderActionButtons.tsx (이미 data-variant 있음, 확인만)
  - CreateButton.tsx (themeClasses.subCollectionButtons?.deleteButton/addButton 참조 — data-variant 추가)
  - 기타 theme string 소비처 (grep 으로 찾기)

작업 규칙:
1. 각 theme 파일에서 "rcm-button rcm-button-primary" 같은 문자열 → "rcm-button" 또는 "" 로 변경
2. 해당 string 을 소비하는 JSX 에서 data-variant/data-color/data-size attr 을 JSX 에 hardcode (없으면 추가)
3. 변경 후 base.css 에서 다음 규칙 **삭제 가능**:
   - .rcm-button-primary / .rcm-button-primary:hover
   - .rcm-button-outline / .rcm-button-outline:hover
   - .rcm-button-danger / .rcm-button-danger:hover
   - .rcm-button-outline-danger / .rcm-button-outline-danger:hover
   - .rcm-button-secondary / .rcm-button-secondary:hover
   - .rcm-button-sm
   - .rcm-button-icon / .rcm-button-icon.rcm-button-sm
4. grep 으로 "rcm-button-primary" 등 참조 0 임을 확인
5. ViewEntityFormClassNames 타입에서 deprecated 된 slot 필드는 "TODO: remove in v0.2" 주석 추가 (또는 optional 로 유지)

**반환 포맷**:
```
## Phase 8 theme cleanup

### Files modified
- src/.../defaultListGridTheme.ts
- src/.../defaultTheme.ts
- src/.../subCollectionTheme.ts
- src/.../CreateButton.tsx (data-variant 추가)
- ... (나열)

### Theme strings cleared
- buttons.save: "rcm-button rcm-button-primary" → ""
- ... (나열)

### CSS rules deleted from base.css (or layouts/components)
- .rcm-button-primary ...
- ... (나열)

### grep verification
- "rcm-button-primary" references in src/*.{ts,tsx}: 0
- ... (모든 variant 에 대해)

### Build verified
- PASS / FAIL with reason
```
```

---

## 6. 메인 세션이 각 에이전트 report 받은 후 할 일

### 6-1. 에이전트 8개 report 집계 (A~H)

각 report 에서:
1. Modified files 리스트 → 메인이 git diff 로 검증 가능
2. CSS rules to delete → **모두 모아 dedup** → base.css 에서 일괄 삭제
3. Layout classes kept → 기록만 (Phase 7 에이전트가 참고)

### 6-2. base.css 일괄 편집

메인이 한 번에 수행:
```
모든 에이전트 report 의 "CSS rules to delete" merge →
Grep 으로 base.css 의 해당 rule 블록 확인 → 
Edit 도구로 삭제 (여러 번 Edit, 각 rule 블록마다)
```

**주의**: 에이전트가 JSX 에서 class 제거했는데 메인이 CSS 규칙 남겨두면 dead code. 반대로 메인이 CSS 규칙 제거했는데 에이전트가 JSX 에 class 남겼으면 스타일 깨짐. Report 검증 꼼꼼히.

### 6-3. type-check + build 검증

```bash
cd /Users/kunner/IdeaProjects/rcm-listgrid
npm run type-check   # 통과해야 함
npm run build        # 통과해야 함
```

실패 시:
- 원인 파악 (어느 에이전트의 JSX 변경 문제인지)
- 수동 수정 또는 해당 에이전트 re-dispatch

### 6-4. 블록별 commit

```bash
# Agent A 변경만 stage + commit
git add src/listgrid/components/fields/view/CardManyToOneView.tsx
git add src/listgrid/styles/base.css  # (첫 커밋에만, 또는 분리)
git commit -m "feat: Phase 6 - CardManyToOneView composite → primitive (Agent A)"

# 반복 for B~H
```

또는 한 번에: `git commit -m "feat: Phase 6 병렬 — 8 블록 composite → primitive 일괄 전환"`

### 6-5. Phase 7 → Phase 8 순차 실행

위 §4, §5 프롬프트 사용.

### 6-6. 최종 배포

```bash
echo "0.1.0-alpha.36" | ./deploy.sh
git add package.json package-lock.json
git commit -m "chore: bump version to 0.1.0-alpha.36"

cd /Users/kunner/dev/gjcu-experiment/gjcu-academic-front
sed -i '' 's|v0.1.0-alpha.35|v0.1.0-alpha.36|' apps/admin/package.json
rm -rf node_modules/@rcm package-lock.json
npm install --legacy-peer-deps

lsof -ti:9261 | xargs kill -9 2>/dev/null
rm -rf apps/admin/.next
cd apps/admin
NODE_OPTIONS='--max-old-space-size=8192' npx next dev --turbo -p 9261 > /tmp/rcm-admin-dev.log 2>&1 &
disown
sleep 4
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:9261  # 303 기대
```

### 6-7. 최종 문서

`STATUS.md` + `DECISIONS.md` + 이 문서 (`NEXT_SESSION.md` 는 archive 처리 또는 삭제) 업데이트.

---

## 7. 실패 시 rollback

각 alpha 는 독립 commit 이므로:
```bash
# 특정 alpha 로 복귀
git reset --hard <commit_of_alpha.X>
# 호스트 package.json 도 되돌림
cd /Users/kunner/dev/gjcu-experiment/gjcu-academic-front
sed -i '' 's|v0.1.0-alpha.NEW|v0.1.0-alpha.OLD|' apps/admin/package.json
```

---

## 8. 성공 기준 (한 턴 완료 기준)

- [ ] base.css 1,500줄 이하
- [ ] .rcm-* 고유 클래스 80개 이하 (primitives + layouts 일부만)
- [ ] primitives.css ~1,300줄 유지 (큰 변화 없음)
- [ ] npm run type-check 통과
- [ ] gjcu-experiment 빌드 통과 (HTTP 303)
- [ ] STATUS.md / DECISIONS.md alpha.36 반영
- [ ] 8+2 개 에이전트 report 문서화 (commit 메시지에 인라인)

---

## 9. 새 세션 진입 프롬프트

아래를 새 세션에 그대로 붙여넣기:

```
@rcm/listgrid CSS 리팩터 이어서. 현재 alpha.35 배포됨.

먼저 docs/NEXT_SESSION.md 끝까지 읽고 그대로 실행:
1. 섹션 3 의 에이전트 A~H 프롬프트를 Agent 도구로 병렬 dispatch (한 메시지에 8개 Agent tool use)
2. 각 에이전트 report 받으면 섹션 6 대로 집계 + base.css 일괄 편집 + type-check + build
3. Phase 7 에이전트 (섹션 4) dispatch → 파일 분리 + 빌드 검증
4. Phase 8 에이전트 (섹션 5) dispatch → theme cleanup + variant CSS 삭제
5. deploy.sh alpha.36 → gjcu 재설치 → dev 서버 → HTTP 303
6. STATUS.md + DECISIONS.md 최종 업데이트

목표: 한 턴에서 Phase 6 잔여 + 7 + 8 완료, alpha.36 배포.
메인 컨텍스트 보호 원칙 준수 (큰 파일은 에이전트가 읽게). 블록별 commit 분리로 롤백 가능성 유지.

막히면 STATUS.md + PHASE_6_HANDOFF.md + NEXT_SESSION.md 참조.
```
