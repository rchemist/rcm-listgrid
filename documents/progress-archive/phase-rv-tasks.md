# Phase RV — 중간 점검 개선 트랙 (archive)

**기간**: 2026-07-13 · **범위**: 2026-07-13 중간점검 리뷰(7차원 팬아웃 + opus 검증 · CONFIRMED 8/REFUTED 0) 산출 결함 R1~R12 + 부수 G-1~G-3 + GA-BRIEF 저작.
**규범(실행 계약)**: [RV 실행 계획](../plans/rv-remediation-execution-plan.md) — R1~R12 **무결정(zero-decision)** 스펙(항목별 exact before→after 코드 + 정확한 테스트 + 수용 + Do-NOT). 13 authoring + 13 opus cold-executor 검증(소스 패치 13/13 verbatim 정확). why=[중간점검 리뷰 §4](../analysis/2026-07-13/midpoint-code-review.md).
**실행 방식**: 4 sonnet 배치 위임 → 메인 diff verbatim 적용 · 항목별 discriminating(구소스 revert→FAIL 확인) 검증.
**커밋 범위**: `3c41ebf`..`7ffb60d` (+ 슬림/포맷 커밋 `a763acf`·`8d14b6f`·`9a7770c`).

---

## R1~R12 (중간점검 리뷰 §4 결함)

- **RV-R1 reload() write-path 고아화** 🔴CRIT — `3c41ebf` · `reload()`가 스토어 write-path를 재실행하도록 `into?` 병합 도입(액션 클로저 보존 → reload 후 write 유실 해소). 판별테스트(구코드 FAIL 확인) + 2374 green.
- **RV-R2 고급검색 de-dup** 🟠HIGH — `dcd82b2` · 고급검색 재적용이 `addAndFilter` 스택킹 대신 `SearchForm.withFilter('AND', name, ...)` 교체 사용(name 교체 → 스택킹→빈결과 해소). 공개표면 무변경(61/120·신규 API 아님, 기존 `withFilter` 재사용). 2375 green. → **#W5-3 §Needs Review 해소**.
- **RV-R3 Xref 필수 권위화** 🟡MED — `0d25490` · Xref 필수를 xref-aware `isBlank`로 권위화 + inert required CustomValidation 제거.
- **RV-R4 validateAll 함수형 병합** 🟡MED — `f0d331c` · `validateAll`이 스냅샷 통째 쓰기 대신 필드별 errors 함수형 병합. **deviation → §Needs Review #RV-R4**(테스트 마이크로태스크 동기화 `slowStartedP` await 보정 `f0d331c` · 스펙 저자 확인 대기).
- **RV-R5 FieldRenderer predicate** 🟡MED — `2047bde` · FieldRenderer predicate를 `Promise.allSettled` + required fail-closed 처리.
- **RV-R6 storage 빈문자열 가드** 🟡MED — `992e58a` · `getSessionStorageObject` 빈 문자열 저장값 가드.
- **RV-R7 TIER2 방어적 스칼라 추출** 🟡MED — `5190ef3` · `/excel` TIER2 `exportValue` 중첩 관계객체 방어적 스칼라 추출. **deviation → §Needs Review #RV-R7**(doc-comment `*/` 조기종료 1-space 보정 `5190ef3` · 스펙 저자 문구 정정 대기). GA-BRIEF §3.4서 R7 GJCU-shape 실페이로드 확인이 folded-in(중첩객체 발견 시 후속).
- **RV-R8 import 오류 표면화** 🟡MED — `cdb4aac` · `DataImporter.handleSubmit` onSubmit 거부 시 `SUBMIT_ERROR` 표면화.
- **RV-R9/R10 clone():this + withId(undefined)** ⚪LOW — `56308d8` · `EntityForm.clone():this` + `withId(undefined)` 위드닝 — Law L3/L4 정합.
- **RV-R11 reset() 타이머 정리** ⚪LOW — `eac7c1c` · `reset()`가 대기 중 validate/async 디바운스 타이머 + touched 정리.
- **RV-R12 delete() ids 가드** ⚪LOW — `7ffb60d` · `delete()` create-mode ids 없을 때 `[undefined]` 대신 조기 가드.

