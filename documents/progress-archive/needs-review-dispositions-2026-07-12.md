# §Needs Review 일괄 처분 — D2 (2026-07-12)

> D-pass D2. 사용자 지시(2026-07-12): W4 phase-end에서 이월된 잔여 §Needs Review 9건을 **스펙 저자로 일괄 결정**하고 진행. 승인 범위 = **발명금지 게이트 이 항목들엔 해제**(모델 auto-decide + 기록 + 스펙 반영). domain/business 판단만 §Open Questions로. 근거: 전건이 "스펙 저자 판단감"으로 이미 분류됨(비블로킹).
>
> 결과: **2 코드 변경**(#W2-5+#W3-2 SaveOutcome `reason` 판별자 · #W3-5b formReadOnly Save-슬롯) + **7 문서 결정**(스펙 반영). §Open Q 이월 0. 상세 커밋: D2 커밋 참조.

## 코드 변경을 동반한 결정

### #W2-5 + #W3-2 — SaveOutcome `reason` 판별자 (동류·함께 해소)

- **문제**: `SaveOutcome = {ok:true} | {ok:false; cancelled?; error?}`에서 세 blocked 결과(validation-fail · reason-less cancel · capability-denied)가 전부 bare `{ok:false}`로 붕괴 → 부작용(필드 errors / 배너 / 없음)으로만 구별. exactOptional이 `cancelled:undefined`를 금지해 reason-less cancel이 validation과 구별불가(#W2-5). capability 거부도 동형(#W3-2).
- **결정**: `{ok:false}` 브랜치에 **`reason: 'validation'|'cancelled'|'capability'|'error'` 판별자 추가**(인라인 union 확장 — 신 export 0, 계수 무변경). `cancelled`/`error`는 해당 reason의 payload로 잔류. reason-less cancel도 `reason:'cancelled'`로 명시 → #W2-5 봉인. capability=`reason:'capability'` → #W3-2 봉인.
- **근거**: 재설계의 정직-타이핑 가치(cf. 정직 undefined·name-키 에러맵·no magic fallback)와 정합. headless 호스트(C7)가 store 내부 미조회로 분기 가능. 리포터가 두 항목으로 명시 플래그.
- **파일**: `form-runtime.ts`(SaveOutcome union+JSDoc) · `form-controller.ts`(save/delete 9 return site + 헤더 flow NOTE + capability 주석) · `entity-form.ts`(cancel JSDoc) · 스펙 §6.2. 테스트: form-controller.test.ts 기존 assertion에 reason 추가 + **reason-less cancel 구별 테스트 신규**(#W2-5 직접 증명). async-validation.test.ts·form-actions.test.tsx assertion/mock 갱신.

### #W3-5b — formReadOnly가 `replaces:'save'` 커스텀 액션도 숨김

- **문제**: `formReadOnly`는 빌트인 saveBuiltin만 제외(merge 전 `builtins=[]`), 그러나 `replaces:'save'` 커스텀 액션은 `...custom`으로 병합되어 readOnly 폼에 save-슬롯 버튼이 렌더 → withReadOnly 무력화.
- **결정**: **formReadOnly일 때 `replaces:'save'` 커스텀 액션도 드롭**. Save 어포던스 = 빌트인 + 그 슬롯을 점유하는 교체 액션. `replaces:'delete'`·일반 커스텀 액션은 무관(§6.1 Save 전용).
- **근거**: formReadOnly의 목적 = "저장 어포던스 없음". 교체 액션은 그 어포던스 자체 → 함께 숨겨야 정직.
- **파일**: `ViewEntityForm.tsx`(merge 전 `custom` 필터) · 스펙 §3.1 withReadOnly 행. 테스트: form-read-only.test.tsx +2(replaces:'save' 숨김 + 일반 커스텀 액션 잔류 control).

## 문서 결정 (스펙 반영 · 코드 변경 없음 — 현 구현 = 의도)

### #W3-3 — ActionContext.controller(required) vs ViewEntityForm.controller?(optional)

- **결정**: 두 타입 **불변**. `ActionContext.controller` required 유지(액션 `run(ctx)`는 런타임 보장 — 옵셔널화하면 흔한 케이스 열화). `ViewEntityForm.controller?` optional 유지(표시전용/host-owned-save C7 뷰 유효). controller 없는 뷰는 controller-의존 어포던스(Delete·커스텀 액션·render)를 omit, 빌트인 Save만 legacy onSave 경로. `replaces:'save'`+no-controller=Save 없음=정직(교체 액션이 실행할 controller 부재).
- **스펙**: §3.4 ActionContext 하단 노트.

### #W4-1a — getTitle 최종 폴백 = `this.name`

- **결정**: renderType별 카피("새 X"/"X 수정")를 엔진이 **발명하지 않고** `this.name`(생성자 보장 non-empty) 폴백. 대면 카피는 소비자 소관(withTitle/slots.title).
- **근거**: 카피 로컬라이제이션은 소비자 관심사·엔진 발명 회피(no-magic-fallback 정합). **스펙**: §3.1 getTitle 행.

### #W4-1b — withTitle 재호출 = replace

- **결정**: **replace**(L1 with* 기본). title은 스칼라라 자연스러움 — withCapabilities/withMeta의 명시 merge와 의도적으로 다름. **스펙**: §3.1 withTitle 행.

### #W4-2a — 위저드 전 step hidden = graceful (액션바만)

- **결정**: 전 step이 hidden이면 step content/nav 없이 **액션바만** 렌더(크래시 없음). degenerate(오설정) 케이스 → graceful fallback, "전체 폼 fallback" 서프라이즈 미발명. **스펙**: §3.2 위저드 hidden 노트.

### #W4-6a — step-hidden(id-based) vs 필드-hidden(store renderType) 분기 = 의도

- **결정**: step 가시성=`actionRenderType`(id-based·W3-6 Fix#3), step 내부 필드 가시성=store `renderType`. 다른 관심사(스텝=위저드/CRUD 모드, 필드=폼 렌더 모드)이므로 분기 유지가 정확 — 통일 안 함. prefill 좁은 발산은 각 관심사 내 일관이라 수용. **스펙**: §3.2 위저드 hidden 노트.

### #W2-1 — onInit 통합 시맨틱 = 설계 확정, gjcu 검증은 W7

- **결정**: onInit 1배열·등록순서=실행순서·반환교체 hatch 폐기는 **설계 확정**(스펙 §4.2/§9 기존 명세). 미결 부분("gjcu가 구 2배열 등록순서/반환교체에 의존하는지")은 스펙 저자 결정이 아니라 **W7 마이그레이션 시점 외부 소비자 검증** → §Needs Review deviation이 아닌 **W7 마이그레이션 체크리스트 항목**으로 전환. 스펙/코드 변경 없음.
- **근거**: risk=migration. 설계는 이미 결정·문서화됨. 잔여는 외부 코드(gjcu) 실측이라 D-pass 결정 대상 아님.

## §Open Questions 이월

없음. 9건 전부 스펙 저자 결정으로 처분(2 코드 + 6 문서 + 1 W7 검증 전환). domain/business 판단 요구 항목 0.
