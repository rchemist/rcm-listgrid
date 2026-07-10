# E2E-Parity Vertical Slice — 실제 GJCU EntityForm을 신 엔진에서 동작 증명

**작성**: 2026-07-10 · **Status**: active (구동 트랙) · **운영**: 무인(unattended), 토큰 무제한, 품질 최우선
**근거**: 사용자 지시(2026-07-10) — "계약 컴파일이 아니라, 원 호스트(GJCU)의 복잡한 EntityForm을 신 엔진으로 똑같이 재구현해 간단한 SSR CRUD 백엔드에 붙여 **Playwright E2E로 실제 동작**을 관찰하는 것이 완료." 이것은 헌장 §보존검증 3 + ADR-0008 §6 abort 판정을 **지금 수직 슬라이스로 앞당겨** 증명하는 것.

## 수용 기준 (Definition of Done)

각 마일스톤은 **Playwright E2E green**이 완료 증거다. "빌드 통과"는 완료가 아니다(팀 규율). 최종 목표: 실제 GJCU 폼(College→Major→Professor)이 신 `@listgrid/*` 엔진에서 리스트·폼·관계·검증·저장왕복이 **원본과 동등하게** 브라우저에서 동작.

## 아키텍처 결정 (ADR 근거 + 이번 확정)

리프 로직(필드 dirty 정규화·검증 정규식·값 포맷·백엔드 와이어)은 **이식**(규율 2, src/listgrid 0.3.x P0-fixed 원본). 아키텍처(스토어·레지스트리·프로바이더·뷰 컴포넌트)는 **ADR-0002/0003/0004대로 신축**(헌장 비개념 = 구현 재량). 패키지 책임:

| 패키지 | 책임 | React |
|---|---|---|
| `@listgrid/schema-core` | EntityForm/EntityField + 구체 필드클래스 · SearchForm · validations · PermissionPolicy · FieldValueSlice · FieldEvalContext | ✗ (P3-1 완료: 계약) |
| `@listgrid/state` | `createFormStore`/`createListStore` (zustand vanilla) — 값 슬라이스·셀렉터·액션 (ADR-0002) | ✗ |
| `@listgrid/react` | FieldRenderer 레지스트리 + 렌더러들 · ViewEntityForm/ViewListGrid · Provider(UI/Auth/Router/Message/Modal) · store 구독 훅 (ADR-0003) | ✓ |
| `@listgrid/ui-default` | 기본 UI 프리미티브(TextInput/Checkbox/Button/Modal/Table/Pagination/Select…) — 0.3.x `ui/headless.tsx` 이식·정리 (ADR-0004 §4) | ✓ |
| `@listgrid/backend-rcm` | `BackendAdapter` + rcm 기본 어댑터(buildEntityUrl/buildSearchBody/parse*/headers, 에러코드) (ADR-0005) | ✗ |
| `@listgrid/next` | RouterProvider ↔ next/navigation 어댑터 | ✓ |
| `apps/sample` | Next15 앱 + 모의 RCM 백엔드(College/Professor/University CRUD) + 신 엔진 배선 페이지 | — |

**확정 설계 결정 (이번):**
- **D1 관계 지연참조**: ManyToOne/SubCollection의 대상 EntityForm은 **thunk `() => EntityForm`**(또는 name 레지스트리)로 지연 참조 — College↔Professor↔Major 상호재귀 순환 생성 방지(정찰 발견). 원본의 `child?` 단락 패턴을 대체.
- **D2 와이어 계약**: SSR 백엔드는 RCM 0.1.0 Spring-Page envelope(`{content,totalElements,totalPages}`)를 반환. `POST /{url}/search`(리스트+ManyToOne 공용), `GET/POST/PUT /{url}/{id}`, **bulk `DELETE /{url}` body `{ids}`**. 에러는 ADR-0005 코드(`TOKEN_EXPIRED|FORBIDDEN|VALIDATION|UNKNOWN`)로.
- **D3 UI 주입**: 5개 seam(UIComponents 레지스트리·Modal·Router·Auth·Message)을 프로바이더로 노출, 미주입 시 첫 사용에서 명확히 throw(원본 패턴 유지, 헌장 C7). ui-default가 기본 구현 제공.
- **D4 값 슬라이스 구독**: FieldRenderer는 `useFormStore(s => s.fields[name])`로 자기 필드만 구독(ADR-0002 §2), onChange는 `store.setValue`로 슬라이스만 갱신(clone(true) 경로 소멸).
- **D5 이식 오라클**: 이식한 필드 리프 로직은 P2 특성화(tests/characterization) 또는 신규 단위테스트로 신 엔진에서 green 확인 후 완료(규율 3).

