# Phase 6 Handoff — 2026-04-18 alpha.35 현재

> 자율 세션에서 Phase 6 를 continuous 하게 진행 중. 이 문서는 **다음 세션이 이어받을 수 있도록 현재 상태 + 남은 작업 + 주의사항** 기록.

---

## 지금까지 완료된 것 (alpha.28~alpha.35)

| 버전 | Phase | 주요 변경 |
|---|---|---|
| alpha.28 | 1 | `primitives.css` 신규 (dormant, 22 primitive + data-attr variants) |
| alpha.29 | 2 | 18 JSX 파일의 `rcm-button-*` variant class → `rcm-button data-variant=... data-color=... data-size=...` + `rcm-icon-btn` |
| alpha.30 | 3 | `rcm-field-input/select/textarea` / `rcm-quick-search-input` → `rcm-input/select/textarea` primitive. primitives.css 의 input 디폴트 font-size sm / focus primary 로 조정 |
| alpha.31 | 4 부분 | Bool/Num/Date/Select/String/ManyToOne 필드의 icon-frame + bool-label → `rcm-icon-frame [data-color]` + `rcm-icon` + `rcm-text [data-weight][data-color][data-tone]`. DataExporter notice → `rcm-notice data-tone`. primitives.css `rcm-icon-frame` 디폴트 rounded md + neutral bg surface-muted, `rcm-text` 디폴트 inherit |
| alpha.32 | 5 부분 | `ViewTab.tsx` rcm-tab-selected/-disabled 하드코딩 → `data-state` attr |
| alpha.33 | 6-1 | FormField 잔여 수정 + dead CSS 삭제 (bool/num/date icon+frame+label ≈20 규칙, rcm-card-item-action-btn* ≈4, rcm-tab-selected/-disabled 2). −64줄 |
| alpha.34 | 6-2 | icon-btn 전환 묶음: FilterDropdown close/title, AlertItem close, ViewEntityFormAlerts toggle/chevron, PhoneNumberFieldView addon, CopyableTextView copy buttons. −116줄 |
| alpha.35 | 6-3 | ContentAssetItem remove 버튼 → rcm-icon-btn data-color="error". RevisionField badges/chips → rcm-badge + rcm-tag. −40줄 |

**base.css 진척**: 4,960줄 → 4,750줄 (−210줄, −4.2%)
**primitives.css**: 1,253줄 (신규)
**목표**: 전체 1,500줄 이하 (현재 ~6,000줄, 여전히 멀음 — Phase 6 남은 큰 블록이 주 타겟)

---

## 아직 남은 Phase 6 블록 (난이도 순)

### 중간 — 기계적 매핑 가능하면서 크기가 있는 것들

- [ ] **`rcm-alerts-*` 잔여** — header/indicator/indicator-dot/body/body-collapsed/body-expanded/list/list-item 등 ~15 클래스. 대부분 layout. alerts-toggle/chevron 은 이미 처리됨. 가장 많이 남는 건 rcm-alerts-header/list 같은 레이아웃 → layouts.css 로 옮길 예정 (Phase 7).

- [ ] **`rcm-ca-*` 잔여** — ContentAsset 의 item/wrap/empty/dialog layout classes (~18 클래스). ca-add-btn 은 `rcm-button data-variant="outline"` 로 교체 가능할 듯. ca-input-error 는 input data-state="error" 로. 단 FileUploadInput 내부는 건드리기 어려움.

- [ ] **`rcm-import-*` + `rcm-importer-*`** — DataImport 계열. 24 클래스.

- [ ] **`rcm-field-selector-*`** — FieldSelector.tsx. 20 클래스. 검색 input, chip 리스트, 토글 버튼 등. 구조 복잡.

- [ ] **`rcm-filter-dropdown-*` 잔여** — title/close 이미 처리됨. 남은 레이아웃 composite (inner, header, footer, body) 은 Phase 7 layouts.css 로.

### 큰 — 구조적 리팩터 필요

- [ ] **`rcm-card-m2o-*`** — CardManyToOneView.tsx. 36 클래스. 검색 panel + card grid + pagination. 완전 리팩터 필요. `rcm-card-m2o-badge-{primary,neutral}` → `rcm-badge data-color` 는 쉬움. `rcm-card-m2o-search-*` / `rcm-card-m2o-page-*` 는 layouts.css.

- [ ] **`rcm-card-item-*`** — CardItem.tsx. 29 클래스. action-btn 이미 처리. 남은 건 tabbar/tab/section/header/body/title/etc. 대부분 layout → layouts.css.

