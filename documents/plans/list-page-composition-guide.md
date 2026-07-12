# 리스트 페이지 컴포지션 가이드 (host page-shell)

> **상태**: 리빙 문서 (W5-4, 2026-07-12) · **규범 근거**: [스펙 §7·§9](./entityform-public-api-spec.md) · [waves §W5 결정 1](./entityform-api-implementation-waves.md) · 헌장 C1/C7 · CAP-18/19/20
> **归属**: 이 문서는 W7 패키징의 `docs/MIGRATION.md` **전용 절**(호스트 페이지 셸)로 흡수될 예정이다(waves §W5 결정 1). 그 전까지 소비자·마이그레이션 참조용 리빙 문서로 유지한다.

## 0. 핵심 원칙 — 페이지 셸은 호스트 소유다 (컴포넌트 아님)

`@listgrid/*`는 **리스트 페이지 컴포넌트를 제공하지 않는다.** 페이지 chrome(`<main>` 레이아웃·제목 헤더·"새로 만들기" 버튼·라우팅)은 **호스트 애플리케이션이 소유**한다(헌장 C7). 엔진이 제공하는 것은 리스트 *그리드* 한 조각 — `ViewListGrid` — 뿐이며, 그것을 페이지로 조립하는 것은 호스트의 몫이다.

- **왜 컴포넌트가 아닌가**: 스펙 §7 react 표에 페이지-셸 컴포넌트가 없고, §9가 페이지 셸을 "호스트 소유·MIGRATION 전용 절"로 프레이밍한다. 구 `ViewListGridWrapper`(0.3.x)를 이식하는 것은 스펙이 명세하지 않은 표면의 발명(스펙 §10 게이트 4 위반)이다.
- **이미 동작 중**: `apps/sample`의 6개 리스트 페이지(college·subject·student·major·professor·collabo)는 이미 이 bare 컴포지션으로 동작한다. 이 가이드는 그 정준(canonical) 패턴을 성문화한 것이다.
- **결과적 자유**: 호스트는 자기 디자인 시스템·레이아웃·라우팅으로 페이지를 감싸고, 엔진 그리드는 그 안에 드롭한다. 엔진이 페이지 레이아웃을 강제하지 않는다.

## 1. 프로바이더 배선 (루트에서 1회 — 호스트 주입 seam, C7)

리스트/폼 페이지가 렌더되기 전에, 호스트 주입 seam(UI 프리미티브·세션·어댑터·라우터·메시지)을 앱 루트에서 1회 배선한다. `apps/sample/app/providers.tsx` 정준 예시:

```tsx
'use client';
import {
  AdapterProvider, AuthProvider, UIProvider,
  configureMessages, registerDefaultRenderers,
} from '@listgrid/react';
import { NextRouterProvider } from '@listgrid/next';
import { defaultUIComponents } from '@listgrid/ui-default';
import { rcmAdapter } from '../lib/adapter';

registerDefaultRenderers();                 // 빌트인 필드 렌더러 등록 (모듈-로드 사이드이펙트·멱등)
configureMessages({ showConfirm, showToast, showError });  // 삭제 확인 등 메시지 채널

export function Providers({ children }) {
  return (
    <UIProvider components={defaultUIComponents}>
      <AuthProvider session={{ roles: ['ADMIN'] }}>
        <AdapterProvider adapter={rcmAdapter}>
          <NextRouterProvider>{children}</NextRouterProvider>
        </AdapterProvider>
      </AuthProvider>
    </UIProvider>
  );
}
```

- **`ListGridProvider` 편의형(스펙 §7)**: 위 6종 개별 프로바이더 나열이 부담이면 `ListGridProvider({ui, adapter, session, router, messages, customOptions})` 원샷 편의형이 동일 배선을 한 번에 감싼다. 개별 프로바이더도 존치한다(둘 다 유효).
- **커스텀 필터/셀 렌더러**: 커스텀 필드 타입을 쓰면 이 루트 모듈에서 `registerFilterRenderer(type, comp)`(고급검색 입력)·`registerListCellRenderer(type, comp)`(리스트 셀)도 함께 등록한다(§3 참조).

## 2. 정준 리스트 페이지 컴포지션

`apps/sample/app/college/page.tsx` — 가장 단순한 완결 예시(컬럼은 `withList` 파생, 고급검색은 `withFilter` 파생):

```tsx
'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createListStore } from '@listgrid/state';
import { ViewListGrid } from '@listgrid/react';
import { CollegeEntityForm, collegeFetchUrl } from '../../lib/entities/college';
import { rcmAdapter } from '../../lib/adapter';

export default function CollegeListPage() {
  const router = useRouter();
  // 헌장 C1: 같은 EntityForm 선언이 리스트와 폼 페이지를 함께 구동한다.
  const entityForm = useMemo(() => CollegeEntityForm(), []);
  const store = useMemo(
    () => createListStore({ url: collegeFetchUrl, adapter: rcmAdapter }), [],
  );

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
      {/* 헤더 행: 제목 + "새로 만들기" — 호스트 소유 chrome */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>단과대학</h1>
        <button type="button" onClick={() => router.push('/college/new')}>새로 만들기</button>
      </div>
      <ViewListGrid
        entityForm={entityForm}
        store={store}
        onRowClick={(row) => router.push(`/college/${String(row.id)}`)}
      />
    </main>
  );
}
```

**해부**:

