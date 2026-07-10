# 형식 로드맵 P3–P7 (spec-first 계약 골격 → GA) — 아카이브/보류

**Parent PROGRESS**: [../PROGRESS.md](../PROGRESS.md)
**로드맵 원본**: [../plans/v1-roadmap.md](../plans/v1-roadmap.md) (페이즈 정의의 원본 — 이 문서와 어긋나면 로드맵이 우선)
**Status**: P3-1 ✅ · P3-2~6 ⬜ · P4~P7 ⬜ (개요) — **수직 슬라이스가 P3-2/P5/P6를 앞당겨 실증**했으므로 형식 트랙은 **보류**. 다음 방향은 하드닝+점진 확장으로 확정(2026-07-11, PROGRESS §Open Questions). 형식 P3-P7 게이트(표면 감사표·GA 대조표)는 GA 승격 시 재개.

---

## P3 — 계약 골격 + 표면 감사표 (spec-first 게이트)

- [x] **P3-1 [O] schema-core 계약** ✅ 2026-07-10 · `fb8f9cb` · 순수메타 EntityField·FieldValueSlice·FieldEvalContext·PermissionPolicy 통합(+SubColl)·Validation base · 1047 green · 결정 2건→§Needs Review
- [ ] **P3-2 [O] state 계약** — `packages/state`: `createFormStore()/createListStore()` API(zustand vanilla), 셀렉터 규약, 중첩 폼의 자식 store 생성+부모 캐시 전달 프로토콜(ADR-0002 §Decision 4). *(수직 슬라이스 V0.2에서 실구현·실증됨.)*
- [ ] **P3-3 [O] BackendAdapter 계약** — `packages/schema-core` 또는 별도: ADR-0005 §Decision 1 인터페이스 + `BackendErrorCode` enum. 구현은 P6(여기선 타입+기본 어댑터 시그니처만). *(수직 슬라이스 V0.2/V0.4a에서 실구현·실증됨.)*
- [ ] **P3-4 [S, codex eligible] 표면 감사표** — 구 배럴(src/listgrid/index.ts) 580 심볼 전수 → `documents/analysis/surface-audit.csv`(심볼·분류[유지/이동/삭제]·이동 대상 패키지·근거 한 줄). 판정 기준: ADR-0004 §Decision 1. 목표 공개 심볼 ≤220.
- [ ] **P3-5 [S] 렌더러 레지스트리 + StringField 파일럿 이식** — `packages/react`: `registerFieldRenderer(type, component)` + 미등록 폴백(dev 경고+문자열). StringField를 레시피 확립용으로 1종 완전 이식 → 특성화 P2-2 String 케이스가 신 엔진에서 green → 이식 레시피 문서화(`documents/plans/transplant-recipe.md`). *(수직 슬라이스 V0.3에서 레지스트리+다수 필드 실이식됨.)*
- [ ] **P3-6 [O] 헌장 대조 리뷰** — C1~C9 × 계약 골격 매핑 표 작성(빈 칸 = 계약 보완 필요). apps/sample에 파일럿 필드 데모 페이지 추가.

**P3 게이트**: 골격 컴파일 + 파일럿 1종이 sample에서 렌더·입력·검증 동작 + 감사표 완성 + 대조표에 빈 칸 없음.
**P3 종료 세션의 의무**: 아래 P4·P5 개요를 체크박스 태스크로 전개해 커밋한다(전개 규칙은 각 개요에 명시).

