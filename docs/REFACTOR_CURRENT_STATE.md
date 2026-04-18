# CSS Architecture — Current State (alpha.27 기준)

> 2026-04-18 작성. 다음 세션에서 리팩터 진행하기 전 **현재 상태 스냅샷**.
> 이 문서의 수치는 `cd src && grep -rEn 'rcm-'` 명령으로 재현 가능.

---

## 1. 한눈에 보기

| 항목 | 값 |
|---|---|
| `src/listgrid/styles/base.css` 줄 수 | **4,960** |
| `src/listgrid/styles/tokens.css` 줄 수 | 110 |
| 선언된 고유 `.rcm-*` class 개수 | **627** |
| `rcm-` 접두사 prefix 그룹 | 76 |
| 라이브러리 JSX 내 하드코딩 Tailwind | **0** |

## 2. 문제의 본질

현재 상태는 "라이브러리의 CSS" 라기보다 **"gjcu UI 한 세트를 그대로 하드코딩한 테마 번들"** 에 가깝다. 증상:

1. **하이퍼-스페시픽 클래스**
   - 예: `rcm-card-m2o-search-submit`, `rcm-revision-diff-banner-changed`, `rcm-quick-search-addon-clear`, `rcm-adv-search-qs-input-panel`
   - 하나의 컴포넌트의 한 하위 요소 상태 하나를 위해 클래스를 생성 → **재사용 제로**
2. **컴포넌트당 15~30개 전용 클래스**
   - CardManyToOneView 단독으로 `.rcm-card-m2o-*` 36개, CardItem 29개, RevisionField 20개, AdvancedSearchFormV2 33개
   - 사용처는 **해당 컴포넌트 하나뿐**
3. **variant / state 를 class name 에 박아넣음**
   - `.rcm-button-primary`, `.rcm-button-outline-danger`, `.rcm-bool-icon-frame-true`, `.rcm-alerts-header-collapsed`
   - 업계 표준 (Mantine/Radix/shadcn) 은 `data-variant="primary"` / `data-state="collapsed"` 로 분리
4. **Primitive 와 composite 의 경계 없음**
   - `rcm-button` (primitive) 과 `rcm-card-m2o-action-btn-primary` (composite) 가 같은 파일에 섞여 있음
   - 어떤 게 재사용 가능하고 어떤 게 local 인지 구분 불가
5. **"Library JSX 는 Tailwind 안 쓴다" 목표는 달성**되었지만, 그 대가로 CSS 가 호스트별 디자인에 락인됨

## 3. Prefix 분포 (상위 20개)

```
  99 .rcm-card           ← 최다. card-item / card-m2o / card-field-* 섞여 있음
  55 .rcm-subcollection  ← TableSubCollection + CardSubCollection + Inline 쉘
  47 .rcm-field          ← field-label / field-input / field-icon / field-* 섞임
  34 .rcm-adv            ← AdvancedSearchForm 전용
  28 .rcm-revision       ← RevisionField 전용
  26 .rcm-skeleton       ← Skeleton 시스템 (여기는 그나마 체계 있음)
  23 .rcm-listgrid       ← ListGrid 자체 구조
  22 .rcm-ca             ← ContentAsset 전용
  20 .rcm-import         ← DataImport 전용
  18 .rcm-alerts         ← ViewEntityFormAlerts 전용
  16 .rcm-form           ← ViewEntityForm 레이아웃
  13 .rcm-m2o            ← ManyToOneView 관련
  11 .rcm-input          ← Input 관련 (primitive + group)
  11 .rcm-filter         ← FilterDropdown 전용
  11 .rcm-bool           ← BooleanField / NumberField 아이콘 프레임
  10 .rcm-alert          ← AlertItem (rcm-alerts 와 별도)
   9 .rcm-modal          ← SmsModal 등 모달 쉘
   8 .rcm-button         ← primitive. 가장 "라이브러리스러운" 것
   8 .rcm-status         ← StatusChangeReasonModal 전용
   8 .rcm-rule           ← RuleBasedField / RuleCondition 전용
```

전체 76 prefix 중 **대다수가 단일 컴포넌트 전용**. 진짜 primitive (`rcm-button`, `rcm-tab`, `rcm-notice`, `rcm-row`, `rcm-stack`, `rcm-panel`) 는 10개도 안 됨.

## 4. 호스트 커스터마이징 경로 (현재)

1. **CSS 변수 override** — 가장 깔끔. tokens.css 의 `--rcm-color-*`, `--rcm-space-*`, `--rcm-radius-*` 를 호스트 CSS 에서 재정의.
2. **`<ViewEntityForm classNames={...} />` prop** — 여전히 존재. 컴포넌트 slot 별 추가 클래스 주입. 현재는 theme 기본값이 대부분 `""` 로 비어있어 호스트가 채워 넣는 용도.
3. **직접 CSS selector override** — `.rcm-*` 클래스를 호스트 stylesheet 에서 덮어쓰기. 현재 구조에선 wildcard 매칭이 안 돼서 **컴포넌트당 30개 selector 를 호스트가 다 알아야 override 가능** — 실용적이지 않음.

