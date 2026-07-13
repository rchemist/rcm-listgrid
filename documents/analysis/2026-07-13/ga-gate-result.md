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
| **test (특성화 P2 포함 = 요건1)** | `npm run test` | **2394 passed \| 1 todo · 186 files** (16.6s) | 0 |
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

## 3. 요건 3 — GJCU급 실 엔티티 재현 + R7 GJCU-shape (§3.4)

- **재현(folded-in)**: apps/sample GJCU급 엔티티(college/professor/collabo)가 리스트+폼+관계+엑셀을 실제 구동 → §1 E2E green이 곧 요건3 충족. ✅
- **R7 GJCU-shape 확인 → ⚠ unverified**: 실 GJCU/edustack list-endpoint 페이로드가 리포에 부재(grep: real payload fixture 0건 — apps/sample은 mock만). manyToOne/xref/address 컬럼의 **평면 스칼라 vs 중첩 관계객체** 판정 불가. 근거: `packages/excel/src/value-transform.ts:138-163` TIER2 방어적 스칼라 가드(R7 착지)는 중첩객체를 크래시 없이 처리하나 **무결성 손상 여부는 실 페이로드 형태에 종속**. **Do-NOT #5 준수**: "평면일 것" 추정 금지 → 'R7-nested / unverified' + **R7 후속 유지**. 인라인 수정 없음.

---

## 4. GA 판정

**요건 2(헌장 C1~C9 대조표) 충족** — 9 C행 전부 `present`(C6 일부 descoped-ok), 빈 행 0. **요건 1(P2 특성화 동일 통과)·§3 게이트 전건 green.** **요건 3 재현 충족**.

**단, 최종 GA 봉인은 보류(HOLD)** — 브리프 §5 판정 규칙("하나라도 unverified → 봉인 보류 + 후속 유지"):
1. **R7 GJCU-shape unverified** — 실 GJCU/edustack 페이로드로 manyToOne/xref/address 컬럼 형태 확인 필요(소비자/외부 데이터 = 세션 밖). 중첩객체면 `/excel` TIER2 후속 태스크, 평면이면 무해.
2. **P0/P1 publish = 외부 승인 대기** — 0.3.26 배포됨, 0.4.0-alpha/GA publish는 외부 승인 몫.

**정리**: 코드/구현 축은 GA-ready(헌장 대조 present·전 게이트 green). 봉인 전 잔여 = **소비자/외부 확인 2건**(R7 실페이로드·publish 승인) — 코드 변경 아님. 이 2건은 §Open Questions에 등재, 사용자/외부 입력 대기.