## 마일스톤 (각 = E2E green 게이트)

### V0 — Walking skeleton: College가 브라우저에서 동작
가장 얇게, 전 계층 관통. College = NameField(String)·englishName(String, required)·dean(ManyToOne→Professor)·active(Boolean) + 필드그룹.
- **V0.1 schema-core 코어**: EntityForm/SearchForm 클래스 + 필드클래스 StringField/BooleanField/ManyToOneField(+ NameField 등 최소 preset). 게이트: 단위테스트(선언→메타·검증·isDirty).
- **V0.2 state 스토어**: `createFormStore`(값슬라이스·setValue·validate·isDirty·reset·hydrate) + `createListStore`(search/page/fetch). 게이트: 스토어 단위테스트(구독·검증·dirty).
- **V0.3 ui-default + react 폼**: 프리미티브(TextInput/Checkbox/Button/Modal/Table/Pagination) + FieldRenderer 레지스트리 + ViewEntityForm(단일 탭/그룹) + 프로바이더. 게이트: jsdom 렌더 테스트(College-lite 폼 입력·검증·dirty).
- **V0.4 backend + list + ManyToOne + E2E**: backend-rcm 어댑터 + apps/sample College/Professor/University 스토어·CRUD 라우트 + ViewListGrid + /college 리스트·폼 페이지 + ManyToOne 팝업(ViewListGrid 피커 + ViewEntityForm 생성). **게이트(V0 완료): Playwright E2E** — /college 리스트 seed 표시 → 생성 → 빈 required 검증 → dean ManyToOne 팝업 선택 → 저장(POST) → 리스트 반영 → 수정(PUT) → 반영.

### V1 — 필드·검증 심화: Major
Number/Select/Date/Textarea/Markdown 필드 + validations 카탈로그(Required/MinMax/Email/Regex/Phone…) 이식 + 조건부 가시성(Major의 3-way cross-field cascade, FieldEvalContext). 게이트: Major E2E — 검증 실패/통과·조건부 필드 표시·저장.

### V2 — SubCollection: Professor
SubCollectionField + SubCollectionRenderer(inline/table) + 자식 폼 상태 격리(자식 store 생성, 부모 캐시 전달 — ADR-0002 §4) + mappedBy 자동필터. 게이트: Professor E2E — 서브컬렉션 행 추가/수정/삭제·부모 저장.

## E2E 하네스
- `playwright.config.ts`(루트) → apps/sample dev 서버(webServer 자동기동) 타깃. `e2e/` 디렉터리에 시나리오. Chromium.
- 각 마일스톤 시나리오는 **원본 GJCU 동작을 기준**으로 assert(필드 순서·required·관계 팝업·저장 payload·리스트 반영).

## 실행 규율 (무인)
- 마일스톤별: 브리핑→delegate(sonnet 실행)→검증(main, opus)→E2E→커밋. 통합·게이트·디버깅은 main 세션.
- 비크리티컬 결정은 PROGRESS §Open Questions에 누적, 나중 일괄 질의. 크리티컬 패스 결정·새 세션 필요 시만 중단.
- 이식 원본은 항상 `src/listgrid`(0.3.x). 리프 로직 재작성 시 커밋에 사유(규율 2).
