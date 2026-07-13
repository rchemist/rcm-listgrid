# GA 게이트 실행 결과 — 개념 헌장 C1~C9 대조 (CAP-28)

**실행**: 2026-07-13 · **브랜치/HEAD**: `v0.4` @ `9a7770c` · **성격**: 순수 검증(zero-design·zero-code-change) pass
**브리프**: [ga-gate-charter-brief.md](../../plans/ga-gate-charter-brief.md) · **헌장**: [concept-charter.md](../../prd/concept-charter.md) · **전제**: R1·R2·G-1·G-2 착지 완료(✅)
**환경**: Node v26.4.0(P0-8 폴리필로 jsdom localStorage 해소 — 27 회귀 0)

이 문서는 브리프 §5 커버리지 매트릭스를 **실 커맨드 출력 + §2 증거물 매칭**으로 채운 결과다. GA 세션은 어떤 설계 판단·새 테스트·코드 수정도 하지 않았다(브리프 §4 Do-NOT 준수).

---

## 1. 기계적 게이트 결과 (§3.1~3.3)

| 게이트 | 커맨드 | 결과 | exit |
|---|---|---|---|
| type-check | `npm run type-check` | tsc --noEmit clean | 0 |
| typecheck:packages | `npm run typecheck:packages` | clean | 0 |
| **test (특성화 P2 포함 = 요건1)** | `npm run test` | **2399 passed \| 1 todo · 186 files** (R7 수정 +5) | 0 |
| lint | `npm run lint` | **0 errors** · 262 warnings(허용) | 0 |
| build | `npm run build` | tsup + build:styles OK | 0 |
| format:check | `npm run format:check` | "All matched files use Prettier code style!" | 0 |
| **E2E (요건 2·3 시연축)** | `npm run test:e2e` | **32 passed** (42.7s · 1 worker) | 0 |
| check:surface | `npm run check:surface` | **EntityForm 49/55 · root 61/120 · /schema 188/190 — 전건 PASS** | 0 |
| check:exports | `npm run check:exports` | attw "No problems found" 🟢 | 0 |
| check:publint | `npm run check:publint` | "All good!" | 0 |
| smoke:load | `npm run smoke:load` | `.`/`./schema`/`./state`/`./utils`/`./excel` cjs+esm 전건 ✓ | 0 |
| **check:headless (C7 판정)** | `npm run check:headless` | "/schema + /state consumable with zero React peers" | 0 |
| codemod:test | `npm run codemod:test` | 4/4 fixture passed | 0 |

**§3 게이트 전건 green.** (계수 무드리프트: R2가 surface-neutral·G-1이 61/120 확정 — [Progress notes RV-R2](../../PROGRESS.md).)

---

## 2. per-C 커버리지 매트릭스 (증거물 매칭 결과)

verdict ∈ {present, partial, missing, descoped-ok} — 판단이 아니라 매칭 결과. 증거물 anchor는 `9a7770c`에서 심볼 실재 확인(브리프 base `56a887e` 대비 라인 드리프트만 존재 — 심볼 매칭 유효).

| C-id | verdict | evidence |
|---|---|---|
| **C1** | ✅ present | `e2e/college.spec.ts:9`(College CRUD round-trips) green · 단일 `apps/sample/lib/entities/college.ts` 선언이 list(`college/page.tsx`)+form(`college/[id]/page.tsx`) 양방 구동(별도 컬럼정의 부재) · 엔진 `entity-form.ts:452`(class EntityForm)·`form-field.ts:265`(withList)·`ViewListGrid.tsx`(component) 실재 |
| **C2** | ✅ present | `e2e/collabo.spec.ts:12,:121` + `e2e/tab-permission.spec.ts:11` green · 엔진 `conditional.ts:33`(ConditionalBooleanValue)·`view-preset.ts:17-38`(ALWAYS/HIDDEN/ADD_ONLY/MODIFY_ONLY/VIEW_ONLY)·`form-field.ts:223`(withRequiredPermissions) 실재. 조건부 정책이 if-분기 없이 선언에서 화면 상태 구동 |
| **C3** | ✅ present | `e2e/professor.spec.ts:8`(degrees SubCollection 격리 자식폼)·`college.spec.ts:55`(dean M2O 피커)·`collabo.spec.ts:73`(M2O 중첩 autofill) green · 특성화 `view-entity-form.test.tsx`(SubCollection mappedBy AND-filter) green · 엔진 many-to-one-field/sub-collection-field + 렌더러 실재. 외부참조 id-텍스트박스 퇴화 없음 |
| **C4** | ✅ present | **vitest 2394 green(P2 특성화 무회귀=요건1 동일 관문)** · `form-logic.test.tsx`(빈값 정규화·0/null 미시결정)·`field-renderer.test.tsx`(String/Number/Select/Date/Boolean/M2O)·`student-address.spec.ts`(한국 주소 왕복) green · 엔진 29 필드클래스+30 렌더러+registerFieldRenderer. *count(40+)는 비판정 — 현행 이식분이 arbiter(헌장 §L5)* |
| **C5** | ✅ present | `e2e/async-validation.spec.ts`(5 테스트: tri-state 중복확인+Save 게이팅+stale 무효화) green · `collabo.spec.ts:43`(상호배제 값 클리어) green · 엔진 onchanges(change-required/hidden/select-options) + store.messages 단일채널. 검증/연쇄가 선언에서 실행·오류 필드 귀속 |
| **C6** | ✅ present (+ descoped-ok) | `e2e/steps-demo.spec.ts:10`(위저드 3스텝) + `college-excel.spec.ts:37,56`(엑셀 export/import 왕복) green · 엔진 `entity-form.ts` withSteps/withRevision seam 실재 · **descope 명시(회귀 아님)**: 자동저장·리비전 히스토리 뷰 = CAP-29(0.4 GA 밖) → 'descoped-ok' |
| **C7** | ✅ present | `npm run check:headless` exit 0(schema-core+state React import 0) · `check:exports` 🟢 · 4 주입 provider(`ui.tsx`/`router.tsx`/`adapter.tsx`/`auth.tsx`) + field-renderer-registry(프리미티브 교체) 실재. 레이어 순수성 유지 |
| **C8** | ✅ present | `e2e/backend-contract.spec.ts:12`(404 RFC7807 ProblemDetail)·`:34`(9필드 SearchResponse) green · 엔진 `backend/adapter.ts:25`(interface BackendAdapter)·`backend-rcm/src/adapter.ts`(createRcmAdapter) 실재. 관례가 어댑터 뒤 격리 |
| **C9** | ✅ present | `list-logic.test.tsx`(퀵서치/필터/페이지네이션/다중정렬/행선택+일괄삭제 wire) green · `college.spec.ts:87`(고급검색)·`college-delete.spec.ts:12`(행삭제) green · 엔진 `list-store.ts:26-38`(setPage/setSort/quickSearch/setSearchForm)·ViewListGrid seam · **URL동기화=arbiter**: `search-form.ts:274`(toJSON)+`list-store.ts:44`(initialSearch) seam + 호스트 라우터 주입(C7) → "present(seam+host-injection)". 9 하위세트 중 소비자 몫 0 |

