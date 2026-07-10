# EA-C 업로드 필드 스카우트 브리핑 — File/Image/MultipleAsset (+ContentAsset 연기 판정)

> **생성 주체**: 3-리포 횡단 read-only 스카우트(sonnet, 2026-07-11 — rcm-listgrid v0.4 / edustack / gjcu-academic-backend). 인용은 이식 에이전트가 원본 재확인 필수. 백엔드 계약 일부는 로컬 Maven 캐시 sources jar에서 추출(provenance 명시됨).
> **Conductor 확정 결정**: ① **값 shape = plain `string`(단일)/`string[]`(다중, File·Image)** — FileFieldValue envelope 이식 금지(신엔진 타입-불가지 isBlank/isDirty와 정면충돌 → required 조용히 파손; edustack 실동작·gjcu 백엔드 최종 저장형과도 일치). 명시적 다운그레이드로 기록. ② **업로드 seam = 신설 `UIComponents.FileInput` 슬롯** — 구엔진 실제 패턴 parity(업로드 HTTP는 호스트 주입 UI 컴포넌트가 소유; gjcu-front의 747줄 FileUploadInput이 실증). ui-default 폴백 = URL 직접 입력 필드 + optional `onUpload(file)=>Promise<{url}>` 미주입 시 파일선택 비활성(edustack 오늘 동작 일치). BackendAdapter 비확장. RuntimeConfig `assetUpload` 죽은 컨벤션 미계승. ③ **ContentAsset 연기** — 실사용 0건(양 소비자 전수 grep)·업로드 영구 스텁(`// TODO` + README 자인)·useModalManagerStore 부재·"child EntityForm+FileField" 실전 대체 패턴 존재. §Needs Review 기록. ④ **MultipleAsset 값 = `AssetItem[]`**(`{name?,description?,url,primary?}`) — 구 `MultipleAssetForm{assets,preferred}` 래퍼 제거(빈 배열=blank, EA-B1 정규화 정합), 구 preferred 슬롯명 → per-item `primary` 플래그(semantics 동등). deviation 기록. ⑤ Image는 기존 `'image'` FieldType 사용(구엔진의 'file' 재사용 결함 미계승); 썸네일 bare `<img>`+확대 모달 디스코프(Profile 선례); 구엔진의 느슨한 required(override 부재)는 plain string 값으로 자연 치유 — 기록. ⑥ 외부URL 바이패스(`isExternalUrl`)는 schema-core util로 이식(File·Image 공유). ⑦ 리스트 셀 렌더 전역 연기 유지.

---

## PART A — 구엔진 업로드 기계

### FileField (`src/listgrid/components/fields/FileField.tsx:41-281`)
- 생성자 `super(name, order, 'file')`(:45). 빌더 `withConfig/withMaxSize/withMaxCount/withExtensions/withFileTypes`(:49-92, `IAssetConfig{maxSize?,maxCount?,extensions?,fileTypes?}` Config.ts:406-411).
- **외부 URL 바이패스**: `pickExternalUrl()`(:27-39) — 값이 http(s):// 절대 URL이면(`isExternalUrl`, misc/index.ts:486-490) asset 서버 우회, 다운로드 링크 렌더(:101-113).
- isBlank override(:216-242): envelope 내부 URL 전수 판독. isDirty override(:244-280): FileFieldValue.isDirty() 위임. → **plain string 값 채택으로 양쪽 다 신엔진 제네릭 로직이 정확히 대체**(이식 불요).
- `FileFieldValue`(`ui/UIProvider.tsx:227-388`): `{existFiles,newFiles,deleteFiles: FileInfo[]}`, `FileInfo{url,id,deleteType?,fileSize?,fileName?}` — **이식 안 함(결정 ①)**.

### ImageField (`ImageField.tsx:69-309`)
- 생성자 **`super(name, order, 'file')`** — FileField와 동일 타입 재사용(구 결함; 신엔진은 `'image'` 사용, 결정 ⑤). `withPreviewSize`(:93-96). config 미지정 시 image whitelist 기본값(:143-160). 값 있으면 썸네일+확대모달(`view/ImageFieldFormPreview.tsx`). no-image 폴백 `getEndpoint('noImageFallback')`(기본 `/assets/images/no-image.png`). **isBlank/isDirty override 없음**(구엔진 자체의 비일관 — plain string 값으로 자연 정합).

