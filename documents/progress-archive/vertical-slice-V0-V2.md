# E2E-Parity Vertical Slice (V0·V1·V2) — 아카이브

**Parent PROGRESS**: [../PROGRESS.md](../PROGRESS.md)
**계획**: [../plans/e2e-parity-vertical-slice.md](../plans/e2e-parity-vertical-slice.md)
**Status**: ✅ 완료 (2026-07-11) — 실 GJCU 3폼이 신 엔진 6패키지로 Playwright E2E 5건 green
**결론**: **ADR-0008 abort 판정 = GO 방향 실증.**

---

실제 GJCU EntityForm(College→Major→Professor)을 신 `@listgrid/*`로 재구현 → 간단 SSR CRUD 백엔드 → **Playwright E2E green**. P3-2(state)·P5(렌더러)·P6(어댑터)를 **수직 슬라이스로 앞당겨 실행**(reorder — ADR/헌장은 설계 권위 유지). E2E 통과 = 헌장 보존검증3 + ADR-0008 abort 판정 조기 증명. 리프로직 이식(규율2)/아키텍처 신축(ADR).

> **✅ 수직 슬라이스 V0+V1+V2 완료 (2026-07-11)** — 실제 GJCU 3폼(College·Subject·Professor)이 신 엔진 6패키지로 실브라우저 **Playwright E2E 5건 green**. **ADR-0008 abort 판정 = GO 방향 실증**. 헌장 전 개념 실증: **C1**(선언=화면)·**C2**(조건부 정책=cross-field cascade)·**C3**(관계 1급 — ManyToOne 팝업 + OneToMany SubCollection)·**C4**(필드 카탈로그 String/Number/Bool/Textarea/Markdown/Date/Select/M2O/SubColl)·**C5**(검증 카탈로그 10종)·**C6**(필드그룹/탭)·**C7**(6-seam 호스트주입)·**C9**(리스트). 리프로직 이식(규율2)/아키텍처 신축(ADR) 검증됨.

| 마일스톤 | 범위 | 게이트 | 상태 |
|---|---|---|---|
| **V0.1** schema-core 코어 | EntityForm + 필드클래스(String/Bool/Number/Textarea/Markdown/Select/M2O) + value ops(dirty/blank) + validate | 단위테스트 ✅ 32 green | ✅ `8ca3932` |
| **V0.2** state 스토어 | createFormStore(값슬라이스·validate·hydrate·toSaveData[M2O flatten])/createListStore + SearchForm + BackendAdapter 계약 | 스토어 단위테스트 ✅ 11 green | ✅ |
| **V0.3** ui-default + react 폼 | ui-default 프리미티브 11종 + 5-seam 프로바이더(throw) + FieldRenderer 레지스트리(D4 슬라이스 구독) + ViewEntityForm(validate→onSave) | jsdom 렌더 테스트 ✅ (타이핑→store·required 에러·onSave) | ✅ |
| **V0.4a** backend+list+form+E2E | backend-rcm 어댑터(12t) + @listgrid/next + sample College/Prof/Univ CRUD + ViewListGrid + College 재구현 + 페이지(list/new/edit) + Playwright | **College CRUD E2E green ✅** (list fetch→생성→required검증→POST→목록반영→edit(getOne+hydrate)→PUT→영속) | ✅ |
| **V0.4b** ManyToOne 팝업 | AdapterProvider seam + ManyToOne 렌더러(Modal + ViewListGrid 피커, id→entity 해소) + College dean(→Professor thunk) + E2E | **College+dean E2E green ✅** (피커 열기→교수 fetch→선택→표시→저장 deanId flatten) | ✅ |
| **V1** Subject | validations 카탈로그(10종 이식) + Number/Select/Date 필드·렌더러 + **cross-field cascade(dependsOn/D4 — V0.3 갭 해소)** + Subject 재구현(과목: regex/minmax/email + 온라인 조건부) | **Subject E2E green ✅** (검증 3종 발화→통과 + onlineUrl 조건부 표시/필수) | ✅ |
| **V2** Professor | SubCollectionField + SubCollectionRenderer(inline 테이블·add/edit/delete) + 자식 store 격리(ADR-0002§4, 자식 폼 Modal) + Professor.degrees + 페이지 | **Professor degrees E2E green ✅** (자식폼 추가→행 누적→삭제→부모 저장) | ✅ |

**확정 설계 결정**: **D1** 관계 thunk 지연참조(College↔Professor↔Major 순환생성 방지) · **D2** RCM 0.1.0 wire(POST `/{url}/search` 리스트+M2O공용·bulk `DELETE {url}`·Spring-Page envelope·ADR-0005 에러코드) · **D3** 5-seam 프로바이더(UI/Modal/Router/Auth/Message, 미주입 throw) · **D4** 값슬라이스 셀렉터 구독(clone(true) 소멸) · **D5** 이식 오라클(P2/신규 단위테스트 green). 근거·상세는 [계획 문서](../plans/e2e-parity-vertical-slice.md).