- [ ] **`rcm-adv-search-*`** — AdvancedSearchFormV2.tsx. 37 클래스. 복잡한 검색 폼 레이아웃. 대부분 layout → layouts.css.

- [ ] **`rcm-revision-*` 잔여** — badges/chips 이미 처리. 남은 건 diff-container/diff-banner/diff-indicator/diff-labels/wrap/panel/list/state/state-icon/item/item-row/item-name/item-date 등 (~18 클래스). 거의 전부 layout/structural → layouts.css.

---

## 전략 제안 (다음 세션)

### Option A — Phase 7 선행
남은 composite 는 **대부분 layout-specific** (flex 방향, gap, padding, grid columns). 이들은 primitive 로 완벽 치환이 어려움. 차라리:
1. base.css 를 `base.css` (전역 리셋/root), `layouts.css` (구조적 composite), `components.css` (꼭 필요한 컴포넌트 스타일) 로 분리
2. 구분하는 기준: primitive 로 표현 가능한 variant → 제거, layout 전용 → layouts.css 로 이동
3. 남은 composite 가 정리되면서 자연스럽게 줄어듦

### Option B — 큰 블록 순차 처리
각 큰 composite 블록 (card-m2o, card-item, adv-search) 을 한 번에 하나씩:
1. 원본 컴포넌트 파일 열고 전체 구조 이해
2. 어떤 클래스가 variant/badge/button 이고 어떤 게 layout 인지 분류
3. primitive 매핑 + layout 은 `rcm-{component}-{layout-name}` 형태로 유지
4. 각 블록 완료 시 alpha 배포

### Option C — Phase 8 먼저
`defaultListGridTheme.ts` / `defaultTheme.ts` / `subCollectionTheme.ts` 에서 `rcm-button-primary` 등 legacy variant 참조 제거. 이미 Phase 2 JSX 에서 data-attr 으로 대체됐으므로 theme defaults 는 빈 문자열로 가능. 이후 base.css 의 `.rcm-button-primary` / `.rcm-button-outline` / `.rcm-button-danger` / `.rcm-button-secondary` / `.rcm-button-sm` / `.rcm-button-icon` 규칙 전체 삭제 가능 (~50줄).

### 추천 순서: C → A → B
1. Phase 8 theme 정리 + base.css 에서 button variant 규칙 삭제 (~50줄 삭감)
2. Phase 7 layouts.css 분리 + 남은 composite 재배치 (줄 수는 비슷하지만 구조 정리)
3. Phase 6 큰 블록은 실제 화면 개선 필요한 부분만 (strategic refactor)

---

## 주의사항

1. **시각 parity 체크**: 지금까지 모든 phase 에서 gjcu-experiment dev server (port 9261) 재기동 + HTTP 303 응답 확인만 했을 뿐, 실제 화면 시각 비교는 사용자가 수동 확인. 큰 리팩터 시엔 Playwright MCP 로 screenshot 비교 권장.

2. **theme classNames prop**: 호스트가 `<ViewEntityForm classNames={{...}} />` 에 커스텀 클래스 주입 가능. 이 경로가 깨지면 호스트 화면 부서짐. 테마 변경 시 현재 defaultTheme 이 emit 하는 것과 host override path 둘 다 고려.

3. **`.rcm-is-disabled` / `rcm-rotate-180`**: 유틸리티 클래스 — 삭제 대상 아님.

4. **build:styles 스크립트**: 이제 `tokens.css → primitives.css → base.css` 순으로 concat. 새 CSS 파일 추가 시 (Phase 7 layouts.css) `package.json` 의 `build:styles` 업데이트 필요.

5. **배포 절차**:
   ```bash
   echo "0.1.0-alpha.XX" | ./deploy.sh
   # 그 뒤 package.json / package-lock.json 의 버전 범프 commit
   # gjcu-experiment 재설치: sed + rm node_modules/@rcm + npm install --legacy-peer-deps
   # dev 서버 재기동: lsof -ti:9261 | xargs kill -9 ; rm -rf apps/admin/.next ; next dev --turbo -p 9261
   ```

---

## 재개 프롬프트

```
@rcm/listgrid Phase 6 이어서. 현재 alpha.35 배포됨.
docs/PHASE_6_HANDOFF.md 읽고 상태 파악 후 추천 순서 (C → A → B) 진행.
또는 "Option A", "Option B", "Option C" 중 선택해서 지정해줘도 됨.
```
