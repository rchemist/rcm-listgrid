# GA-L2 종결 기록 (TB-9 · 2026-07-13)

**판정: GA-L2 CLOSED** — "실백엔드/실소비자 데이터 대기"에서 **"framework-0.1.0 충실 테스트 백엔드 + 기존 excel 유닛 + 실 export 관찰을 오라클로 증명"**으로 전환. GA `latest` 봉인(GA-L3/L4)의 크리티컬-패스 결정만 사용자 대기로 잔존(코드축 무관).

**맥락**: GA-L1 배치 처분(2026-07-13)에서 3건(#W6-2b/#GX-1/#GX-2)이 "실백엔드/실소비자 데이터 없이 model·yes/no 종결 불가"로 GA-L2에 재앵커([dispositions](../../progress-archive/needs-review-dispositions-2026-07-13.md) §GA-L2 재앵커). Phase TB(사용자 지시 2026-07-13)가 충실 테스트 백엔드를 구축 → 이 3건이 **구축으로 종결**됨을 실증([recon §8](./test-backend-recon.md)). 규범=recon §2 wire 계약·§6 Do-NOT.

> **정정(2026-07-13)**: 본 문서 초안이 address를 "documented data-loss limitation"으로 xref와 **동일 취급**한 것은 오류. **실 export를 실행·관찰**([검증 워크플로우](#검증)·export-core.test.ts 하니스)한 결과 **address는 5개 평면 sibling 컬럼으로 무손실 export**(composite 컬럼만 빈 vestige)이고, **오직 xref만 진짜 data-loss**임이 확정됨. 초안의 `{zonecode,roadAddress}` 셰이프도 Daum 위젯 콜백 키(`address-renderer.tsx:44-49`)일 뿐 저장/export되는 `Address` 멤버(`state/city/address1/address2/postalCode`)가 아니었음 — 정정.

## §1 종결 매핑 (각 우려 → 증명 테스트·인용)

| # | 원 우려 (재앵커 시점) | 종결 근거 (증명 테스트/파일:행) | 상태 |
|---|---|---|---|
| **#GX-2** | mock filter가 5/24 조건타입만(EQUAL/NOT_EQUAL/IN/NOT_IN/LIKE) — 실백엔드가 더 필요로 하나? | TB-1 `apps/sample/lib/mock-backend/filter-engine.test.ts` = framework 0.1.0 **24종 전건** 구현·테스트(FilterDispatcher 인용). 24종=framework 계약 상한 → 실백엔드가 더 요구 불가(계약이 오라클). JSON_CONTAINS/EXISTS=평면행 store라 명시 no-op(문서화). | CLOSED |
| **#GX-1** | toJSON이 빈 `AND`/`OR []`를 상시 wire 방출 — 실백엔드가 vacuous no-op으로 수용하나? | TB-1 filter-engine(빈그룹 관용=vacuous) + TB-6 `e2e/backend-contract.spec.ts` "빈 AND/OR vacuous = no-filter 등가" over 실 HTTP. `search-form.ts` toJSON 시맨틱 무변경(EG 봉인·Do-NOT #7). | CLOSED |
| **#W6-2b (M2O)** | M2O TIER2 passthrough가 실 데이터서 garbage인가? | `packages/excel/src/__tests__/value-transform.test.ts:185-211`(M2O 7 케이스: `{id,name}`→label·폴백·스칼라 회귀가드·labelField `{id,title}` R7) + TB-5/TB-6 라운드트립. R7 실결함(RV-R13) 수정 완료. **판정=충실**(labelField 라벨 추출). | CLOSED |
| **#W6-2b (address)** | address TIER2 passthrough가 garbage인가? | **NOT garbage — 무손실.** `packages/excel/src/__tests__/export-core.test.ts`(신규·"composite AddressField ... faithful via flat siblings"): 실 export 관찰=composite `address` 컬럼 빈셀 + 5 sibling(state/city/address1/address2/postalCode) **실값 충실**. §2 참조. | CLOSED (충실·한계 아님) |
| **#W6-2b (xref)** | xref TIER2 passthrough가 garbage면 TIER3 편입? | **진짜 data-loss (유일).** `value-transform.test.ts:213`(xref `{mapped,deleted}`→빈셀) + 실 export 관찰(xref 컬럼 빈셀·carrier 無). §2 참조. 실 소비자(edustack) 트래픽 0 → 한계 문서화. | CLOSED (한계 문서화) |

## §2 M2O/address/xref TIER2 export 실동작 (실행·관찰 근거)

**공통 기전**: `manyToOne`/`address`/`xref*`는 `isAutoDeriveExcluded`(TIER-3, `value-transform.ts:287-301`)에 없어 auto-derive(`data-transfer.ts:85-93` — 필터 없음)로 export 필드셋에 **포함**되고 `filterFlatFields`(`field-resolution.ts:34-44`)가 drop 안 함. 셀 값은 `exportValue`(`value-transform.ts:221-224`)의 default→`exportTier2Value`(`:166`, `labelField`→`name`→`label`→`id` 폴백, 전무 시 빈셀).

- **M2O = 충실**: `labelField`(edustack `{id,title}`→`title`)로 라벨 추출. 실 소비자 경로. R7 수정으로 확정.
- **address = 충실(한계 아님)**: composite `AddressField`는 `exceptOnSave`/virtual(`address-field.ts:56`) — 자기 store 슬롯이 저장/export 안 됨. 실 백엔드 행은 평면 스칼라(nested `address` 키 無, [recon:40](./test-backend-recon.md)) → `row['address']=undefined` → 빈셀. **실 데이터는 5 평면 sibling `StringField`(state/city/address1/address2/postalCode·`address-field.ts:203-210`)가 무손실 운반**(각 TIER-2 `String()` passthrough). **관찰**: `export-core.test.ts` 하니스 `buildExportAoa` body = `['Kim','','Seoul','Gangnam','123 Main','Apt 5','06236']` — composite 빈셀 + sibling 충실. → 빈 composite 컬럼은 **redundant vestige, data-loss 아님**.
- **xref = 진짜 data-loss (유일)**: `XrefMappingValue={mapped:string[],deleted?:string[]}`(`xref-mapping-field.ts:25-28`)는 `name/label/id` 키 없음 → 빈셀. **address와 달리 평면 sibling carrier가 없음**(schema-core에 xref sibling-decomposition 헬퍼 부재·grep 0) → mapped/deleted id-list가 export서 소실. 게다가 **silent**: `warnAutoDeriveExcluded`는 TIER-3에서만 발화(`value-transform.ts:312-318`)하고 xref는 TIER-3 아님 → 경고 없이 손실.
  - **과투자 안 함(근거)**: 실 소비자(edustack) xref export 트래픽 = **0**([recon §3(:38)](./test-backend-recon.md)·[§6 Do-NOT #6(:76)](./test-backend-recon.md), grep 0). fidelity 투자=수요 없는 과투자 → Do-NOT #6 준수. 미래 승격 경로: 특정 소비자가 xref export를 요구하면 해당 타입을 **TIER1 명시 변환**(`exportValue` switch 케이스 추가)으로 승격(계약이 확장 지지·발명 없이 추가 가능).

## §3 재판정

- **GA-L2 = [x] CLOSED** (model-decidable — recon §8 매핑의 실행). 근거: 위 우려가 전부 **충실 테스트 백엔드(TB-1~7) + 기존 excel 유닛 + 실 export 관찰**로 증명. 실백엔드/실소비자 데이터 대기 불요 — framework 0.1.0 계약이 오라클.
- **범위 명시(edustack-specific)**: 트래픽-0 근거는 **edustack** 기준. **gjcu는 address/xref를 사용하나** 자체 bespoke pre-flatten excel 경로로 처리해 이 패키지의 `/excel`을 **우회**([recon:40](./test-backend-recon.md)) → gjcu 실 export로는 이 TIER-2 동작이 도달 불가. 따라서 xref TIER-2 손실은 현 소비자 누구에게도 실피해 없음.
- **잔존 사용자 대기(코드축 무관)**: GA-L3(`v0.4`→`main` 플립)·GA-L4(0.4.0 `latest` 배포)=사용자 **GA-latest go 결정**(크리티컬 패스). alpha 소아킹(실 edustack 피드백)은 **보완적**(edustack=0.3.22 pin·0.4 미이행)이며 GA-L2 종결 전제 아님.
- **§Needs Review #W6-2b/#GX-1/#GX-2** → `[x]` 종결(이 기록이 처분 근거).
- **후속(§Backlog·비차단)**: xref* export의 **silent data-loss**(TIER-3 아님→경고 없음)는 미래 xref-export 소비자에게 함정. 저비용 완화=xref*를 `AUTO_DERIVE_EXCLUDED_TYPES`(TIER-3)에 편입하면 최소한 `warnAutoDeriveExcluded` 발화 → 조용한 손실이 경고화. GA 후 검토(현 소비자 실피해 0이라 비차단).

## 검증

- `value-transform.test.ts` 50 green(address 방어 케이스=실 셰이프·NOT data-loss 코멘트)·`export-core.test.ts` 신규 통합 테스트(faithful siblings 관찰 lock)·전량 vitest·5게이트(TB-9 커밋서 재실행).
- **실행·관찰 검증**(추정 아님): buildExportAoa 하니스로 실 export AoA 관찰 → address composite 빈셀+sibling 충실·xref 빈셀+carrier 無 확정. 적대적 검증(opus)이 두 주장(address 충실/xref 손실) CONFIRMED.
