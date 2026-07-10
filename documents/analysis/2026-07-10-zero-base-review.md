# @rchemist/listgrid 제로베이스 분석 보고서

**작성**: 2026-07-10 · 대상 버전 v0.3.25 (main 48ab863)
**방법**: 42-에이전트 분석 워크플로우 — 서브시스템 매핑 10 + 문서 감사 1 + 시장 조사 1(sonnet) → 차원별 비평 6(opus/sonnet) → high/critical 발견 18건 적대적 검증(opus) — 에 더해 세션 차원의 직접 재현(테스트 스위트 실행, Node 패키지 로드, 핵심 코드 정독).
**원자료**: [`analysis/2026-07-10/raw/`](./2026-07-10/raw/) 18건 · 심각도 정정 내역: [`analysis/2026-07-10/verification-log.md`](./2026-07-10/verification-log.md) — **원자료 인용 시 정정 로그가 우선한다.**

---

## 0. 요약 판정

> **판정: PIVOT — 조건부 GO.**
> "react-admin/Refine의 범용 대항마"로는 **NO-GO**다. 그러나 이 코드베이스는 다시 쓸 물건이 아니라 **계층을 다시 그을 물건**이다(코드 생존율 70~75% 추정). 스코프를 **① RCM-framework 진영의 내부 플랫폼 표준 + ② 한국형/규제산업 니치 OSS**로 재정의하고, 아래 4개 선결 조건을 6개월 내 통과시키면 상용 모듈로서 실재하는 가치가 있다. 통과하지 못하면 외부 상용화는 접고 내부 자산으로 유지하는 것이 정직한 선택이다.

**선결 조건 (순서대로):**

| # | 조건 | 근거 | 규모 |
|---|---|---|---|
| C1 | **패키지가 표준 도구에서 로드되게** — 현재 순정 Node에서 require/import 모두 실패 (재현 확정) | [ADR-0001](../adr/ADR-0001-packaging-esm-build.md) | 1~2주 |
| C2 | **표방-현실 정직화 + 표면 안정화** — 배럴 580 export → ~200, semver 규율, 도메인 잔재 격리 | [ADR-0004](../adr/ADR-0004-public-api-surface.md) | 3~5주 |
| C3 | **폼 상태 모델 재설계** — 유일 차별점(깊은 서브컬렉션 편집)이 지금은 성능·부채의 진원지 | [ADR-0002](../adr/ADR-0002-form-state-instance-store.md) | 8~12pw |
| C4 | **보안·품질 기준선** — XSS 봉쇄, fail-open 권한 경고, 렌더 테스트 인프라, 환경 고정 | [ADR-0006](../adr/ADR-0006-security-baseline.md), [ADR-0007](../adr/ADR-0007-quality-gates.md) | 병행 |

사용자의 일곱 질문에 대한 한 줄 답:

1. **목표가 무엇인가** — 선언적 엔티티 메타데이터 하나로 리스트+폼+서브컬렉션+엑셀+리비전까지 완결 CRUD UI를 렌더하는, UI킷/라우터/백엔드를 provider 계약으로 주입받는 React 엔진 (§1).
2. **기능이 무엇인가** — §1.2 인벤토리. 기능 폭 자체는 유료 경쟁재(react-admin EE)급이다.
3. **목표가 실현 가능하고 의미 있는가** — 기술적으로 실현 가능(§3), 의미는 **스코프를 좁혔을 때만** 있다(§4). "framework-free 범용"은 과장이었고, 니치 3개(내부 표준·한국형·규제산업 딥 서브컬렉션)에는 명확한 리더가 없다.
4. **엔터프라이즈급에 부족한 것** — 패키징(로드 불가), 보안(XSS·fail-open), 테스트(렌더 계층 0), i18n(계약만 있고 222개 파일 한국어 하드코딩), a11y, 마이그레이션 문서 (§5).
5. **잘못 구현/부적절/중복** — 실버그 확정 5건 + 중복 클러스터 5개(~400-500줄) + 죽은 코드 (§6).
6. **개선이 필요한 부분** — 아키텍처 3축(폼 상태·config↔render 계약·전역 싱글턴)은 in-place 수리 불가, 계층 재설계 필요 (§7).
7. **상용 SW가 되려면 / 가치가 없는가** — §8. 가치가 0이 되는 경우는 단 하나: 원 호스트 진영이 이 엔진을 버릴 때(조직 문제이지 코드 문제가 아님).

