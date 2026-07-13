# §Needs Review 처분 — GA-L1 배치 (2026-07-13)

> Phase GA-L(GA `latest` 봉인 트랙) GA-L1 "low-risk §Needs Review 일괄 처분"의 처분 원장.
> GA 비차단·전건 risk:low. 모델처분(model-decidable) 9건 = 확정(`[x]`). 실백엔드 검증 gated 3건 = GA-L2 소아킹으로 재앵커(open 유지).
> 근거 아카이브: [phase-eg](./phase-eg-api-redesign.md) · [phase-gx](./phase-gx-tasks.md) · [rv 실행계획](../plans/rv-remediation-execution-plan.md)

## 검증 로그 (2026-07-13)

- `npm run typecheck:packages` (tsc -b) → exit 0.
- `npm run build` (JS+DTS+styles) → exit 0 — RV-R7 코멘트 정정(`xref* /address`→`xref/address`)이 oxc 파서 통과 실증(구 `*/` 조기종료 PARSE_ERROR 재현 불가).
- 배너/크로스레프 존재 실측: guide `list-page-composition-guide.md:3`(⛔SUPERSEDED 배너 present) · `packages/utils/src/url.ts:28`+`packages/schema-core/src/util/url.ts:2`(isExternalUrl 상호참조 주석 present).

## 확정 처분 (`[x]` · 9건)

### 이미 코드에 반영됨 (fait accompli — 증거 실측)
1. **#W7-4 guide SUPERSEDED 배너** — 배너 이미 존재(`documents/plans/list-page-composition-guide.md:3`, ⛔SUPERSEDED→MIGRATION §3). declared 4산출물 밖 touch=team-conv상 정당(정보흡수 보존). **처분: 종결.**
2. **#GX-3 isExternalUrl 2카피** — 상호참조 주석 이미 존재(utils/url.ts:28·schema-core/util/url.ts:2·asset-url.ts:18-22). zero-dep 하드룰 의도적 byte-identical 재구현(GX-3 설계 결정). **처분: 의도적, 종결.**

### 정정 적용 (문서/코멘트)
3. **#RV-R7 doc-comment `*/` 조기종료** — 스펙 저자 기제안(`xref/address`) 적용: `packages/excel/src/value-transform.ts:143` `manyToOne/xref* /address`→`manyToOne/xref/address`(별표 제거=`*/` 없음). build green 재확인. **처분: 정정+종결.**
4. **#W7-4 spec §9 #29 라벨** — spec `entityform-public-api-spec.md:363` 방식 라벨 `codemod`→`수동/이연 — presets-rcm auditFields() 빈 스캐폴드(미출하), 출하 후 codemod화(§Backlog)`. v0.4.cjs 10규칙에 미포함=라벨이 부정확했음(진실 정정, 발명無). codemod화는 §Backlog로 보존. **처분: 스펙 라벨 정정(opus 권한)+backlog.**

### 배송된 low-risk deviation 수용 (green 게이트 커버)
5. **#W5-2 major/staff withList** — 배송 완료(major.ts+staff.ts=M2O/Xref 피커 target·폴백폐기 후 미선언시 E2E 파손)·E2E32 green으로 실증. directive-8 "unless needed" 충족. **처분: 수용(배송·E2E 실증).**
6. **#W5-2 EntityField 캐스트** — `(field as FormField).getListConfig()` 구조적 캐스트(EntityField 인터페이스 미선언). 전 concrete field=FormField extends라 런타임 안전. **후속=EntityField 인터페이스에 getListConfig/getFilterConfig/getDisplayValue 선언 이관→§Backlog. 처분: 수용+backlog.**
7. **#W5-2 픽스처 4파일 withList** — 폴백폐기로 columns 없는 픽스처 파손 방지 위해 withList 추가. 팀규약 "기존 테스트 수정 허용·§인용"(§5.1)·행동약화 아님. **처분: 수용(team-conv).**

### 검증된 수정 수용 (spec-author 사인오프)
8. **#W7-2 headless @types/react** — 수용: 런타임 React 0 실증(check:headless·react 런타임 import 0)·`@types/react`=표준 dev type-only(조건렌더 타입 OptionalReactNode 등 API 표면 유지 위해 불가피·대안無). 스펙 §2 "React peer 0"=런타임 peer로 해석 확정. **사용자 override 여지: 있으면 통보(§2 문구 형식화만).**
9. **#RV-R4 test 마이크로태스크 동기화** — 수용: 수정 `f0d331c` 적용·판별적 실증(구소스 revert→FAIL 확인)·R4 Do-NOT 전건 보존(gate-check 로직·named helper·per-field errors만 write·필드순서·slowCallCount 가드). 테스트 내부 동기화 mechanic(도메인 결정 아님). **처분: 수용.**

## GA-L2 재앵커 (open 유지 · 실백엔드 검증 gated · 3건)

실백엔드/실소비자 데이터 없이는 모델·사용자 yes/no로 종결 불가 → GA-L2 alpha 소아킹(edustack/GJCU 실 데이터)으로 재앵커.

- **#W6-2b TIER3 uniform 필터 경계** — M2O/xref/address TIER2 passthrough(평면행 값 export)가 실 GJCU 데이터서 garbage인지 확인 필요. garbage면 TIER3 편입. [detail](./phase-eg-api-redesign.md#w6-2b-excel-exportimport-core-cap-17)
- **#GX-1 toJSON empty AND/OR 그룹 방출** — 빈 `AND`/`OR []` 상시 wire 방출이 실백엔드서 vacuous no-op으로 수용되는지 실서버 대조. [detail](./phase-gx-tasks.md#gx-1)
- **#GX-2 mock filter 5/24 조건타입** — 실백엔드가 필요로 하는 조건타입(현 mock=EQUAL/NOT_EQUAL/IN/NOT_IN/LIKE만)이 더 있는지 실서버 대조. [detail](./phase-gx-tasks.md#gx-2)

## 사용자 override 안내

- #W7-2(peer 0=런타임 해석)·#W7-4 §9(라벨 정정 vs presets-rcm 감사헬퍼 출하) = 모델 저위험 기본값으로 처분. 스펙 저자 판단이 다르면 통보 시 재개정.
