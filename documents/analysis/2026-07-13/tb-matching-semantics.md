# Phase TB — 행 매칭/정렬 시맨틱 계약 (framework 0.1.0, citable)

> recon §2는 **wire shape**를 명세했다. 이 문서는 그 wire를 **행에 어떻게 적용하는지**(row-matching + sort)를 framework 0.1.0 JPA starter 소스에서 추출한 규범이다. TB-1(필터)·TB-2(정렬/quickSearch) 브리프의 근거. 전 주장 `file:line` 인용. 소스 루트=`~/dev/rcm-backend-framework`.
>
> **중요 정정**: `apps/sample/lib/mock-backend/crud-routes.ts:27-38` 주석은 "framework가 NOT-group row-matching 시맨틱을 문서화하지 않아 구현=발명"이라 단정했으나 **오류**다. `SearchRequestPlanner.combineGroup:184`가 `NOT -> cb.not(cb.and(arr))`로 **명확히 정의**한다. NOT-group 구현은 발명이 아니라 **인용 가능한 계약의 충실 재현**. TB-1이 이 주석을 갱신한다.

## 1. 그룹 결합 시맨틱 — `SearchRequestPlanner`

출처: `starters/rcm-starter-jpa/src/main/java/io/rchemist/starter/jpa/search/SearchRequestPlanner.java`