---

## 1. 이 시스템은 무엇인가

### 1.1 목표 (문서·코드에서 재구성)

원형은 GJCU 학사 시스템(Next.js 모노리스)의 어드민 CRUD 계층이다. 이를 npm 패키지로 추출하면서 목표가 이렇게 진화했다 (README.md, docs/ROADMAP.md→archive, CHANGELOG 0.3.21):

- **선언 = 화면**: `new EntityForm('user', '/api/users').addFields({...})` 클래스 빌더 선언만으로 리스트/폼 화면 전체가 렌더된다. 보일러플레이트 카피페이스트 제거가 존재 이유.
- **호스트 중립**: UI 프리미티브(UIProvider ~49계약), 라우터, URL 상태(nuqs 계약), 인증 세션, HTTP 클라이언트, 메시지(토스트/알럿), i18n 전부 주입식. Tailwind 불요, 자체 CSS 디자인 시스템(`rcm-*` + data-attr + 토큰).
- **RCM-framework 공생**: 백엔드는 rcm-backend-framework 0.1.0의 `AbstractCrudController` 관례(POST {url}/search, ResponseData envelope)를 1급으로 지원.

### 1.2 기능 인벤토리 (실측)

| 영역 | 기능 |
|---|---|
| 리스트 | 페이지네이션·정렬(다중)·퀵서치·고급검색(V2)·필터·컬럼 선택·행 선택/일괄 삭제·행 액션·URL 상태 동기화·카드/테이블 뷰·서브컬렉션 인라인/모달·Open-in-new-window |
| 폼 | 필드 40종(문자/숫자/날짜 계열/선택 계열/ManyToOne/파일·이미지/주소·지도/QR/HTML/Markdown/색상/전화 등)·탭·필드그룹·조건부 표시/필수/읽기전용·검증 12종·생성 스텝(위저드)·자동저장(sessionStorage)·리비전 히스토리·중첩 서브컬렉션 편집 |
| 데이터 | Excel import/export(암호화 지원, registry 주입식)·API 스펙 뷰어·CustomOption(백엔드 옵션) 프리페치 |
| 통합 | Next.js 어댑터·headless UI 베이스라인·configure*/register* 전역 레지스트리 15종·엔드포인트/권한 레지스트리 |
| 디자인 | 5-layer CSS(tokens/primitives/layouts/components/base)·다크모드 3-way·컨테이너 쿼리(부분)·테마 variant 3종 + classNames 슬롯 |

이 폭은 실제로 희소하다 — 시장 조사(§4) 기준, 서브컬렉션 인라인 편집·리비전·엑셀을 **무료 오픈소스로 전부 내장**한 React CRUD 엔진의 명확한 리더는 없다 (react-admin은 상당 부분 유료 EE, Refine은 선언 깊이가 얕음).

### 1.3 실사용 근거

GJCU 학사(원 호스트) + edustack 5-SPA 계열이 프로덕션 소비 중(documents/issues/7~9). 이슈 기반 회귀 수정(0.3.22)과 백포트 라인(release/0.2) 운영 — 즉 "효용은 검증됐다"는 사용자 진술은 사실과 부합한다.

---

## 2. 분석 결과가 사용자의 자기 진단을 어떻게 재판정했나

사용자(유지보수자)의 3가지 불만을 코드로 재판정한 결과 — **셋 다 방향은 맞지만 좌표가 다르다**:

