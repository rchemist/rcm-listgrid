# TB-0 — 리컨 소화 + 계약 스펙 확정 (2026-07-13)

> Phase TB 착수 게이트. [recon](./test-backend-recon.md) 인용 스팟체크 + OQ-TB0 해소 + OQ-TB1~3 기본값 확정. 이 문서 확정 후 TB-1 착수 가능. 방법=메인 세션 직접 소스 대조(엔진-라우팅 규범: 인용 강제).

## 1. 인용 스팟체크 (recon §2/§4 backbone 재확인) — PASS

| 리컨 주장 | 대조 소스 | 결과 |
|---|---|---|
| QueryConditionType 24종 ≡ framework | `packages/schema-core/src/search/search-form.ts:41-75` (EQUAL…EXISTS, 24 union members) | ✅ 일치 |
| FilterItem = name/value/values/queryConditionType/not/subFilters/joinType | `search-form.ts:89-99` | ✅ 일치 |
| filters/subFilters = operator-keyed map `{AND?,OR?,NOT?}` | `search-form.ts:83-87` (FilterGroups) | ✅ 일치 |
| mock 5/24 구현 (EQUAL/NOT_EQUAL/IN/NOT_IN/LIKE), 19종 `default:true` no-op | `apps/sample/lib/mock-backend/store.ts` matchesFilter (switch 5 cases + default true) | ✅ 일치 |
| 빈 OR 관용(vacuous) · NOT/subFilters 미평가 | `store.ts` matchesFilterGroup: `AND.every` + `OR.length===0 \|\| OR.some` — **NOT 키·subFilters 미처리** | ✅ 일치(TB-1 갭) |
| BackendAdapter 5메서드 + bulk `remove(url,ids,revision?)` | `packages/schema-core/src/backend/adapter.ts:25-48` | ✅ 일치 |
| adapter.remove = bulk만(per-row 없음), form-controller가 호출 | `packages/state/src/form-controller.ts:321` `adapter.remove(url, ids, getRevisionEntityName())` | ✅ 일치 |

**Nit(무영향)**: recon이 `QueryConditionType.java:38-87` 인용, 코드 주석은 `:38-81` — Java 라인범위 표기 차이일 뿐 24 values 자체는 일치. 계약 무영향.

## 2. OQ-TB0 해소

### OQ-TB0(a) — ViewListGrid 고급검색이 EQUAL 외 조건타입을 방출하는가? → **NO (런타임 operator 선택 UI 없음)**

- **소스**: `packages/react/src/components/ViewListGrid.tsx`
  - `applyAdvancedSearch()` (278-291): 필터 필드별 **value만** 수집 → `queryConditionType`은 `config.operator`가 **있을 때만** 부착, 없으면 **완전 생략**(→ 서버 default EQUAL). operator는 런타임 사용자 입력이 아님.
  - 패널 렌더(309-345): 필드별 **값 입력**(`FilterInput` by type 또는 `TextInput`)만. **operator `<select>` 없음** — 사용자가 조건타입을 고를 UI가 존재하지 않음.
  - `config.operator` 출처 = `FieldFilterConfig.operator` (`packages/schema-core/src/field/list-config.ts:33`, 의도적 open `string`) — 소비자가 `field.withFilter({operator})`로 **선언 시점에 고정**.
- **결론**: 라이브러리 내장 UI가 방출하는 조건타입 = 각 필드에 소비자가 선언한 operator(미선언→EQUAL). 엔드유저가 임의 조건타입을 생성하는 경로 없음. edustack이 EQUAL만 쓰는 것(#GX-2)과 정합.
- **Phase TB 함의**: 24종 시맨틱 전수 구현의 정당성은 **실트래픽이 아니라 테스트 완전성 지시("모든 API")** 다. operator는 open string이라 소비자가 24종 어느 것이든 선언 가능 → 테스트 백엔드는 24종을 계약으로 지원해야 함.

### OQ-TB0(b) — edustack 실 M2O `{id,title}` 네트워크 캡처 → **불필요(미수행)**

- R7은 이미 in-code 강근거로 확정: `edustack .../lms-syllabus.ts:31-37`(labelField='title') + backend `LmsCourseRefResolver` 투영 + D-033 계약(recon §3). 실결함(RV-R7 가드가 raw id export)까지 발견·수정 완료(**RV-R13**, `ccc6520`).
- 라이브 edustack Playwright 캡처는 (i) 별도 리포·dev 환경 미가용 (ii) 이미 확정·수정된 사실의 중복 검증 → **redundant, 미수행**. 테스트 백엔드 M2O 기본 = 중첩 `{id,title}`(TB-5가 회귀 테스트로 고정).

## 3. OQ-TB1~3 확정 (recon §7 기본값 채택 — model-decidable, 스펙-grounded)

- **OQ-TB1** (조건타입 시맨틱 범위) → **기본값 채택**: store-표현가능 타입은 의미 구현(EQUAL/NOT_EQUAL/IN/NOT_IN/LIKE/NOT_LIKE/GT/GTE/LT/LTE/BETWEEN/IS_NULL/IS_NOT_NULL/IS_BLANK/IS_NOT_BLANK/NULL_OR_EQUAL/NULL_OR_BLANK/IN_RANGE/NOT_IN_RANGE/DATE_BEFORE/DATE_AFTER/DATE_BETWEEN). `JSON_CONTAINS`/`EXISTS` = **문서화 no-op**(store가 평면 row라 JSON 경로·관계 존재성 없음). TB-1이 계약 테스트로 오늘 동작 고정.
- **OQ-TB2** → (a) NOT 그룹 + nested subFilters = **구현**(완전성). (b) 멀티행 bulk-select-delete UI **실재 확인**: `ViewListGrid` selection(체크박스 컬럼+`checkedIds`+confirm 버튼 441)·`adapter.remove`=bulk-only → employee/org/staff/collabo가 per-id route만 가진 것은 표준 컨트롤러 delete도 실패하는 **실결함**. TB-4 in-scope.
- **OQ-TB3** → **TB-8 stretch**(코어 RCM 경로 완료 후). `backend/rest`(ADR-0005 수용#3)는 현 빈 스캐폴드.

## 4. §2 계약 확정

recon §2 wire 계약(framework 0.1.0)을 **테스트 백엔드의 권위 스펙으로 확정**. 개정 없음. TB-1~9는 §2를 재현하며, §6 Do-NOT(GJCU 0.2 조건타입名·낙관락·excel/upload 엔드포인트·framework 없는 시맨틱 발명 금지)를 준수한다.

**게이트 통과** → TB-1(mock 필터 엔진) 착수 가능.