| 조각 | 소유 | 근거 |
|---|---|---|
| `useMemo(() => EntityForm(), [])` | 호스트 | 안정된 EntityForm 인스턴스 — 리스트/폼 공용 선언(C1) |
| `useMemo(() => createListStore({url, adapter}), [])` | 호스트 | 리스트 스토어(SearchForm+페이지 결과·C9). 마운트 시 fetch |
| `<main>` + maxWidth/padding | 호스트 | 페이지 chrome — 엔진 무관(C7) |
| 제목 `<h1>` + "새로 만들기" `<button>` | 호스트 | 헤더 행·생성 네비게이션은 페이지 몫(ViewListGrid에 "New" 없음) |
| `<ViewListGrid entityForm store onRowClick>` | **엔진** | 리스트 그리드 한 조각 |
| 컬럼 | **엔진 파생** | 필드 `withList()` 선언에서 파생(CAP-19). `columns` prop 미지정 시 |
| 고급검색 패널 | **엔진 파생** | 필드 `withFilter()` 선언이 있으면 자동 노출(CAP-20). 선언 0건이면 패널·토글 미렌더 |

## 3. ViewListGrid 표면 요약 (컴포지션 관점)

`<ViewListGrid {entityForm, store, onRowClick?, selection?, toolbar?, columns?}>`(스펙 §7):

- **컬럼(CAP-19)**: 기본은 필드 `withList({order?, label?, align?, width?, sortable?})` 선언에서 파생된다. **마법 폴백 없음** — `withList` 선언이 0건이면 빈 컬럼 + dev 경고(구 "첫 ~4개 비숨김 필드 자동채택" 폐기).
- **`columns` escape hatch**: `columns={['name','type','majorCode']}`처럼 명시하면 파생을 건너뛰고 그 순서/필드로 렌더한다(`apps/sample/app/major/page.tsx` 예시). 파생 오버라이드가 필요한 페이지에서만.
- **정렬**: `sortable: true`인 컬럼 헤더 클릭 → `store.setSort` → refetch(`aria-sort` 반영).
- **셀 렌더링**: `getListCellRenderer(field.type)` 조회 → 없으면 `field.getDisplayValue` → `String`. 커스텀 셀은 루트에서 `registerListCellRenderer(type, comp)`.
- **고급검색(CAP-20)**: 필드 `withFilter({operator?, order?, label?})` 선언이 하나라도 있으면 그리드가 "고급검색" 토글 + 패널을 **내장**해 자동 노출한다(별도 컴포넌트 조립 불요). 입력은 `getFilterRenderer(field.type)` 조회 → 없으면 기본 텍스트 입력(useUI). "검색" 클릭 시 비어있지 않은 값이 `SearchForm.addAndFilter`로 AND 필터가 되어 refetch된다. `operator`는 열린 문자열이며 값이 있으면 `queryConditionType`으로 전달, 없으면 백엔드 기본값(엔진이 기본 operator를 발명하지 않는다).
  - **커스텀 필터 입력**: `registerFilterRenderer(type, comp)`(props `{field, value, onChange}`)를 루트에서 등록하면 해당 타입 필터가 그 입력으로 렌더된다.
  - **주의(발명 금지, waves 결정 2)**: 구 엔진의 ManyToOne 합성 필터 자동주입(`<field>.name` 등)은 이식되지 않았다. 관계 필드를 고급검색에 노출하려면 소비자가 명시적으로 `withFilter`를 선언한다.

## 4. 컴포지션 변형 레시피

- **명시 컬럼**: `columns` prop(§3). 파생 대신 고정 컬럼 세트가 필요할 때.
- **행 네비게이션**: `onRowClick={(row) => router.push(...)}`. 라우팅은 호스트 라우터(예: `NextRouterProvider`) 몫.
- **툴바/선택**: `toolbar`·`selection` prop(체크박스 선택 등). W6 data-transfer(엑셀 등)가 툴바 opt-in을 확장한다.
- **폼 페이지**: 같은 `EntityForm()` 선언을 `/new`·`/[id]` 페이지에서 `useEntityForm`+`ViewEntityForm`으로 조립(C1 — 리스트와 폼이 한 선언 공유). 이 가이드 범위 밖(폼 컴포지션은 별도).

## 5. list-track(W5) 커버리지 대조 — CAP-18/19/20

이 가이드가 문서화하는 소비자 표면이 소화하는 capability:

| CAP | 착지 | 소비자 접점(이 가이드) |
|---|---|---|
| CAP-18 | `withList`/`withFilter` 필드 선언 substrate (W5-1) | §2 필드 선언이 리스트/필터 참여를 opt-in |
| CAP-19 | ViewListGrid 컬럼 파생 + `registerListCellRenderer` (W5-2) | §3 컬럼 파생·`columns` escape·커스텀 셀 |
| CAP-20 | 고급검색 패널(내장) + `registerFilterRenderer` (W5-3) | §3 고급검색 패널·커스텀 필터 입력 |

## 6. 알려진 한계 (§Needs Review 연동)

- **고급검색 재적용 de-dup**: 같은 필드에 대해 값을 바꿔 "검색"을 두 번 누르면 AND 절이 누적된다(단일 apply는 정확). SearchForm에 "이름별 제거" 프리미티브가 아직 없다(W5-3 스코프 밖). 소비자가 반복 필터링 UX가 필요하면 현재는 페이지 리로드/스토어 재생성으로 우회한다. 후속 개선 후보(§Needs Review #W5-3).