| 자기 진단 | 재판정 | 실제 좌표 |
|---|---|---|
| "UI와 기능이 스파게티처럼 섞여 있다" | **부분 사실** | 폼 최상위는 오히려 분리돼 있다(ViewEntityForm은 순수 렌더, useEntityFormLogic이 로직 — raw/map-form-runtime). 진짜 결합은 ① `EntityField.view(): Promise<ReactNode>`가 **인터페이스 계약**에 렌더를 박아둔 것(EntityField.ts:60), ② SubCollectionField 4종이 config 클래스에서 JSX를 직접 리턴(SubCollectionField.tsx:308), ③ config 클래스 안 `useSession()` 훅 호출(EntityForm.tsx:613-615), ④ God-컴포넌트는 ViewListGrid 쪽이다 |
| "권한 관리가 이상하다" | **사실** | `isPermitted` 로직이 EntityTab/EntityFieldGroup/FormField에 3중 복붙, 정작 **SubCollectionField에는 권한 체크 자체가 없음**(getVisibleCollections는 isHidden만 봄). 메뉴 권한 게이트는 미설정 시 **무경고 전면 허용**(fail-open)이고 이름(checkAdminMenuPermission)부터 원 호스트 CMS 개념 |
| "ViewEntityForm이 props drilling + 중첩 재귀라 상태 관리가 어렵다 — SubViewEntityForm을 분리했으면 해결됐을까?" | **문제는 사실, 해법은 오답** | 드릴링과 리렌더 폭발은 같은 뿌리 — **상태 전파 채널이 가변 EntityForm 참조 하나**뿐이라서다. 키 1타 = `clone(true)` 폼 전체 딥클론 + unmount=false로 전 탭 마운트 + FieldRenderer deps `[entityForm]` 광역 재계산. SubViewEntityForm 분리는 렌더 분기를 컴포넌트 경계로 옮길 뿐 딥클론·드릴링·재진입 refetch 어느 것도 해결 못 한다(적대적 검증 확정). 정답은 **인스턴스별 store + 셀렉터 구독**([ADR-0002](../adr/ADR-0002-form-state-instance-store.md)) |

---

## 3. 목표는 실현 가능한가 — 아키텍처 판정

**골격은 살아 있다. rewrite는 오판이다.** (raw/critique-architecture, 요지)

- 필드 카탈로그 17.9k LOC(전체의 34%), SearchForm(961L), 토큰/다크모드/`rcm-*` 규율 100%의 CSS 계층, URL 어댑터, RuntimeConfig 레지스트리는 **상용급 자산**이며 목표 아키텍처에서 대부분(70~75%) 생존한다.
- 그러나 3개 축은 in-place 리팩터링으로 못 고치고 **계층 경계를 새로 긋는 재설계**가 필요하다:
  1. **폼 상태 모델** — 가변 클래스 참조 하나 → 인스턴스 store+셀렉터 (8~12pw, 성패의 핵심)
  2. **config↔render 계약** — `EntityField.view()` 제거, 렌더러 레지스트리(type→컴포넌트) 분리. 이것이 madge 실측 **순환 의존 213건**의 주 해소 경로이기도 하다 (4~6pw)
  3. **모듈 전역 가변 싱글턴 14개** — SPA 소비자에겐 실질 안전하나, SSR 멀티테넌트를 팔려면 요청 스코프 컨테이너 필요 (3~5pw, 연기 가능)
- 목표 4계층: `schema-core(React 0%) / headless-state / renderer / adapters` — 상세와 생존율 표는 [ADR-0003](../adr/ADR-0003-schema-render-separation.md) 및 raw/critique-architecture §5.
- 총 마이그레이션 **20~30 person-week** (시니어 1인 기준; 공수 수치는 검증자 주석대로 "의견"으로 취급).

**장기 비전 3종의 실현 가능성**: ① 범용 CRUD 레퍼런스 엔진 — 아키텍처상 가능하나 시장상 무의미(§4) ② 백엔드 어댑터 다변화 — envelope 결합이 3-파일 경계에 수렴해 있어 어댑터 계약 승격으로 가능([ADR-0005](../adr/ADR-0005-backend-adapter-contract.md)) ③ 디자인 시스템 독립 패키지 — CSS만은 "8부 능선"(rcm-* 규율 100%, 토큰 견고). 단 레이어 간 충돌 셀렉터 정리와 tailwind-merge 하드 의존 제거가 선결이고, classNames 테마 시스템은 React 트리에 강결합돼 CSS만 분리 가능 (raw/map-styles §5).

---

## 4. 목표가 의미는 있는가 — 시장 판정

2026년 지형 (raw/market.md — 웹 리서치 기반):