### MultipleAssetField (`MultipleAssetField.tsx:27-67` + `MultipleAssetFieldView:101-407` + `view/MultipleAssetUpload.tsx:1-63`)
- `super(name, order, 'custom')`(:33) → **신규 `'multipleAsset'` FieldType 필요**(이 배치 유일의 타입 추가). 생성자 `tags?/fileTypes?`, 체이닝 빌더 없음.
- View: named-slot 그리드(`tags` prop 고정 슬롯, 'Primary' 특별취급 :165,183-210), 슬롯 클릭→Modal add/edit(:283-404), 슬롯명 정규식 검증(`RegexLowerEnglishNumber` 소문자+숫자, :309-326, 한글 문구 하드코딩). Modal은 **로컬 useState**(:102-150 — 전역 store 아님). 업로드는 다이얼로그 내 `MultipleAssetUpload`가 호스트 FileUploadInput 감싸 **plain url로 스쿼시**(:36-45).
- named-slot UX는 이 필드의 존재 이유 — 단순화 금지, 충실 이식(값 shape만 결정 ④로 변경).

### 업로드 HTTP의 실제 위치 (seam 근거)
- `FileUploadInput`은 호스트 주입 UI 슬롯(`UIProvider.tsx:29,36,177,184` makeWrapper만) — 라이브러리 구현 없음, headless stub은 fetch 없는 `<input type="file">`(:259-261,277).
- `RuntimeConfig.assetUpload='/asset/upload-file'`(:77-88)은 **리포 내 소비 0건**(순수 네이밍) — gjcu-front 실구현조차 자체 `getServerUrl()` 하드코딩으로 우회.
- gjcu-front 실구현(`packages/ui/form/FileUploadInput.tsx`, 747줄): 파일 선택 즉시 업로드(폼 저장 시점 아님) — NFC 정규화→`FormData('file')`→`fetch POST`→raw JSON `{id,name,url,...}`→`addNewValue`. 삭제는 클라이언트 로컬, 서버 처리는 저장 요청에 envelope 실릴 때. 같은 fetch-POST-multipart 패턴이 호스트에서 **8곳+ 독립 재구현**(FileField 표현력 한계 우회 증거).

## PART B — 소비자·백엔드 (요지)

- **edustack**: 4필드 사용 **0건**(전수 grep). URL성 도메인 필드 전부 plain StringField. 자체 FileUploadInput shim도 fetch 없는 passthrough.
- **gjcu-academic-front**(0.2.29): FileField 21파일·ImageField 7·MultipleAsset 2(동적 커스텀필드 팩토리)·ContentAsset **0**. 실전 다문서 패턴 = "Asset행마다 child EntityForm + 단일 FileField"(TuitionRefundAssetEntityForm.tsx:1-41).
- **백엔드**: `POST /asset/upload-file`(AssetManageController.java:123-134) multipart `file` → raw JSON `{id,name,url,mimeType,fileSize,assetType,error}`. 정적 서빙 `/static-resource/**`. envelope `{existFiles,newFiles,deleteFiles}`는 wire format으로 왕복하고 **서버가 평탄화**(TuitionRefundAsset.create의 getFirstNewAssetUrl) — 단순 케이스는 클라이언트(AssetFileUpload.tsx)가 스쿼시. 도메인 Asset 엔티티 최종 저장형 = plain `assetUrl` 컬럼.

## PART C — seam 판정 근거 (결정 ①②에 반영됨)

구엔진 대응 실체: 업로드는 UI 슬롯 소유(옵션2의 UI-슬롯 변형), 값의 최종 수렴형은 plain URL(옵션3). BackendAdapter 확장(옵션1)은 구엔진 대응 없음+계약 최소주의 위반. **FileFieldValue envelope 이식 시 신엔진 제네릭 isBlank가 `{existFiles:[],...}`를 non-blank 오판 → withRequired 조용히 파손** — plain string/string[]이 구현·소비자·purity 3중 정합.