> **P3 착수 노트 (cold-start — 여기서 실제 엔진 이식 시작)**: 지금까지(P0~P2)는 바닥다지기(버그픽스·골격·오라클), src/ 52k LOC·필드 59종은 아직 미이식(`@listgrid/*` 전부 빈 스텁). P3부터 실코드 이식. **읽을 것**: ADR-0003(schema/render 분리 — EntityField view() 제거, 렌더러 레지스트리, useSession 인자화)·ADR-0002(폼 상태 — createFormStore 값슬라이스 `{current,fetched,default,errors,dirty}`, 셀렉터 구독)·ADR-0004(표면)·ADR-0005(백엔드). **권장 순서**: P3-1→P3-2 계약 → **P3-5 StringField 파일럿(첫 실이식, 레시피 확립)** → P3-4 감사표 → P3-3 → P3-6. **검증**: P2 오라클 준비됨 — 파일럿 이식 후 `harness.ts`의 2개 엔진 pointer를 `@listgrid/*`로 flip해 특성화 테스트가 신 엔진에서 green이면 이식 완료. **[O] 태스크는 opus 세션 권장.** *(참고: 수직 슬라이스가 이 순서를 실 폼 구동으로 앞당겨 실증했다.)*

## P4 — 코어 이식 (개요 — P3 종료 시 전개) **[abort 판정 지점]**

EntityForm 선언 모델(5단 상속→컴포지션), 검증 12종, SearchForm 직렬화, OnChange 연쇄를 schema-core+state로 이식.
**전개 규칙**: 감사표의 "유지" 심볼 중 config/·form/·validations/ 소속을 모듈 단위(≈8~12 태스크)로 나누고, 태스크마다 ①이식 원본 경로 ②대상 패키지 ③대응 특성화 테스트 ④모델 태그를 기입. 감리 [O], 실행 [S].
**게이트**: 특성화 로직 계층 테스트가 신 코어에서 동일 green · madge circular ≤20 · 추정 150% 초과 시 abort 검토(사용자 결정).

## P5 — 렌더러 이식 (개요 — P4 중반 전개)

파일럿 레시피(P3-5)로 39종 반복 [H/S] → ViewEntityForm/ViewListGrid를 store 셀렉터 구독으로 재구성(드릴링 0) → CSS 이식+레이어 충돌 4건 정리(raw/map-styles §2.3 — 이 항목만 원자료 참조 허용) → 동시 처리 고정 목록 적용 → sample 엔티티 3종 + /theming 완성.
**전개 규칙**: `grep -l "extends.*FormField" src/listgrid/components/fields` 목록으로 필드별 체크박스 생성(1필드=1태스크=1커밋, 특성화 or 신규 렌더 테스트 동반).
**게이트**: ADR-0002 수용 기준(키 입력 리렌더=1필드·onChange clone 0회·중첩 재fetch 0회) + 그물 전량 green + `t()` 한글 키 0건.

## P6 — 어댑터·표면 완성 (개요)

backend-rcm(현행 URL/envelope 관례 **무변경 이사** — EntityForm.tsx:676-688, form/Type.ts:91-168이 원본) + backend-rest + 에러 코드 재배선(ADR-0005) · ui-default(headlessui/react-select/sortablejs 격리 — ADR-0004 §4) · next 어댑터 이식 · exports 맵 = 감사표 착지 · sample /extensibility E1~E6([명세](../prd/sample-site-spec.md)).
**게이트**: ADR-0005 4항 + ADR-0004 6항(심볼≤220 · 도메인 어휘 코어 0건 · 코어 필수 peer ≤4) + E1~E6 시연.

## P7 — 0.4.0 GA (개요)

[마이그레이션 리빙 문서](../plans/migration-0.3-to-0.4.md)를 `docs/MIGRATION.md`(사용자 대면)로 승격 + codemod · docs/api 재생성 · **헌장 대조표**(C1~C9 × 구현 위치 × sample 페이지 — 빈 행 시 GA 불가) · 실엔티티 재현 검증(헌장 §보존 검증 3 — GJCU/edustack급 엔티티 1종) · getting-started 전면 개정(코드 블록=sample 실코드) · 브랜치 플립(main→release/0.3, v0.4 승격) · 0.3.x 지원 정책 고지.

---

## 형식 게이트 타임박스

P0~P3 3개월 / P4 parity 6개월 초과 시 ADR-0008 §6 abort 검토(사용자 결정 사안). — 수직 슬라이스가 abort 판정을 GO로 조기 실증했으므로 위험 완화됨.
