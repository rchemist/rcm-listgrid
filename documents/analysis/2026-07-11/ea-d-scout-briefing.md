# EA-D 스카우트 브리핑 — Xref/Rule/InlineMap 실사용 센서스 + 이식 판정

> **생성 주체**: 3-리포 read-only 스카우트(sonnet, 2026-07-11 — rcm-listgrid / gjcu-academic-front(실체 확인: ~/dev/gjcu-academic-backend/gjcu-academic-front) / edustack). 인용은 이식 시 원본 재확인 필수.
> **Conductor 확정 결정**: ① **Dead 3종 연기** — RuleField(+rule/ 1264줄)·XrefPriceMapping(535줄, 이미 opt-in subpath 격리)·XrefAvailableDateMapping(505줄): 양 소비자 실사용 0(전수 grep, ContentAsset급 증거). §Needs Review 기록. ② **InlineMap = 이번 이식(단독 delegate)** — pendingRef 인스턴스 사이드채널은 신엔진에서 **이식 불가**(ADR-0002: 값은 store 슬라이스에만, 인스턴스 훅 없음) → **store-direct-write 재설계**(렌더러가 매 변경 setValue — Tag/MultiSelect 동형; debounce 필요 시 컴포넌트 로컬 버퍼). 이 재설계로 구 issue #1289(required 조용히 파손)와 clone 참조공유 위험이 원천 소멸. ③ **XrefMapping/XrefPrefer = EA-D2 신설로 이월(EC2 뒤·EC3 앞 reorder)** — 선행 병목인 ViewListGrid 확장(selection/subCollection/onFetched/fields — V0.4 의도적 부재)을 EC3(Major) 실폼 요구 주도로 설계하기 위함. `xrefPreferMapping` FieldType 신설도 그때. ④ supportPriority 드래그 재정렬(ReactSortable류)은 EA-D2에서도 별도 판단(신규 의존성 결정 필요 — 명시 연기).

## PART A — 실사용 센서스

| 필드 | gjcu-front | edustack | 판정 |
|---|---|---|---|
| XrefMappingField | **29** (MajorEntityForm.tsx:109,121,147,161 — 한 폼에 4개 xref 동시 / StaffEntityForm:95,158,178 / BoardEntityForm:142 supportPriority+add) | 0 | ALIVE(헤비) → EA-D2 |
| XrefPreferMappingField | **2** (LectureEntityForm:258 showPreferred / ConvergenceEntityForm:49 filters) | 0 | ALIVE → EA-D2 |
| XrefPriceMappingField | 0 | 0 | **DEAD** — 라이브러리 스스로 opt-in subpath 격리(src/xref-price.ts:1-10, sweetalert2 회피) |
| XrefAvailableDateMappingField | 0 | 0 | **DEAD** — 메인 배럴 잔존에도 순수 미채택 |
| RuleField | 0 (rule/ 전 심볼 0, 주석조차 없음) | 0 | **DEAD** — export 5종 전부 public이었는데 채택 0·bespoke 백엔드 계약(RuleMappingResult) 흔적 미확인 |
| InlineMapField | **8** (ArticleEntityForm:85·OptionEntityForm:29·MenuEntityForm:52 등) + **호스트 실구현 존재**(packages/ui/form/InlineMap.tsx 362줄, UIAdapter 3앱 배선) | 0 | ALIVE → **이번 이식** |

## PART B 발췌 — InlineMap (이번 이식 대상)