| 경쟁재 | 포지션 | listgrid 대비 |
|---|---|---|
| react-admin | 10년차 리더, open-core (EE 2인 월 €125~) | 성숙도 압승. 단 MUI 강결합, 서브컬렉션·리비전급 기능은 유료 EE 벽 |
| Refine | provider 철학이 가장 유사, MIT 오픈코어 | UI킷 비의존 이미 실현. 단 선언 깊이가 얕아 조립 비용 잔존, 완결 기능(엑셀/리비전) 약함 |
| AdminJS | ORM 스키마 자동생성 | 다른 카테고리(자동생성 vs 선언). 커스터마이즈 얕음 |
| AG Grid / MUI X | 그리드 엔진 (dev당 연 $995~) | 폼/CRUD 워크플로 스코프 밖 — 경쟁이 아니라 잠재 통합 대상 |
| TanStack Table/Form | 완전 헤드리스 | 반대 극단 — 잠재 하부 엔진 |
| Retool/Appsmith | 로우코드 SaaS | 다른 페르소나. 정면 경쟁 아님 |

**빈틈은 실재하나 좁다**: "클래스 선언 하나로 리스트+폼+서브컬렉션 인라인편집+리비전+엑셀까지, 대부분 무료 개방, UI킷 비의존" 조합엔 명확한 리더가 없다. 그러나 이것은 해자(moat)가 아니라 틈새다. 현실적 포지셔닝 3개:

1. **RCM-framework 진영의 내부 플랫폼 표준** — 결합을 자산으로 유지 (최저 리스크)
2. **한국형 어드민 엔진** — 카카오맵/다음우편번호/한국형 필드 내장을 격리된 프리셋으로 상품화
3. **규제산업(딥 서브컬렉션+리비전 필수) 니치** — react-admin EE 유료벽 대비 가격 경쟁

수익화 평가: **(A) OSS+구축/지원 용역 × (C) 내부 표준의 하이브리드가 최적**. (B) open-core 유료벽 재설계는 기존 무료 기능 회수 반발 리스크 — 신규 부가 모듈(감사로그·실시간·AI 보조)만 유료화 여지. (D) 로우코드 SaaS 피벗은 자본력상 비현실적.

---

## 5. 엔터프라이즈 준비도 — 격차 지도

평균 2점대/5 (raw/critique-enterprise). 검증 정정 반영:

| 영역 | 현재 | 격차 | 즉시 조치 |
|---|---|---|---|
| **보안** | **HtmlField 저장형 XSS(critical 확정)** — sanitizer 없이 dangerouslySetInnerHTML (HtmlField.tsx:34; ShowNotifications.tsx:90, ViewHelpIcon.tsx:28 동일) · 메뉴 권한 fail-open · simpleCrypt 폴백 키(공개 API 도달 불가로 low 정정) | L | sanitizer 주입 계약 필수화 |
| **테스트** | 로직 계층만 930 테스트(질은 양호 — snapshot 남용 0, 이슈 기반 회귀 테스트 문화). **렌더 계층 0**: 필드 40종·ViewEntityForm·ViewListGrid·FieldRenderer 렌더 테스트 전무. 커버리지 ~17%, 임계치는 하향 고정. **이 체크아웃(Node 26)에서 27건 실패** — engines/.nvmrc 부재 | XL | 환경 고정 + 특성화 테스트 그물(ADR-0002 선결이기도 함) |
| **i18n** | 계약(configureTranslator, identity fallback)은 모범적. 그러나 비테스트 소스 **222개 파일에 한국어 하드코딩** — 검색 연산자 설명 24종, 세션만료 모달, `t('순서 변경')`처럼 한국어 원문이 키인 사례까지 | L | 코어 사용자 표면부터 키 체계 통일 |
| **a11y** | 0.3.23에서 개선 시작했으나 headless Modal에 focus trap/role/Esc 없음, 정렬 헤더 키보드 조작 불가 | M | headless 베이스라인 보강 |
| **성능** | 가상화 없음(기본 20행 페이지네이션이라 정상 사용 미발현 — medium 정정) · 키 1타 폼 전체 딥클론(§2) | M~L | ADR-0002로 흡수 |
| **패키징** | **순정 Node 로드 불가(critical 확정)** · semver 위반(0.3.x 마이너 내 BREAKING 3회) · CJS/ESM 이중 지원 없음 · 소스맵 없음 | L | ADR-0001 |
| **문서** | 온보딩 문서 6계약 vs 실제 통합 지점 20개(UIProvider 필수 47필드) · MIGRATION 0.3.x 공백 · docs/api 4월 이후 stale | M | 본 세션에서 1차 현행화 완료 (§9) |
| **권한 모델** | 필드/탭/그룹 `withRequiredPermissions`는 깨끗. 구조 결함은 3중 복붙 + SubCollection 누락 + fail-open | M | PermissionPolicy 단일화 |