## 부수 G-1~G-3 + GA-BRIEF

- **G-1 GX-6 asset-URL → 채택·재설계** — `9095504` · GX-6(asset-URL 전역 싱글턴 WIP)을 사용자 결정 **채택+재설계**로 처분: context-스코프 3티어 · 전역 싱글턴 폐기. 게이트 green(2373 · surface 61/120 · 188/190). → [design](../plans/asset-url-resolution-design.md). **#GX-3 asset-base 배선 §Needs Review 해소**.
- **G-2 date.ts·asset-url.test.ts format 수리** — `15d708b` · GX-3 미포맷 2파일 수리 · `format:check` green 복원.
- **G-3 #W5-3 risk 등급 정정** — low-med→HIGH(§Needs Review 반영).
- **GA-BRIEF CAP-28 게이트 브리프 저작** — [ga-gate-charter-brief.md](../plans/ga-gate-charter-brief.md)(per-C C1~C9 증거 · 매트릭스 · 게이트절차 · 순수검증) · opus 저작 + 앵커검증.

---

## RV track-end ✅ (2026-07-13)

전 게이트 green — type-check · typecheck:packages · **test 2394** · lint(0 err) · format:check(테스트4 style 커밋 `a763acf` 포함) · build · check:surface(**49/55 · 61/120 · 188/190 무변경**) · **E2E 32**.

## Patterns Introduced / Reused

- **무결정(zero-decision) 실행 계획 패턴**: authoring 세션이 항목별 exact before→after + 정확한 테스트 + 수용 + Do-NOT을 소진 → cold-executor(sonnet)는 매칭·치환·실행만. opus cold-reader가 13/13 verbatim 정확성 사전검증.
- **discriminating 검증**: 각 R를 "구소스 revert → 판별테스트 FAIL 확인"으로 회귀방지 실증(green만으로 불충분).
- **surface-neutral 재사용**: R2가 신규 API 대신 기존 `SearchForm.withFilter` 재사용으로 공개표면 무변경(계수 드리프트 0) 유지.
- **RV-R2 baseline 정정**: 실행계획 R2 수용기준 root surface "57/120"은 G-1(asset-URL·`9095504`) 이전 수치 — 실제 현재 **61/120**. R2는 surface-neutral(before==after=61). 이후 게이트 61 기준.

---

## Next Phase Handoff (Phase RV → GA 게이트 CAP-28)

- **Phase RV(R1~R12) ✅ 완료(2026-07-13)** · 트랙엔드 green(2394u · E2E32 · full gate · surface 49/55·61/120·188/190 무변경). CRIT reload + HIGH 고급검색 + MED 6 + LOW 4, `3c41ebf`..`7ffb60d`.
- **다음 = GA 게이트(CAP-28 헌장 C1~C9 대조표)** — cold-start=[GA 게이트 브리프](../plans/ga-gate-charter-brief.md)(per-C 증거·매트릭스·순수검증) + [헌장](../prd/concept-charter.md). **전제 R1·R2·G-1·G-2 착지 완료**. GA=코드변경 없는 순수검증 pass(매칭만).
- **미해결 §Needs Review(사용자 ack 대기)**: #RV-R4 테스트 마이크로태스크 동기화(`slowStartedP` await·스펙 저자 확인)·#RV-R7 doc-comment 문구 정정(스펙 저자)·기존 low-risk(#W7-2·#W6-2b·#W5-2×3·#GX-1·#GX-2·#GX-3 isExternalUrl 2카피·#W7-4×3).
- **Do-NOT(계승)**: `search-form.ts` addAndFilter 시맨틱 변경 금지 · GX-6 전역 싱글턴 기전 커밋 금지(G-1이 context-스코프로 재설계 완료) · 스펙 §를 인용 못하는 발명 금지 · 0.2(GJCU) shape primary 채택 금지(폴백만) · 구 src/ 삭제 금지 · dts experimentalDts 재시도 금지.
- **세션 정책**: **새 세션 권장**(GA=distinct 순수검증 pass·신선 컨텍스트). 재개=`/progress` → GA 게이트 브리프 단독.
