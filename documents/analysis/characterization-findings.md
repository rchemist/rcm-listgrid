# 특성화 발견: 엔진 wart 목록 (이식 판단 체크리스트)

**출처**: P2 특성화 그물(`tests/characterization/**`, 68테스트)이 실행-관찰로 고정한 구엔진의 **비자명 실제 행동**. 각 항목은 P4/P5 이식 시 **의식적으로 유지 vs 수정**을 결정해야 하는 대상이다(무의식적 재현 = 버그째 이식, 무의식적 변경 = 특성화 위반). 상세·재현은 해당 테스트 파일의 `// Surprise:` 주석에 인라인.

> 판단 규율: "유지"가 기본(이식 우선, ADR-0008 §2). "수정"하려면 커밋에 사유 + 특성화 테스트 갱신. 헌장 밖 개선은 §Backlog로.

## 필드 / 검증 (`field-renderer.test.tsx`)

| # | wart | 이식 판단 |
|---|---|---|
| F1 | 필수-blank 메시지에 **리터럴 이중 공백**: `"이름은  필수 값입니다."` (`FormField.validate()` 템플릿) | 수정 유력(오타) — 단, 소비자 스냅샷 의존 확인 |
| F2 | 내장 필수-blank 체크가 커스텀 `validations` 배열보다 **먼저** 단락 → 필드에 붙인 `RequiredValidation`은 실제로 발화 안 함(중복) | 계약 명확화(P3-1 PermissionPolicy/검증 계약에서 정리) |
| F3 | **필수 BooleanField가 undefined를 첫 옵션(false/'No')으로 자동 기본값** → 필수-blank가 영영 발화 못 함(조용히 'No' 선택) | 판단 필요(진짜 3-state 필요 여부) |
| F4 | SelectField가 옵션 ≤10 & 라벨 ≤8자면 **자동 chip/radio** 렌더로 전환. headless `RadioChip`은 옵션 배열을 map 안 하는 단일 radio라 **기본 baseline에서 사실상 비동작**(`.useChip(false)` 필요) | ui-default 이식(P6) 시 RadioChip 정상 구현 |
| F5 | 기본 `ManyToOneView`가 `useSession()`을 무조건 호출 → `<AuthProvider>` 없으면 **동기 crash** | 이식 시 세션 의존 조건부화 검토(하네스는 provider 주입으로 우회 완료) |
| F6 | `PhoneNumberField.getSaveValue()`가 undefined→`''` 강제 → 미터치 phone이 **create에서 `''`로 전송** | 판단 필요(빈 값 생략 vs '' 전송) |
| F7 | headless `BooleanRadio`가 aria-label 미전달 → 접근성 라벨 유실(a11y 3종, ADR-0006 동시처리 목록) | P5 렌더러 이식 시 수정 |

## 폼 로직 (`form-logic.test.tsx`)

| # | wart | 이식 판단 |
|---|---|---|
| L1 | `initialize()`가 `clone(true)` → `{...undefined}` = `{}` 스프레드로 미터치 필드도 빈 FieldValue **객체**가 됨 | 상태 슬라이스 계약(P3-2)에서 명시 |
| L2 | 백엔드 payload에 없는 필드도 `setFetchedValues`가 `{current,fetched,default}` 명시 객체로 세팅("미터치"와 구분) | 유지(의도적 3-slot) |
| L3 | `isDirty()` falsy 비대칭: `''`는 normalize되어 not-dirty, `0`은 dirty | 계약 명시(엣지 고정) |
| L4 | `resetValue()`가 default 없을 때 `current` **키를 삭제**(sentinel 아님) | 유지 or 명시 |
| L5 | SubCollection-only 탭은 **update 모드에서만** viewable(`isViewableFieldGroup` 하드코딩) | 유지(도메인 규칙, 헌장 C6) |

## 리스트 / wire 형식 (`list-logic.test.tsx`)

| # | wart | 이식 판단 |
|---|---|---|
| W1 | 검색 body = **전체 `SearchForm.toJSON()`**(per-instance cacheKey UUID·ignoreCache·viewDetail·preservedFilters…) — bare `{filters,sorts,page}` 아님 | 유지(backend-rcm 계약, 무변경 이사 — P6) |
| W2 | `sorts` = 순서있는 `[{field,direction}]`; `withSort()`는 **prepend**(최근 정렬이 앞) | 유지 |
| W3 | `filters` = `{AND:[...]}`/`{OR:[...]}`; 항목 0인 조건은 **키 자체가 없음** | 유지 |
| W4 | `PageResult`가 `totalElements→totalCount` 흡수 + 모든 row `id`를 `String()` 강제 | 유지 |
| W5 | `PageResult` echo가 `searchRequest:{}`를 truthy로 취급 → 빈 객체 반환 목업이 searchForm을 **리셋**시킴(테스트 함정) | 계약 주의 명시 |

## 렌더 / UI baseline (`view-entity-form.test.tsx`)

| # | wart | 이식 판단 |
|---|---|---|
| V1 | headless `Stepper`에 `.Step` 컴파운드 없음 → `CreateStepView`가 headless baseline에서 **crash**(위저드 DOM 렌더 불가) | ui-default 이식(P6) 시 Stepper.Step 구현 |
| V2 | `PhoneNumberField` aria-label이 input 아닌 wrapper div에 붙음(F7 관련) | P5 수정 |
| V3 | 기본 field-group `<h5>`가 탭 라벨과 같은 `DEFAULT_FIELD_GROUP_INFO.label` 텍스트 재사용 → DOM 텍스트 중복 | 무해(참고) |