**빈 행 0** — 9행 전부 실 증거물로 매칭(헌장 §71 충족).

---

## 3. 요건 3 — GJCU급 실 엔티티 재현 + R7 GJCU-shape (§3.4) → ✅ 검증 완료 + 수정

- **재현(folded-in)**: apps/sample GJCU급 엔티티(college/professor/collabo)가 리스트+폼+관계+엑셀을 실제 구동 → §1 E2E green이 곧 요건3 충족. ✅
- **R7 GJCU-shape 검증(2026-07-13, 실 백엔드 대조 — 9-agent 팬아웃+opus 적대검증)**: 사용자 지시대로 **edustack(0.3.x base, 권위 소비자)** + gjcu-academic-backend(0.2.x 참조) + rcm-framework 실 코드 대조. 결과 = **실 list-row 형태별 판정**:
  - **manyToOne → nested-object**. edustack 8개 컬럼 전부 `{id, title}`(`CourseRefView(Long id, String title)`, labelField=`title`)·gjcu/apps-sample은 `{id, name}`(labelField=`name`). **R7 가드(RV-R7)가 `name→label→id` 하드코딩이라 edustack의 `title`을 놓쳐 raw id(PK)를 export하는 실결함 발견**(`[object Object]` 아님·silent wrong-value). apps/sample mock이 `name`을 써서 전 통과 테스트가 이 결함을 **가림**.
  - **xref → nested `{mapped,deleted}`**(name/label/id 없음). 단 실 소비자는 raw xref를 리스트 컬럼으로 바인딩 안 함(flat `*Name` 형제 필드 사용)·`XrefPriceMappingField`는 CAP-29 descope·edustack은 xref 전무 → **실 리스크 낮음**(문서화된 한계).
  - **address → flat**. 가상 composite(flat 형제 스칼라)·객체로 export 도달 불가 → R7 무관.
- **수정(RV-R13, `<commit>` 이 pass에서)**: `/excel` 익스포트가 필드의 `labelField`를 스레드하도록 수정(`bridgeExportValue`→`getFieldManyToOneLabelField`→`exportValue`→`exportTier2Value`가 labelField 우선 프로브·기존 name/label/id는 폴백). 공개표면 무변경(49/55·61/120·188/190)·**판별테스트**(pre-fix가 `482`를 export→FAIL 확인)·엔드투엔드 커버리지 갭 폐쇄(M2O label='title' export→title). test 2394→**2399**·E2E32.

---

## 4. GA 판정 — ✅ 코드축 GA-READY (봉인 잔여 = publish 판단 1건)

**요건 1·2·3 전건 충족** — 9 C행 전부 `present`(C6 일부 descoped-ok), 빈 행 0. **P2 특성화 동일 통과·§3 게이트 전건 green.** **R7 GJCU-shape = 검증 완료 → 실결함 발견 → 수정(RV-R13)** — 브리프 §5의 'unverified' 잔여 해소.

**코드/구현 축 GA-READY** — 헌장 대조 present·전 게이트 green(2399u·E2E32·surface 무변경)·R7 실결함 수정 완료. 봉인 전 잔여:
1. ~~R7 GJCU-shape unverified~~ → **해소**(edustack 실 대조·labelField 수정·RV-R13).
2. **publish** — 모델 판단(사용자 자율 위임). 판정: 로드맵대로 **0.4.0-alpha.0(dist-tag `next`, opt-in) 선출하** → 소아킹 후 GA `latest`. (외부 승인 대기 아님.)
3. **잔여 low-risk §Needs Review**(#RV-R4 테스트동기화·#W7-2·#W6-2b 등) — GA 비차단(descope/low-risk)·사용자 ack 대기.

**결론**: 헌장 C1~C9 보존이 실 소비자(edustack) 데이터로 검증됨. R7이 실제로 결함을 잡아냈고(가드 불충분) 즉시 수정 → GA 게이트가 판정만이 아니라 **실 결함 1건을 잡아 고친** 값진 pass가 됨.