---

## 6. 잘못 구현된 것들 — 확정 버그와 중복

### 6.1 실버그 (적대적 검증 통과)

| # | 버그 | 위치 | 정정 심각도 |
|---|---|---|---|
| B1 | `getValueAsNumber/Boolean` 연산자 우선순위 오류 — `??`보다 `===`가 먼저 평가돼 update 모드 min/max 검증이 사실상 no-op (node 재현) | validations/Validation.tsx:109-124 | high (내부 호출처 0, 소비자 opt-in 시 발현) |
| B2 | DatetimeField가 type='date'로 등록 → Excel **range export·import 전체에서 시간 유실** (단일 export는 무손실) | DatetimeField.tsx:24, transfer/Type.ts:565-610 | high |
| B3 | FieldRenderer onChange 2벌(~65줄 축자 복제)이 `.catch()` 없는 IIFE — validator/link throw 시 unhandled rejection, 필드가 값·에러를 조용히 잃음 | FieldRenderer.tsx:77-142, 240-310 | high |
| B4 | 전역 pageSize(localStorage)가 리스트별 `defaultPageSize` 지정을 마운트 시 조용히 덮어씀 | useQuickSearchBar.ts:112-117 vs useListGridLogic.ts:461 | high(맵 판정, 비평 미재검증) |
| B5 | `useLoadingStore`가 훅 이름이지만 구독 메커니즘 없음 — 상태가 바뀌어도 리렌더 안 됨 | loading/index.ts:12-29 | high |
| B6 | `EntityForm.clone()`이 manageEntityForm만 참조 공유 | EntityForm.tsx:51 | **low로 정정** — mutate하는 빌더의 호출처 0건. 1줄 수정 가치는 있음 |
| B7 | config 클래스 안 `useSession()` — sessionRequired=true 폼에서 조용한 기능 파손 | EntityForm.tsx:613-615 | high (아키텍처 증거로서) |

### 6.2 의도치 않은 중복 (정리 시 ~400-500줄 절감)

- SubCollectionField Card/Table/Inline 3변형: buildSearchForm ~105줄 축자 중복 + render() 골격 반복 — 부모에 이미 protected 헬퍼 존재, 저위험 통합
- `isPermitted` 3중 복붙 (EntityTab ≈ EntityFieldGroup ≈ FormField) + SubCollection 누락
- Xref* 4형제: 공통 베이스 없이 isBlank/생성자/한국어 helpText 4벌
- misc/index.ts ↔ utils/CompareUtil·StringUtil: isEquals/isEmpty 등 **파일 단위 100% 중복**, 양쪽 다 테스트로 고정된 이중 API
- FieldRenderer onChange 2벌 (B3와 동일 지점)

### 6.3 죽은/잔재 코드

- AdvancedSearchForm V1: 공개 export되나 내부 사용처 0 (V2가 실사용)
- EntityFormBase의 `instanceof EntityForm` 방어 4곳: 유일 서브클래스 기준 항상 참/거짓
- 한국어 토큰만료 문자열 매칭(EntityForm.tsx:194): throw가 바로 삼켜지는 **사실상 no-op** (low 정정)
- ASSET_SERVER_URL 폴백에 원 호스트 개발 IP `http://127.0.0.1:8320` 하드코딩

### 6.4 호스트 잔재 (코어 배럴 오염)