## 5. JSX 사용 패턴 (현재 대표 예시)

```tsx
// 현재 CardItem 의 action button (alpha.27)
<button
  onClick={handleDeleteClick}
  className="rcm-card-item-action-btn rcm-card-item-action-btn-danger"
  aria-label="Delete"
>
  <IconTrash className="rcm-card-item-action-icon" />
</button>
```

문제: `rcm-card-item-action-btn` 은 CardItem 에만 쓰이고, `rcm-card-item-action-btn-danger` 도 마찬가지. 다른 화면에서 "작은 아이콘 버튼" 을 쓰려면 **같은 스타일을 또 다른 이름으로 재정의** 하게 됨.

## 6. Primitive 후보 (재사용 가능성 기준)

리팩터 시 **살려야 하는** 진짜 primitive (현재도 여러 곳에서 쓰이거나, 쓰여야 하는 것):

| primitive | 현재 상태 | 사용처 |
|---|---|---|
| `rcm-button` + variants | ✅ 존재, variant 는 class 이름 | 거의 모든 action 버튼 |
| `rcm-row` / `rcm-stack` / `rcm-row-between` | ✅ 존재, layout primitive | 전역 |
| `rcm-panel` / `rcm-surface` | ⚠️ 일부 존재, fieldgroup 과 중복 | 카드/박스 |
| `rcm-tab-list` / `rcm-tab` / `rcm-tab-selected` | ✅ 존재, variant 는 class | EntityForm 탭 |
| `rcm-notice` + variants | ✅ 존재 | alert, 주의문구 |
| `rcm-field-label` / `rcm-field-input` / `rcm-field-error` | ✅ 부분 존재 | 폼 필드 전체 |
| `rcm-skeleton-*` | ✅ 존재 | loading 전체 |
| `rcm-badge` / `rcm-chip` | ❌ 없음 (컴포넌트별로 ad-hoc) | 태그/뱃지 표시 |
| `rcm-icon-btn` (작은 아이콘 버튼) | ❌ 없음 (각 컴포넌트가 자체 정의) | edit/delete/copy/close 등 |
| `rcm-menu` / `rcm-menu-item` | ❌ 없음 (`rcm-m2o-dropdown-*`, `rcm-phone-list-dropdown-*` 로 중복) | dropdown 메뉴 |
| `rcm-input-group` / `rcm-input-addon` | ⚠️ 일부 존재 (`rcm-input-addon-btn`) | input + 버튼 그룹 |

## 7. 제거 대상 (리팩터 후 삭제될) 클래스 그룹

아래 prefix 들은 **전부 composite** 이라 primitive 조합으로 대체 가능:

- `rcm-card-m2o-*` (36개)
- `rcm-card-item-*` (29개)
- `rcm-adv-search-*` (33개)
- `rcm-revision-*` (20개)
- `rcm-ca-*` (22개)
- `rcm-alerts-*` + `rcm-alert-item-*` (28개)
- `rcm-import-*` + `rcm-importer-*` (24개)
- `rcm-filter-dropdown-*` (11개)
- `rcm-field-selector-*` (20개)
- `rcm-phone-list-*` (4개)
- `rcm-copy-*` (4개)
- `rcm-bool-*` + `rcm-num-*` + `rcm-date-*` (약 20개) — 통합 `rcm-chip` + `rcm-icon` 로 축소
- `rcm-rule-*` (8개)
- `rcm-adv-search-legacy-*` (4개) — 아예 삭제 가능
- `rcm-quick-search-*` (7개) — input-group 으로
- `rcm-tree-node-*` (7개) — tree 전용 유지하되 축소
- 기타 컴포넌트별 micro-class 다수

**삭제 + 대체 통합 후 예상 클래스 수**: 627 → **약 60개 (primitive 20 + variant/state selector + 꼭 필요한 레이아웃 클래스)**

## 8. 리팩터의 주 위험 요소

1. **시각 regression** — 이번 alpha.19 → alpha.27 내내 겪은 문제. primitive 로 통합하는 과정에서 specific 스타일 (예: CardManyToOneView 의 hover ring, RevisionField 의 diff amber banner) 이 누락될 수 있음.
2. **호스트 override 호환성** — 호스트가 `.rcm-card-m2o-search-submit` 을 override 하고 있으면 리팩터 후 깨짐. 현재는 gjcu-experiment 만 consumer 라 위험 낮음.
3. **변경 범위** — src/listgrid 내 50+ 컴포넌트 파일 + base.css 전면 재작성. PR 단위로 쪼개지 않으면 리뷰/롤백 어려움.
4. **theme classNames 계약** — 현재 defaultTheme 이 거의 비어 있는 상태 (`""`). 리팩터 후 이걸 primitive 클래스로 재정의할지, 아니면 컴포넌트 JSX 가 hardcode 하고 theme 은 순수 additive 로 둘지 결정 필요.
