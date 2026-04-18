# @rcm/listgrid — 현재 상태

마지막 업데이트: 2026-04-18 (alpha.35 — Phase 6 연속 / ContentAsset + RevisionField primitive 전환. **새 세션 준비 완료** → `docs/NEXT_SESSION.md` 참조)

이 문서는 **작업 재개용 단일 진입점**입니다. 아키텍처 결정과 과거 맥락은 `DECISIONS.md`에 있고, 이 문서는 **지금 어디에 있고 다음에 뭘 해야 하는지**만 정리합니다.

---

## 0. 지금 당장 알아야 할 것

**배포된 현재 버전**: `v0.1.0-alpha.35` (CSS 리팩터 Phase 6 연속 — badge/chip/tag)

**다음 작업**: **Phase 6 잔여 + Phase 7/8 한 턴에 완료** — 새 세션에서 실행. `docs/NEXT_SESSION.md` 의 진입 프롬프트 그대로 붙여넣으면 병렬 에이전트 8개 + 순차 phase 7/8 으로 alpha.36 까지 완료 예상. 메인 컨텍스트 보호 우선.

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
| **0.1.0-alpha.35** | **CSS 리팩터 Phase 6 3차** — ContentAssetItem remove 버튼 → rcm-icon-btn data-color="error". RevisionField badges/chips → rcm-badge + rcm-tag data-color. base.css ~4,780 → ~4,740 | ✅ **현재 설치 대상** |

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
- ◻ Phase 6 1차 (alpha.33) — FormField.tsx `rcm-bool-icon` 잔여 JSX 수정. 그리고 base.css 에서 사용처 0 인 composite 클래스 삭제: bool/num/date icon+frame+label (약 20 규칙), rcm-card-item-action-btn* (4), rcm-tab-selected/-disabled (2). base.css 4,960 → 4,896줄.
- ⏳ Phase 6 이후 — 남은 composite 블록 (card-item-*, card-m2o-*, adv-search-*, revision-*, ca-*, alerts-*, import-*, field-selector-*, filter-dropdown-*) 을 JSX 전환 + CSS 삭제 형태로 순차 진행.
- ⏳ Phase 7~9 — REFACTOR_PLAN.md 참조

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