- **`combineGroup(op, inner)` (:176-186)** — 한 LogicalOperator 그룹의 멤버 predicate들을 결합:
  - `inner.isEmpty()` → `cb.conjunction()` = **TRUE(vacuous)**. ⇒ 빈 AND/OR/**NOT** 그룹 모두 매칭(참). (#GX-1 빈 AND/OR 관용의 근거.)
  - `AND -> cb.and(arr)` (전원 매칭) · `OR -> cb.or(arr)` (하나라도) · `NOT -> cb.not(cb.and(arr))` (**멤버 AND의 부정** = `!(모두 매칭)`).
- **`buildFilters(req) (:135-154)`** — `req.filters()` 맵의 각 `(op, items)` 엔트리를 combineGroup으로 그룹화 → **그룹들끼리는 무조건 `cb.and(...)` 결합**(:154, `groups.size()==1 ? groups.get(0) : cb.and`). ⇒ `filters:{AND:[a,b], OR:[c,d]}` = `(a∧b) ∧ (c∨d)`. top-level `operator`는 여기 **미적용**(filters↔quickSearch↔unmappedJoins 3범주 결합에만 — `combine():218`).
- **`buildSubFilter(parent) (:157-173)`** — `parent.subFilters()` 맵을 동일 로직으로 **재귀** 처리, subGroup들끼리 `cb.and`. 각 item: `item.hasSubFilters()` → buildSubFilter 재귀(자기 조건 무시), else → FilterDispatcher(leaf 조건). **either/or**(subFilter item의 name/value/conditionType은 미평가).
- **item-level `not`** (`FilterDispatcher.build:70`): `Boolean.TRUE.equals(item.not()) ? cb.not(base) : base` — 단일 조건 predicate 부정. top-level NOT 그룹과 **별개**(FilterItem.java:39).

**mock 매핑**: `matchesFilterGroup(row, filters)` = `andOk ∧ orOk ∧ notOk`, 각 그룹 = 존재하는 키만(빈/부재 그룹 = TRUE). `notOk = notItems.length===0 ? true : !notItems.every(match)`. 각 item에 `subFilters` 있으면 재귀 그룹평가, else 24-type 조건. item.not는 결과 부정.

## 2. 24 QueryConditionType → 행 술어 — `FilterDispatcher.buildBase`

출처: `.../jpa/search/FilterDispatcher.java:99-186`. 빈-값 엣지케이스의 `disjunction()`=**FALSE**, `conjunction()`=**TRUE**.

| # | Type | 시맨틱(:line) | 빈값 엣지 |
|---|---|---|---|
| 1 | EQUAL | `expr == value` (:103) | — |
| 2 | NOT_EQUAL | `expr != value` (:104) | — |
| 3 | IN | `expr ∈ values` (:105-114) | values 빈 → **FALSE** |
| 4 | NOT_IN | `expr ∉ values` (:115-124) | values 빈 → **TRUE** |
| 5 | LIKE | `lower(expr) LIKE %v%` substring·ci (:125-129) | value null → `%`(전부 매칭) |
| 6 | NOT_LIKE | `NOT (lower(expr) LIKE %v%)` (:130-134) | — |
| 7 | GREATER_THAN | `expr > value` (:135) | 비Comparable → FALSE |
| 8 | GREATER_THAN_EQUAL | `expr >= value` (:136) | 〃 |
| 9 | LESS_THAN | `expr < value` (:137) | 〃 |
| 10 | LESS_THAN_EQUAL | `expr <= value` (:138) | 〃 |
| 11 | BETWEEN | `from <= expr <= to` (:139-144, `values[0],values[1]`) | values<2 → **FALSE** |
| 12 | IS_NULL | `expr is null` (:151) | — |
| 13 | IS_NOT_NULL | `expr is not null` (:152) | — |
| 14 | IS_BLANK | `expr is null OR expr==""` (:153-156) | — |
| 15 | IS_NOT_BLANK | `expr is not null AND expr!=""` (:157-160) | — |
| 16 | NULL_OR_EQUAL | `expr is null OR expr==value` (:161-162) | — |
| 17 | NULL_OR_BLANK | `expr is null OR expr==""` (:163-166, =IS_BLANK) | — |
| 18 | IN_RANGE | =BETWEEN (case fallthrough :139) | values<2 → **FALSE** |
| 19 | NOT_IN_RANGE | `!(from<=expr<=to)` (:145-150) | values<2 → **TRUE** |
| 20 | DATE_BEFORE | `expr < value` (:167, compare less) | 비Comparable → FALSE |
| 21 | DATE_AFTER | `expr > value` (:168, compare greater) | 〃 |
| 22 | DATE_BETWEEN | `from <= expr <= to` (:169-174) | values<2 → **FALSE** |
| 23 | JSON_CONTAINS | `jsonContains(...)` JSON 경로 포함 (:175) | **store no-op**(§3) |
| 24 | EXISTS | `existsSubQuery(...)` 관계 존재 서브쿼리 (:176) | **store no-op**(§3) |

**값 비교 규칙**: framework는 `ValueCoercer.coerce(value, fieldType)`로 String→타입 변환 후 비교. mock(JS)은 row 값이 이미 JS 타입 → 비교 시 **숫자 필드는 수치 비교·문자열은 사전식·날짜(ISO 문자열)는 시간순**으로 coerce. GT/LT/BETWEEN에서 mock의 현 `String(a)===String(b)`(EQUAL만) 식 문자열 비교는 부적합 → 타입 인지 비교 필요.

## 3. JSON_CONTAINS / EXISTS = 문서화 no-op (OQ-TB1 처분 근거)

framework는 JPA(JSON 컬럼·관계 서브쿼리)에서 실구현하나, apps/sample mock store는 **평면 in-memory row**(JSON 경로·엔티티 관계 없음). 따라서 두 타입은 mock에서 **의미 있는 술어를 만들 수 없음** → `default: true` 유지가 아니라 **명시적 no-op(항상 TRUE)로 문서화**하고 계약 테스트로 "오늘 동작"을 고정한다(향후 관계형 fixture 도입 시 재검토). 이는 **발명이 아니라 데이터모델 한계의 명시**(recon §6.8 준수).

## 4. quickSearch — `SearchRequestPlanner.buildQuickSearch:188-203` (TB-2)

`searchTerm` 비었거나 `quickSearchFields` 비면 no-op. else: 각 필드에 `cb.like(cb.lower(field), "%"+term.toLowerCase()+"%")` → 전 필드를 **OR** 결합. ⇒ mock: quickSearchFields 중 하나라도 term substring(ci) 포함 시 매칭. filters와는 top-level `operator`(default AND)로 결합(`combine():218`).

## 5. 정렬 — `SortBuilder.java` (TB-2)

`req.sorts()`를 **리스트 순서대로** JPA Order로(:55) — 다중키 = 선언 순 우선순위. `NormalSortInfo`(:57,65) = path+direction(ASC/DESC)+nullsFirst. `PrioritySortInfo`(:58,73) = CASE 기반. `nullsFirst`: null → **default NULLS LAST**(DBMS 무관 일관성 :90). type은 client 명시(자동추론 없음 — recon §2 SortInfo). ⇒ mock: sorts 배열 순회, 각 필드 direction 적용, 다중키 stable, null은 마지막(기본).

## 6. TB-1 수용 요약

mock `matchesFilterGroup`/`matchesFilter`가 §1(그룹 AND/OR/**NOT**+nested subFilters 재귀+빈 그룹 TRUE)·§2(24 타입, 빈값 엣지 포함)·§3(JSON_CONTAINS/EXISTS 문서화 no-op)을 재현. leaf 값 비교는 타입 인지(§2 값 비교 규칙). **Do-NOT**: framework 없는 시맨틱 발명 금지·search-form.ts wire frozen(recon §6.7)·GJCU 0.2 타입名 금지.
