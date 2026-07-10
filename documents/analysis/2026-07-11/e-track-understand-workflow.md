> ⚠️ **분석 산출물 (워크플로우 원자료 — 검증 후 인용)**
> 생성: `e-track-understand` 워크플로우(2026-07-11, 5 에이전트 병렬, 2 리포 분석, 509k 토큰). 이 문서는 **원자료**다 — 결론/실행 계획은 검증을 거쳐 [../../plans/e-track-field-parity.md](../../plans/e-track-field-parity.md)로 종합됨. 단독 인용 금지, 계획 문서 경유.
>
> **검증 로그**:
> - `field-inventory`(sonnet, 174k tok, 54 tools) — ✅ 신뢰. 40 concrete field class 전수, 11 이식분 제외→30 확정. 함정(ColorField dynamic Tailwind·InlineMap pendingRef) 명시. 스팟체크: BirthdayField/FileField/AddressMapField 경로 실재 확인.
> - `lifecycle-contract`(opus) — ❌ **실패**. `{"summary":"test",...}` degenerate stub 반환(StructuredOutput에 placeholder). **재실행 안 함** — `new-engine-gap`이 동일 라이프사이클 소스(EntityForm.tsx:162-306·OnChangeEntityForm.ts·Config.ts)를 깊이 읽어 계약+갭을 모두 커버했으므로 공백 없음.
> - `new-engine-gap`(opus, 70k tok) — ✅ 신뢰(핵심). 7 갭 + 5 foundation. file:line 근거 다수. 스팟체크: form-store.ts:58-67 frozen seed·FieldRenderer.tsx:44-74 frozen meta read 확인.
> - `gjcu-usage`(sonnet, 86k tok) — ✅ 신뢰. 178 EntityForm.tsx, 빈도표, 77/178 onInitialize·55/178 onChanges. 후보폼 4종.
> - `daum-address`(sonnet, 87k tok) — ✅ 신뢰. `react-daum-postcode` 무키/무료 확인(root package.json ^3.1.3). 완전 reimpl 계획.

# E-트랙 Understand — 원자료 요약

## 1. 라이프사이클 갭 (new-engine-gap — 핵심)

신 엔진 보유(선언적): 값슬라이스·setValue(dirty)·hydrate(create→update)·validateField/All·reset/isDirty/toSaveData(M2O flatten)·**dependsOn 교차필드 cascade**(FieldRenderer.tsx:33-74, 순수 hidden/required/readonly 술어만)·renderType.

**미보유(명령형) — 7 갭**:
1. **META 반응성**(missing) — 렌더러가 frozen field에서 meta 읽음(FieldRenderer.tsx:44-74·default-renderers.tsx:150 field.options). mutate→리렌더 0. **FOUNDATION-1, 전부 차단.**
2. **onChanges cascade**(partial) — dependsOn은 값 set/옵션 swap/검증 파생 불가. 구: executeOnChanges(EntityForm.tsx:122)·OnChangeEntityForm.ts:76-361.
3. **onInitialize**(missing) — 구: EntityForm.tsx:162-306 initialize→onInitialize 루프(256-266)→동적필드 재바인딩(268-302)·OnInitializeFunc(Config.ts:463). 신: createFormStore frozen 동기 seed(form-store.ts:58-67).
4. **validate-on-change**(missing) — 구 FieldRenderer.tsx:97-101. 신 setValue는 값+dirty만.
5. **shouldReload/structure-version**(missing) — 구 EntityFormBase.tsx:75-76·useEntityFormLogic.ts:263-273.
6. **런타임 필드 add/remove**(missing) — 구 EntityForm.tsx:214-254 동적추가.
7. **onFetchData**(missing) — 구 EntityFormBase.tsx:113·Config.ts:459.

**Foundation 순서**: FOUNDATION-1(META 반응화)→2(onChanges cascade+OnChangeEntityForm 카탈로그)→3(initializeFormStore 파이프 fetch→onFetchData→onInitialize→build→hydrate→rebind)→4(add/remove+structure-version)→5(validate-on-change). **GATE**: 1~4 후 대량 필드 이식.

## 2. GJCU 사용 (gjcu-usage)

빈도(178폼 파일수): String243·M2O215·Select214·Number207·Bool111·Date58·SubColl55·Textarea48·Datetime40·Xref26·File21·CustomOption17·Tag11·Markdown11·Phone9·Password7·Month5·Email4·롱테일(~70 one-off 도메인 필드). 77/178 withOnInitialize·55/178 withOnChanges·withOptions 16회(전부 static/derived — 라이브 async 옵션 reload 사례 0).

후보 재현폼: **CollaboEntityForm**(packages/entities/Academic/Management, ~360줄, dynamic options·조건부 required/hidden·M2O nested 자동채움·file·address·submit transform·symmetric onInit/onChanges — 최고 cost/coverage) · **MajorEntityForm**(TAB-level hidden·self-ref tree M2O 상호배제·xref) · **GraduationReviewEntityForm**(custom withOnSave·role readonly·동적 옵션 pruning) · **StudentAddressEntityForm**(최저위험 주소 baseline, onInit/onChanges 0).

## 3. Daum 주소 (daum-address)

`react-daum-postcode`(default `DaumPostcode`==`DaumPostcodeEmbed`, Daum 호스팅 iframe 래핑, **무키·무료**). GJCU 사용: apps/student .../AddressForm.tsx(최소예)·apps/admission .../AgreementRequestForm.tsx(도로/지번 조합). 구엔진: src/listgrid/components/fields/address/{PostCodeSelector,AddressFieldView,AddressMapField,KakaoMap}.tsx + ApplyFullAddressFields.tsx. 반드시 client-side, 버튼→모달 게이팅.

onComplete 페이로드: `zonecode`(우편 5자리)·`roadAddress`/`jibunAddress`·`addressType`('R'/'J')·`sido`(state)·`sigungu`(city)·`bname`·`buildingName`. **상세주소(address2)는 Daum 미반환** → onComplete 후 사용자 입력. Kakao 지도(showMap)는 별개·Kakao 키 필요 → 연기.

reimpl(요약): schema-core `AddressField`(`exceptOnSave=true` 가상 composite → form-store 무변경) + `applyFullAddressFields`(flat 형제 필드에 required 부여, hydrate가 flat seed) · react `AddressRenderer`(형제 useFieldValue 읽기 + useUI 2단 모달 + `<DaumPostcode>` 직접 import + onComplete→형제별 store.setValue fan-out). 상세는 계획문서 Phase EB.

## 4. 필드 인벤토리 (30종)

전체 값형태·핵심동작·복잡도는 계획문서 §필드 인벤토리 표 참조. 카테고리: 트리비얼5(Checkbox·MappedJoin·MessageView·Month·Profile) · 모더릿12(Birthday·Color·ColorPreset·Html·Link·MultiSelect·Password·Qr·Tag·Telephone·Time·Year) · 복잡13(CustomOption·Datetime·File·Image·InlineMap·MultipleAsset·Rule·Xref×4·AddressMap·ContentAsset). 외부 npm 확인: qrcode.react(Qr)·@tabler/icons-react(File/Image/Link)·react-kakao-maps-sdk(지도 선택)·react-daum-postcode(주소).
