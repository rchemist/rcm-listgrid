# 하드닝 H 트랙 — 아카이브

**Parent PROGRESS**: [../PROGRESS.md](../PROGRESS.md)
**Status**: ✅ 완료 (2026-07-11) — 게이트/CI 확장 + SubCollection 테스트 + id→entity 캐시 + a11y
**소속**: 하드닝/확장 트랙(active)의 완료 서브섹션 (E-트랙은 PROGRESS 본문에 계속)

---

## 완료 태스크 (본문에서 verbatim 이전 — 2026-07-11 slim self-check)

- [x] **H·게이트** 품질게이트 신 패키지+apps 확장(eslint globs·lint/format globs·`typecheck:packages`) · `0493333`/`a7c1e03`
- [x] **H·CI** CI에 packages tsc + Playwright e2e job 배선 · `0493333`
- [x] **H·SubColl테스트** SubCollection 단위테스트(state) · `0493333`
- [x] **H1** id→entity 캐시 ✅ `e48a21f` · M2O 참조해소 adapter-scoped 캐시(useReferenceResolver, dedup+실패시 evict) · react 7/7·M2O E2E 2/2·gate(1120→1123)
- [x] **H2** a11y ✅ `8144df4` · aria-required/invalid/describedby + focus-first-error + Modal 포커스(open→dialog·close→복귀) · react 9/9·E2E 5/5·gate(1124→1129)

## Patterns Introduced (재사용 참조)

- **useReferenceResolver** (react) — M2O id→entity 해소의 adapter-scoped 캐시: in-flight dedup + 실패 시 evict. M2O류 필드(Xref 등) 이식 시 재사용.
- **a11y 3종 세트** — aria-required/invalid/describedby + focus-first-error + Modal 포커스 트랩(open→dialog, close→trigger 복귀). 신규 렌더러 이식 시 동일 패턴 준수.
- **품질게이트 globs** — 신 패키지 추가 시 eslint/lint/format globs + `typecheck:packages`에 포함되는지 확인(H·게이트에서 배선됨).