## PART D — 이식 표 (fan-out 3종)

### File
- 값: `string`(maxCount≤1) / `string[]`(다중 — maxCount로 결정, 구 IAssetConfig parity). base 없음.
- builders: `withConfig/withMaxSize/withMaxCount/withExtensions/withFileTypes`(props object-arg 컨벤션). validate: base required-blank(plain 값으로 정상 동작).
- renderer: 신설 FileInput 슬롯(EA-C0) 사용 — 값 표시(다운로드 링크/파일명)+제거+추가. 외부URL이면 링크만(바이패스, isExternalUrl — EA-C0 util). 신규 파일: `schema-core/src/field/file-field.ts` · `react/src/registry/file-renderer.tsx` · 테스트 2.

### Image
- 값: File과 동일. `'image'` 기존 타입. builders: File 동일 + `withPreviewSize`. config 미지정 시 image whitelist 기본값(:143-160 이식).
- renderer: FileInput 슬롯 공유 + bare `<img>` 썸네일(previewSize 반영), 값 없으면 no-image 처리(신엔진에 RuntimeConfig 없음 — 단순 placeholder 텍스트/빈 상태로, deviation 기록). 확대 모달 디스코프.
- 신규 파일: `schema-core/src/field/image-field.ts` · `react/src/registry/image-renderer.tsx` · 테스트 2.

### MultipleAsset
- 값: **`AssetItem[]`** = `{name?,description?,url,primary?}`(결정 ④ — 구 MultipleAssetForm 래퍼 제거·preferred→primary 플래그). `'multipleAsset'` 타입(EA-C0). 생성자 `tags?/fileTypes?` parity(+체이닝 빌더 없음 유지, static create 드롭 관례).
- renderer: named-slot 그리드+Modal(기존 프리미티브) add/edit+슬롯명 정규식 검증(한글 문구 충실)+'Primary' 특별취급+per-item FileInput. 이 배치 UI 최대 — 자기 렌더러 파일 내 완결.
- 신규 파일: `schema-core/src/field/multiple-asset-field.ts` · `react/src/registry/multiple-asset-renderer.tsx` · 테스트 2+(slot add/remove/modal 왕복 커버).

### ContentAsset — 연기 (결정 ③, 재론 시 이 근거 참조)
실사용 0(양 소비자)·업로드 영구 스텁(useContentAsset.ts:171-206 `// TODO`+README:145-149 자인)·useModalManagerStore 부재·실전 대체 패턴 존재(child EntityForm+FileField). 강행 시 이식이 아니라 net-new 설계(업로드 배선+모달 재작성). `validateContentAssets`(:39-78 순수)와 `ContentAsset{id?,title,content?,assetUrl}` shape는 포터블 — 필요해지면 그때.

## PART E — EA-C0 pre-stage 스코프 (공유 선행물)

1. **`UIComponents.FileInput` 슬롯 + ui-default 구현**: props `{ id, value?: string, onChange(url: string|undefined), onUpload?: (file: File)=>Promise<{url: string}>, accept?, maxSize?, readOnly?, ariaLabel?, required/invalid/describedBy a11y }` — ui-default 폴백: URL 텍스트 입력 + (onUpload 주입 시) `<input type="file">`로 선택→onUpload→onChange(url), 미주입 시 파일선택 비노출. 진행률/드롭존 등 고급 UX는 호스트 오버라이드 영역(Profile 선례).
2. **FieldType `'multipleAsset'` 추가**('file'/'image'/'contentAsset'은 기존재).
3. **`isExternalUrl`**(구 misc/index.ts:486-490) → schema-core util 이식(+테스트).
4. **`AssetConfig` 공유 타입**(`{maxSize?,maxCount?,extensions?,fileTypes?}`) — schema-core, File/Image 공유.

단일소비 인라인: Image 썸네일·MultipleAsset 그리드/검증. 연기: ContentAsset·리스트 셀·실업로드 HTTP(호스트 위임).
