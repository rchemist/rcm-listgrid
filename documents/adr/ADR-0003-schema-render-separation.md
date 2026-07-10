# ADR-0003 — 계층 분리: EntityField 메타 계약과 렌더러 레지스트리

**Status**: accepted · **Date**: 2026-07-10 · **선행**: ADR-0007 테스트 그물 · ADR-0002와 상호 참조 (착수는 본 ADR이 먼저 — 위험이 더 낮음)
**근거**: raw/critique-architecture §1·§3·§5, raw/map-core-model · 검증: high 확정
**PRD 조건 C3의 나머지 절반.**

## Context

"UI/로직 스파게티" 불만의 실제 좌표는 EntityForm 본문이 아니라(JSX 0건) **계약과 소수 지점**이다:

1. `config/EntityField.ts:60` — 인터페이스가 `view(params): Promise<ReactNode | null>`를 **필수 멤버**로 선언. 필드 메타 정의가 곧 렌더 계약이 되고, 40개 필드 구현체 전부가 이 계약에 묶임.
2. `config/SubCollectionField.tsx:308` — config 클래스가 `<ViewListGrid/>` JSX를 직접 리턴 (Card/Table/Inline 3변형 동일).
3. `config/EntityForm.tsx:613-615` — 클래스 async 메서드 안 `useSession()` 훅 호출(rules-of-hooks eslint-disable로 자백). sessionRequired=true 폼에서 조용한 기능 파손(전 호출부 try/catch로 삼켜짐 — 검증 로그 참조).
4. 결과: **madge 실측 순환 의존 213건**(Config ↔ EntityForm ↔ components/fields 삼각) — tree-shaking·부분 재사용 불가 = "원 호스트 아키텍처에 종속된다"는 불만의 기술적 근거.

## Decision — 목표 4계층과 3개 규칙

```
adapters        RuntimeConfig, UI/Router/UrlState/Auth Provider, Next 어댑터
renderer        FieldRenderer 레지스트리(type→컴포넌트), ViewEntityForm/ViewListGrid, 필드 view() 본문
headless-state  createFormStore()/셀렉터 (ADR-0002), 값/메타 분리
schema-core     EntityField(순수 메타)·EntityForm 선언·SearchForm·validations·권한 정책 — React import 0
```

1. **EntityField 계약 분해**: `view()`/`filter()` 등 렌더 멤버를 인터페이스에서 제거하고 순수 메타(name/type/order/validations/isPermitted/isRequired/conditional…)만 남긴다.
2. **렌더러 레지스트리**: `registerFieldRenderer(type, component)` — 코어가 40종 기본 렌더러를 등록하고, 호스트는 타입별 교체/신규 등록 가능. 각 필드의 기존 `view()` 본문은 **로직 그대로** 대응 렌더러 컴포넌트로 이사한다 (행동 변경 없는 기계적 이관).
3. **SubCollectionField JSX 추방**: 3변형의 render()가 반환하던 JSX를 renderer 계층의 SubCollectionRenderer로 이동. 이때 buildSearchForm 3벌 복붙(~105줄)을 부모 기본 구현 + pageSize 파라미터로 통합(코드품질 발견 동시 해소).
4. **config에서 React 훅 추방**: 세션은 **인자 주입**으로 관통 — `initialize({session})`은 이미 session을 받으므로 `fetchData(session?)`/`internalSave(session?)`로 전달 경로를 완성하고 `useSession()` 호출·도달 불가 폴백(617-622)을 제거.
5. **schema-core의 React 0 규칙을 lint로 강제**: `config/**`·`form/**`(SearchForm)·`validations/**`에 `no-restricted-imports: react` ESLint 규칙 추가. 단, 라벨/헬프텍스트의 `ReactNode` 허용 여부는 **타입 전용 import까지만** 허용(`import type`) — 값 수준 React 사용 금지.

## 기각한 대안

- **EntityForm에서 "UI 뜯어내기"** — 뜯어낼 UI가 없음(JSX 0건). 헛다리 경로로 명시 기각.
- **전역 싱글턴 14종의 React Context화** — config 클래스가 렌더 트리 밖에 살아 Context를 읽을 수 없음. 현행 싱글턴은 SPA 부트스트랩 1회 설정으로 실질 안전. **SSR 멀티테넌트를 판매 포인트로 확정할 때만** AsyncLocalStorage 요청 스코프 컨테이너를 별도 ADR로 추가한다 (연기).

## Consequences

- 40개 필드의 view() 이관은 **breaking이지만 기계적**(behavioral 아님) — 0.5.x 창구. 호스트가 FormField를 상속해 view()를 오버라이드하던 확장 패턴(docs/EXTENSIONS.md의 MarkdownField 사례)은 렌더러 레지스트리 등록으로 대체되므로 MIGRATION 문서에 1:1 대응표 필수.
- 순환 213건의 대부분이 이 분리로 해소된다. **madge를 CI 게이트로 추가**해 재유입을 막는다 (ADR-0007).
- `field.type === '...'` 문자열 스위치 14개 파일 분산(DatetimeField 버그의 근본 원인)은 이 ADR의 범위가 아니다 — 레지스트리 도입으로 렌더 분기는 해소되지만, transfer/rule 계층의 타입 스위치는 **차기 major에서 다형 메서드**(getExcelExportValue() 등)로 전환한다 (로드맵 P8 후보).

## 구현 계획

1. `FieldRendererRegistry`(renderer 계층) 신설 + 타입→컴포넌트 맵 + 미등록 타입 폴백(개발 경고 + 문자열 렌더).
2. 필드 1종(StringField)으로 파일럿: view() 본문 이관 → 렌더 특성화 테스트 통과 확인 → 나머지 39종을 동일 레시피로 **haiku/sonnet 반복 이관** (분석 원문: "위험(behavioral)이 아니라 넓은(mechanical) 변경").
3. SubCollection 3변형 render() 이관 + buildSearchForm 부모 통합.
4. useSession 인자화(위험 구간 — opus 감리): initialize/fetchData/save/ManyToOneView·ManyToOneField 호출부 5곳 관통.
5. ESLint 경계 규칙 + madge CI 게이트.

규모: 4~6pw (의견). ADR-0002보다 먼저 착수 — store 재설계가 깨끗한 메타 계약 위에서 진행되도록.

## 수용 기준

- [ ] `src/listgrid/config/**` + `validations/**`에서 값 수준 React import 0 (lint green)
- [ ] `EntityField` 인터페이스에 ReactNode 반환 멤버 없음
- [ ] madge circular: 213 → **20 이하** (CI 게이트 수치)
- [ ] 40종 필드 렌더 결과가 특성화 테스트 기준 동등
- [ ] `useSession()` 호출이 React 컴포넌트/훅 파일에만 존재 (`grep -rn "useSession()" src/listgrid/config` → 0)
- [ ] 호스트 확장 사례(EXTENSIONS.md 케이스 스터디 2건)가 새 레지스트리로 재현 가능 — 문서 갱신 포함