- SelectField에 학원/결제 도메인 색상맵(ENROLLED/GRADUATED/PAID/UNPAID…) 하드코딩 + **CardItem.tsx에 두 번째 사본**(검증 중 추가 발견)
- Preset.tsx(442L): MarketingField('주문서에 표시')·DeviceTypes('가입 채널')·PublishStatus·SeoMetadata가 `export *`로 코어 노출 — 제네릭 프리셋(NameField 등)과 혼재
- RevisionField: 특정 리비전 테이블 스키마(revisionEntityId, 감사 필드명) 오버라이드 불가 전제
- Excel 다운로드 로깅: 옵트아웃 불가로 호스트 전용 엔드포인트 호출
- CRUD URL 관례·envelope 파싱 하드와이어(EntityForm.tsx:676-688, form/Type.ts:91-168) — **"정해진 아키텍처 강제" 불만의 실체.** 단 Router/UrlState/Message/Next 어댑터/옵트인 서브패스는 실측 결과 **실제로 이식 가능** — 불만이 적용되지 않는 반례도 분명히 있다

---

## 7. 개선 방향 — 무엇을 어떤 순서로

설계 결정은 ADR로, 실행 순서는 로드맵으로 분리했다. 요약:

| 순서 | 작업 | 문서 |
|---|---|---|
| P0 | 실버그 핫픽스(B1~B6) + fail-open 경고 + XSS sanitizer 계약 + 환경 고정(engines/.nvmrc) | [plans/v1-roadmap.md](../plans/v1-roadmap.md) §P0 |
| P1 | 패키징: dual ESM/CJS 빌드 + CI 로드 스모크 + 소스맵 | [ADR-0001](../adr/ADR-0001-packaging-esm-build.md) |
| P2 | 특성화 테스트 그물 (재설계 선결) | [ADR-0007](../adr/ADR-0007-quality-gates.md) |
| P3 | API 표면 재단: 배럴 화이트리스트 ~200, presets 서브패스 격리, @deprecated 체계, peer 7→최소화+ui-default | [ADR-0004](../adr/ADR-0004-public-api-surface.md) |
| P4 | config↔render 분리: EntityField 계약 분해 + 렌더러 레지스트리 (순환 213건 해소) | [ADR-0003](../adr/ADR-0003-schema-render-separation.md) |
| P5 | 폼 상태 재설계: 인스턴스 store + 셀렉터 + 값/메타 분리 (**성패의 핵심**) | [ADR-0002](../adr/ADR-0002-form-state-instance-store.md) |
| P6 | 백엔드 어댑터 계약: configureBackendAdapter + ./backend/rcm 기본 어댑터 | [ADR-0005](../adr/ADR-0005-backend-adapter-contract.md) |
| P7 | 엔터프라이즈 기준선: i18n 전면화·a11y·(선택)SSR 요청 스코프 | [ADR-0006](../adr/ADR-0006-security-baseline.md) |

**하지 말 것 (Do-NOT)** — 분석이 명시적으로 기각한 경로:

- **rewrite-from-scratch** — 17.9k LOC 필드 카탈로그 등 자산을 태우는 오판
- **SubViewEntityForm 단독 분리** — 증상 대응. store 재설계(ADR-0002)의 부산물로만 흡수
- **xstate 폼 상태 머신 단독 도입** — 값 store가 결국 따로 필요, ROI 낮음. 흐름 제어가 아플 때 A 위에 선택
- **전역 싱글턴의 순수 React Context화** — config 클래스가 렌더 트리 밖에 살아 불가능. 요청 스코프 컨테이너가 정답(그마저 SSR 판매 시에만)
- **기존 무료 기능의 유료벽 후퇴** — 커뮤니티 신뢰 파괴. 유료화는 신규 부가 모듈만

---

## 8. 상용 소프트웨어로서의 최종 판단

**가치가 있다 — 단, "무엇으로서"를 바꿔야 한다.**