- old: `src/listgrid/components/fields/InlineMapField.tsx:1-150` — `super(name, order, 'inlineMap')`(:41, 신엔진 types.ts:31에 동일 문자열 기존재). 라이브러리엔 headless 슬롯만(`UIProvider.tsx:183` makeWrapper('InlineMap'), InlineMapPendingRef/KeyValue = any) — 실 UI는 호스트 소유(gjcu InlineMap.tsx 362줄 참고용).
- **valueShape**: `resultType`에 따라 3형 — `Object`(기본 `Record<string,string>`) / `Map<string,string>` / `KeyValue[]`(`{key,value}[]`) (gjcu InlineMap.tsx:33,157-174).
- builders: `withKeys/useResultMap/useKeyValue/withLimit/withConfig/withDefaultValue`(:98-145) — InlineMapConfig 얕은 머지. **InlineMapConfig/MapKey 타입**(구 Config.ts:446-449) 신엔진 미존재 — 이식 필요(순수 타입).
- **pendingRef 메커니즘(이식 금지 — 재설계 근거)**: ① 인스턴스 프로퍼티 `pendingRef:{current:{value,modified}}`(:38), 렌더러가 매 변경 `pendingRef.current = {...}` 재할당(InlineMap.tsx:112-121) ② getSaveValue/isBlank/isDirty가 pendingRef.current.modified 우선(:45-72 — 구 issue #1289 회귀: pendingRef 안 보면 required 조용히 파손, `__tests__/InlineMapField.test.ts:44-61`) ③ **createInstance(:92-96)가 `instance.pendingRef = this.pendingRef` — 동일 mutable cell 참조 공유** → 모든 Xref view의 `entityForm.clone(true)` 경로에서 원본↔clone이 셀 공유(스냅샷 생존 시 오염 누출).
- **신엔진 재설계(확정)**: 렌더러가 매 변경 `store.getState().setValue(name, buildResult())` 직접 호출 — 순수 isBlank/isDirty가 슬라이스를 그대로 봐서 정확(pendingRef 불필요·clone 위험 소멸·#1289류 원천 차단). Map resultType은 직렬화 주의(store 슬라이스에 Map 인스턴스 — toSaveData/hydrate 왕복 확인 필요; 구엔진도 Map을 지원했으나 실사용 8건의 resultType 분포는 미조사 — 이식 시 Object/KeyValue[] 우선, Map은 왕복 테스트로 판단).

## PART C 발췌 — 신엔진 매핑 (EA-D2 설계 인풋)

- 커버됨: SearchForm QueryConditionType 12종(IN/NOT_IN — 이중 필터 데이터 계층 가능)·BackendAdapter.list 표준 계약(Xref는 bespoke 엔드포인트 불요)·ManyToOneRenderer(단일 선택 picker 선례)·SubCollection ChildFormModal(XrefPrefer의 mini-form-in-modal과 동형 — 재사용 후보).
- **없음(EA-D2 pre-stage 병목)**: ViewListGrid selection(체크박스+bulk)/subCollection.add·delete/onFetched/fields 주입 컬럼 — V0.4 주석 명시 의도적 최소("Deliberately minimal..."). 드래그 재정렬 전무. `'xrefPreferMapping'` 타입 없음(xrefMapping/xrefPriorityMapping/xrefAvailableMapping은 types.ts:32-33 기예약).
- **XrefPrefer 트랩(EA-D2에서 필수 방어)**: mini-form의 ManyToOneField는 `${name}Id`로 flatten — 내부 필드명을 그대로 읽으면 undefined→빈 IN 필터→전체 리스트 반환(구 XrefPreferMappingView.tsx:172-175 주석·신 many-to-one-renderer도 동일 flatten).

## PART D — 배치 확정

- 이번(EA-D): InlineMap 단독 delegate(공유 파일 접촉 허용 — 병렬 없음): InlineMapConfig/MapKey 타입 + InlineMapField + UIComponents.InlineMap 슬롯(ui-default 최소: keys 고정/자유 key-value 행 편집기) + 렌더러(store-direct-write) + 등록 + 테스트.
- EA-D2(EC2 뒤): ViewListGrid 확장 4종(설계 [O]) → XrefMapping(2-view 또는 xrefMapping/xrefPriorityMapping 분리 — types.ts가 분리 방향 예견) + XrefPrefer(+타입 신설). 드래그 재정렬 별도 판단.
- 연기 기록: Rule/XrefPrice/XrefAvailableDate(§Needs Review — 필요 시 이 문서 PART B의 LOC/기계 요약이 재개 출발점).