- **범용 어드민 프레임워크로서**: 가치 없음. react-admin(10년 생태계)·Refine(동일 철학 선점)과의 격차는 코드 품질이 아니라 생태계·신뢰의 격차이고, 이는 코드로 못 따라잡는다.
- **RCM-framework 수직 플랫폼의 프론트 엔진으로서**: 이미 가치가 실증됨(프로덕션 2계열). 결합을 "부채"가 아니라 "제품"으로 재해석하면 — 백엔드 관례가 코어에 하드와이어된 것이 아니라 `./backend/rcm` 기본 어댑터로 **문서화된 1급 지원**이 되면 — 이 조합 자체가 국내 SI/솔루션 시장에서 파는 물건이 된다.
- **니치 OSS로서**: "선언만으로 완결 CRUD(서브컬렉션·리비전·엑셀 내장)"는 시장에 리더가 없는 실재하는 틈. 다만 6개월 내 C1~C4를 통과 못 하면 이 틈도 다른 플레이어(shadcn-admin-kit 등 신흥)에게 닫힌다.
- **완전 무가치 시나리오**: 원 호스트 진영이 엔진을 버리고 다른 스택으로 이탈하는 경우뿐 — 이는 조직/전략 문제이지 이 코드의 문제가 아니다.

**신뢰 회복이 기술 부채보다 급하다**: 지금 가장 위험한 것은 딥클론도 스파게티도 아니라, **README가 말하는 것과 패키지가 실제로 하는 것의 간극**이다 (v0.2.0 표기·884+ 테스트 표기·"framework-free"인데 순정 Node 로드 불가·semver 위반 BREAKING). 상용은 "약속을 지키는 소프트웨어"라는 뜻이고, C1·C2가 아키텍처보다 먼저인 이유다.

---

## 9. 문서 체계 정리 (본 세션 실행 내역)

문서 감사(raw/docs-audit.md) 판정에 따라 실행:

| 조치 | 대상 |
|---|---|
| 아카이브 | documents/PROGRESS.md(완료본) → archive/2026-05-29-…; docs/REFACTOR_HOST_COUPLING.md(실행 완료된 계획서 — 단 §3.3 withOpenInNewWindowPermission은 스코프 축소로 미구현·TODO 잔존) → archive/2026-04-24-…; docs/ROADMAP.md(v0.2.0 시점 정지) → archive/2026-04-21-… |
| 현행화 | README(버전/테스트 수/링크), CHANGELOG(0.3.23~25 소급), getting-started(필수 peer 5종 누락 정정 + 레지스트리 표 신설), MIGRATION(0.2.x→0.3.x 섹션 신설), EXTENSIONS(:293 문구), issues/7·8·9 fix-plan Status 헤더(OPEN→CLOSED 정정) |
| 생성물 정책 | docs/api(5.1MB·596파일, v0.2.0 이후 stale) git 추적 제거 + .gitignore — `npm run docs`로 로컬 생성. "재생성 커밋" 정책은 실패가 실증되었으므로 폐기 |
| 신설 | documents/README.md(문서 체계 인덱스·권위 규칙), analysis/(본 보고서+원자료+검증 로그), adr/(7건), prd/, plans/ |

**재발 방지 규칙** (documents/README.md에 명문화): 릴리스 체크리스트에 "CHANGELOG 최상단 == package.json 버전" 게이트, PROGRESS는 완료 즉시 archive로, raw 분석 자료는 반드시 검증 로그를 경유해 인용.

---

## 부록 A. 근거 문서 인덱스

- 서브시스템 지도 10: [`2026-07-10/raw/map-*.md`](./2026-07-10/raw/) (packaging/core-model/form-runtime/list-runtime/fields/providers/aux-features/styles/quality/api-surface)
- 차원 비평 6: [`2026-07-10/raw/critique-*.md`](./2026-07-10/raw/) (architecture/api-packaging/code-quality/enterprise/host-coupling/viability)
- 문서 감사: [`2026-07-10/raw/docs-audit.md`](./2026-07-10/raw/docs-audit.md) · 시장 조사: [`2026-07-10/raw/market.md`](./2026-07-10/raw/market.md)
- **심각도 정정(우선)**: [`2026-07-10/verification-log.md`](./2026-07-10/verification-log.md)
- 세션 직접 재현: `npm test`(Node 26에서 27건 실패), `node -e "require('@rchemist/listgrid')"` 로드 실패, EntityForm/ViewEntityForm/useEntityFormLogic 정독
