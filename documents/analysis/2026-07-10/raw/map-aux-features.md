> **[원자료 경고]** 2026-07-10 제로베이스 분석 워크플로우의 에이전트 산출물 원본이다. 일부 주장 심각도는 이후 적대적 검증에서 **정정**되었다 — 인용 전 반드시 [`../verification-log.md`](../verification-log.md)와 종합 보고서 [`../../2026-07-10-zero-base-review.md`](../../2026-07-10-zero-base-review.md)를 우선하라.

# 부가 기능 서브시스템 지도 + 비평 — transfer / misc / revision / api-spec / QR / address / xref-price / utils

대상 범위: `src/listgrid/transfer/**`, `src/listgrid/misc/**`, `src/listgrid/components/revision/**`,
`src/listgrid/components/api/**`, `src/excel.ts`, `src/qr.ts`, `src/address.ts`, `src/api-spec.ts`,
`src/xref-price.ts`, `src/listgrid/common/**`, `src/listgrid/components/helper/**`, `src/listgrid/utils/**`

---

## 1. 요약 판정

이 영역은 두 개의 서로 다른 시대(era)가 충돌하는 지점이다. 옵트인 서브패스(`excel.ts`, `qr.ts`,
`address.ts`, `api-spec.ts`, `xref-price.ts`)와 `registry.ts` DI 시임은 "무거운 선택적 peer를
메인 바렐에서 뽑아내고, host가 필요할 때만 등록한다"는 명확하고 잘 실행된 아키텍처다 — 실제로 이
부분은 라이브러리 설계로서 **잘 만들어졌다** (섹션 2 참고).

반면 `misc/index.ts`(539줄 grab-bag), `common/func.ts`, `ShowNotifications.tsx`, 그리고
`transfer/` 하위 UI 컴포넌트들은 여전히 "Next.js 호스트 앱에서 뜯어낸 조각"의 흔적이 짙다:
같은 유틸 함수(`isEquals`, `isEqualCollection`, `removeTrailingSeparator` 등)가 `misc/index.ts`와
`utils/CompareUtil.ts` / `utils/StringUtil.ts`에 **말 그대로 코드가 복사되어 두 곳에 존재**하고,
Excel export 경로는 옵트아웃 불가능한 방식으로 호스트 백엔드의 로깅 엔드포인트를 호출하며,
"framework-free"를 표방하면서도 `common/func.ts` 전체가 Tailwind 유틸리티 클래스 문자열을
런타임에 조립하는 코드로 채워져 있다 — 최신 `rcm-*` + `data-*` 시맨틱 클래스 체계와 공존하며
스타일링 전략이 파일마다 다르다.

`simpleCrypt.ts`는 `crypto-js`를 **필수(hard) 의존성**으로 끌어들이면서 실제로는 이미 의존성으로
있는 `uuid` 패키지를 두고 UUID v4를 직접 재구현하는 등, 의존성 관리가 산만하다.

---

## 2. 옵트인 서브패스 5종 — 이 레포에서 가장 잘 설계된 부분

`src/excel.ts`, `src/qr.ts`, `src/address.ts`, `src/api-spec.ts`, `src/xref-price.ts` 는 모두
동일한 패턴을 따른다: 무거운/선택적 peer(`xlsx-js-style`, `file-saver`, `qrcode.react`,
`react-kakao-maps-sdk`, `react-daum-postcode`, `sweetalert2`)를 메인 바렐에서 빼내
`peerDependenciesMeta.optional: true`로 선언하고, 각 서브패스 진입점의 주석에 "왜 뽑았는지"를
명시한다.

- `src/excel.ts:1-31` — 헤더 주석에서 "Bundles the xlsx-js-style / file-saver-backed... plus the
  one-line registerExcelDataTransfer()"라고 설명하고, 실제로 `registerExcelDataTransfer()`
  (`excel.ts:29-31`)가 `configureDataTransfer({ Exporter: DataExporter, Importer: DataImporter })`
  한 줄로 등록을 끝낸다.
- `src/listgrid/transfer/registry.ts:21-38` — `DataTransferComponents` 인터페이스 + 모듈 전역
  `_components` 변수로 만든 간단한 DI 컨테이너. 등록되지 않으면 "모달이 아무것도 렌더링하지 않는"
  graceful degradation (`registry.ts:36`) 방식이라 core가 excel peer 없이도 빌드/실행된다.
- `src/qr.ts`, `src/address.ts`, `src/api-spec.ts`, `src/xref-price.ts` 모두 "왜 이 파일이
  메인 바렐에 없는지"를 1급 주석으로 남겨 유지보수자가 실수로 되돌리지 않도록 방어한다
  (예: `src/address.ts:8-10` — `ApplyFullAddressFields`를 메인 바렐에 두면 안 되는 이유까지 설명).

**이 패턴 자체는 그대로 상용 라이브러리 기준으로 통과된다.** 다른 subsystem(폼, 필드)에도 이
패턴이 일관되게 적용되어 있는지는 이 리포트 범위 밖이지만, 최소한 여기서는 모범 사례다.

또한 `Provider/ExcelProvider.ts:39-69`의 `registerExcelCrypto()` / `mustOfficeCrypto()` 지연 로딩도
동일 철학의 연장이다: 비밀번호 보호 Excel 암호화(`officecrypto-tool`)가 필요 없는 host는 아무것도
설치하지 않아도 되고, 필요한 host만 `registerExcelCrypto(require('officecrypto-tool'))`을 호출한다
(미등록 시 명확한 에러 메시지, `ExcelProvider.ts:52-58`).

---

## 3. `misc/index.ts` 539줄 grab-bag 감사

파일 헤더(`misc/index.ts:1-9`)가 스스로 인정한다: "Stage 3c — miscellaneous utilities that the
original kit's root barrel provided. Ported to match the original semantics exactly..." — 즉
호스트 앱 루트 유틸 파일을 통째로 이식한 결과물이라는 점을 명시하고 있다. 내용물은:

| 영역 | 라인 | 원본 소스 명시 |
|---|---|---|
| 정규식 상수 (전화번호/비밀번호/이메일/한글이름 등) | `misc/index.ts:17-32` | validation.ts |
| 날짜 포맷터 (`fDate`, `fDateTime`, `fToNow`, `formatYearMonth`) | `misc/index.ts:49-147` | formatTime.ts |
| `formatPrice` | `misc/index.ts:150-168` | NumberUtil.ts |
| `isNulls`/`isEquals`/`isEqualCollection`/`isEmpty`/`isPositive`/`isNegative` | `misc/index.ts:171-241` | CompareUtil.ts |
| `normalizeUrl`, `removeTrailingSeparator` | `misc/index.ts:246-263` | RequestUtil.ts / StringUtil.ts |
| JSON `stringify`/`parse` (Map 리바이버 포함) | `misc/index.ts:266-307` | jsonUtils.ts |
| LocalStorage/SessionStorage 래퍼 | `misc/index.ts:312-417` | LocalStorageUtils.ts / SessionStorageUtil.ts |
| Asset 서버 URL 헬퍼 (`getAccessableAssetUrl` 등) | `misc/index.ts:419-498` | Server.ts |
| `getDefinedDates` (TODAY/WEEK/MONTH/...) | `misc/index.ts:503-527` | formatTime.ts |
| API 재노출 (`callExternalHttpRequest` 등) | `misc/index.ts:530` | `../api` |
| **의도적 레거시 플레이스홀더** `RequestUtil: any = {}`, `EntityError: any` | `misc/index.ts:533-537` | "consumers dereference fields on these dynamically" |

**핵심 문제 — `utils/`와의 완전 중복**: `misc/index.ts`의 `isNulls`/`isEquals`/`isEqualCollection`/
`isEmpty`/`isPositive`/`isNegative`(`misc/index.ts:171-241`)는 `utils/CompareUtil.ts:3-107`의
구현과 **로직이 100% 동일**하다(공백/주석 차이만 있음). `removeTrailingSeparator`도
`misc/index.ts:256-263`와 `utils/StringUtil.ts:170-183`가 동일 로직의 복사본이다. `isBlank`도
`misc/index.ts:44-46`에 로컬 `function isBlank`로 재정의되어 있고 `utils/StringUtil.ts:4-6`에도
동일하게 존재한다.

이건 "다른 API를 가진 유사 유틸"이 아니라 **한 로직이 두 파일에 물리적으로 복제**된 것이다.
한쪽을 고치면 다른 쪽은 그대로 남는 전형적인 유지보수 함정이며, 커밋 히스토리에서 실제로
버그가 한쪽만 고쳐지고 다른 쪽에 남을 위험이 매우 높다. `misc/index.test.ts:1-40`이
`isNulls`/`isEquals`/`isEqualCollection`/`isEmpty`/`isPositive`/`isNegative`를 `misc`에서
직접 import해 테스트하는 것으로 보아 두 벌 모두 "테스트로 지켜지는 공식 API"로 취급되고
있다 — 즉 의도적 이중화이지 죽은 코드가 아니다.

제품화 관점에서는 이 파일이 "original kit과의 100% 시맨틱 호환"을 위한 마이그레이션 브릿지임을
알 수 있지만, 신규 프로젝트 입장에서는 `misc`와 `utils` 중 어느 것이 "진짜" API인지 알 수 없고,
두 배 크기의 표면적을 학습해야 한다.

또한 `misc/index.ts:533-537`의 "intentional: legacy placeholders kept for API parity... consumers
dereference fields on these dynamically"라는 주석은 `RequestUtil`과 `EntityError`를 `any` 타입의
빈 객체/undefined로 방치한다는 뜻이다 — 즉 여기 의존하는 코드가 있다면 타입 체크 없이 런타임에서만
검증되는 시한폭탄이다. 실제 참조처가 남아있는지 확인 필요(이번 조사에서는 이 두 심볼을 참조하는
호출부를 찾지 못했으나, 존재 자체가 "안전하게 지울 수 없다"는 신호).

---

## 4. `common/func.ts` + `ShowNotifications.tsx` — "framework-free" 주장과 충돌하는 하드코딩된 Tailwind

`common/func.ts` 전체(383줄)가 사실상 Tailwind 유틸리티 클래스 문자열을 상태값에 따라 조립해
반환하는 함수 모음이다: `getAdditionalColorClass`(`func.ts:59-109`), `getTextColorClass`
(`func.ts:111-161`), `getOppositeTextColorClass`(`func.ts:163-213`), `getSizeClassName`
(`func.ts:347-368`), `getColorClass`(`func.ts:370-383`) 등. 예:

```ts
// common/func.ts:230-239
export function getBgColor(color: ColorType | AdditionalColorType | string): string {
  if (bgColorClasses[color as ColorType]) {
    return bgColorClasses[color as ColorType];
  }
  if (AdditionalColorTypes.includes(color as AdditionalColorType)) {
    return getAdditionalColorClass(color as AdditionalColorType);
  }
  const colorValue = color.startsWith('#') ? color.slice(1) : color;
  return `bg-[#${colorValue}]`;   // 런타임에 조립되는 Tailwind arbitrary-value 클래스
}
```

`bg-[#${colorValue}]` 처럼 런타임에 동적으로 조립되는 Tailwind 클래스는 Tailwind JIT 스캐너가
소스에서 정적으로 발견할 수 없는 패턴이라 **호스트 프로젝트의 Tailwind 설정에 safelist가 없으면
스타일이 통째로 빠질 수 있다.** 이 자체가 라이브러리를 "framework-free"라고 부를 수 없게 만드는
증거다 — 실제로는 Tailwind CSS가 정상 렌더링을 위한 암묵적 필수 요건이며, `package.json`에는
`tailwindcss`가 dependency도 peerDependency도 아니다(즉 문서화되지 않은 암묵적 요건).

`ShowNotifications.tsx`는 같은 문제를 더 노골적으로 보여준다:

```tsx
// components/helper/ShowNotifications.tsx:31-38
const bgColor =
  color !== undefined
    ? `bg-${color}-light`
    : isTrue(error) ? 'bg-danger-light' : 'bg-success-light';
const textColor =
  color !== undefined ? `text-${color}` : isTrue(error) ? 'text-danger' : 'text-success';
```

`` `bg-${color}-light` `` 는 임의 문자열 보간 클래스라 Tailwind JIT가 절대 감지할 수 없다
(safelist 필수). 그리고 같은 컴포넌트에서:

```tsx
// components/helper/ShowNotifications.tsx:90
<div dangerouslySetInnerHTML={{ __html: item.message }} />
```

메시지 문자열을 개행만 `<br />`로 치환(`ShowNotifications.tsx:49,57`)한 뒤 그대로
`dangerouslySetInnerHTML`에 꽂는다. `messages`가 서버 에러 메시지 등 신뢰할 수 없는 입력을
그대로 통과시키는 호출부가 하나라도 있으면 **저장형/반사형 XSS 벡터**가 된다. 라이브러리
차원에서 이스케이프를 강제하지 않고 "메시지는 host가 안전하게 넘겨야 한다"는 암묵적 계약에
의존하는 것은 상용 컴포넌트로서 위험하다.

이 두 파일은 다른 곳(`DataExporter.tsx`, `ExcelPasswordField.tsx` 등)에서 이미 정착된
`rcm-*` + `data-tone="info"` 시맨틱 클래스/데이터 속성 체계와 스타일링 철학이 완전히 다르다.
"UI와 로직이 스파게티처럼 섞여 있다"는 유지보수자의 불만은 최소한 이 지점에서는 **정확한
지적**이다: 같은 서브시스템 안에 신-구 두 개의 스타일링 패러다임이 공존한다.

---

## 5. `DataExportProcessor.tsx` / `DataImportProcessor.tsx` — 같은 기능인데 다른 스타일 체계

`transfer/DataExporter.tsx`는 `rcm-dialog-body`, `rcm-stack`, `rcm-notice[data-tone="info"]`,
`rcm-panel`, `rcm-action-bar`, `<Button data-variant="primary">`(`DataExporter.tsx:56-123`) 같은
시맨틱 클래스로 일관되게 작성되어 있는 반면, 바로 옆의 `DataExportProcessor.tsx`는:

```tsx
// transfer/DataExportProcessor.tsx:101, 123, 134, 153
<h1 className={'text-xl mb-2'}>...
<div className={'text-primary'}>...
<div className={'flex items-center justify-center space-x-2'}>...
```

원시 Tailwind 유틸리티 클래스를 그대로 사용한다. 같은 export 플로우 안에서 모달을 여는
컴포넌트(`DataExporter`)와 그 안에서 진행률을 보여주는 컴포넌트(`DataExportProcessor`)의
스타일링 규약이 다르다 — 리팩터링이 파일 단위로 멈췄다는 증거다.

`DataImportProcessor.tsx`에는 이전 마이그레이션의 잔해도 남아 있다:

```tsx
// transfer/DataImportProcessor.tsx:10-11
// CSS module removed in Stage 8 (host app supplies styling)
const classes: Record<string, string> = {};
```

이후 `className={classes.row}`, `className={classes.header}`(`DataImportProcessor.tsx:176,184,206,210`)
가 전부 `undefined`로 평가되는 죽은 참조다. 기능은 깨지지 않지만(className에 undefined는 무해),
"host app supplies styling"이라는 주석과 달리 실제로 host가 채워 넣을 훅(class 이름 상수 등)이
없다 — 그냥 빈 스텁으로 남아 리더를 혼란시킨다.

또한 `DataImportPreview`(`DataImportProcessor.tsx:169-228`)의 미리보기 테이블에는
`<Table border={1} borderColor={'#ff0'}>`(`DataImportProcessor.tsx:203`)처럼 밝은 노란색(#ff0)
테두리가 하드코딩되어 있다 — 디버깅용으로 넣었다가 지우지 않은 것으로 보이는 값이며, 실제
프로덕션 화면에 노출된다면 시각적으로 튀는 미완성 UI로 보일 것이다.

---

## 6. `DataImporter.tsx` — 파일 업로드 경로 2벌 복붙

`transfer/DataImporter.tsx`의 `onFileUpload`(`DataImporter.tsx:113-272`) 안에는 "사용자가 직접
업로드한 파일"(`File` 인스턴스, `DataImporter.tsx:121-191`) 처리 블록과 "서버에 이미 업로드된
파일(FileInfo)"(`DataImporter.tsx:192-270`) 처리 블록이 있는데, 두 블록은 `FileReader` vs
`fetch`로 바이트를 얻는 방식만 다르고 그 뒤:

- `XLSX.read` → `sheet_to_json`
- 필드 매칭 루프(`row.findIndex(...)`, `subStringBetween(cell, '[', ']')` 정규화)
- `buildSheetData` 호출과 동일한 에러 메시지 3종

이 **거의 70줄 분량 통째로 복제**되어 있다(`DataImporter.tsx:126-190` vs
`DataImporter.tsx:201-266`, 필드 매칭 로직만 놓고 봐도 `144-164`와 `219-239`가 문자 그대로 동일).
"엑셀 버퍼를 얻는 방법"과 "버퍼를 파싱해 필드에 매칭하는 방법"을 분리했다면 하나의 헬퍼로
합쳐질 수 있었던 코드다. 버그가 한쪽에서만 고쳐질 위험이 실제로 발생했을 가능성이 있다 — 주석에
남은 `gjcu #1478`(`DataImporter.tsx:36`), `gjcu #1479`(`DataImporter.tsx:275,456`) 이슈 번호들이
원래 호스트 프로젝트(Jira/GitHub 이슈 트래커로 추정)에서 순차적으로 패치된 흔적이며, 두 경로 중
하나에만 반영되고 다른 하나는 놓쳤을 여지가 있다(이번 리뷰에서 실제 diff 불일치는 발견하지
못했으나 구조 자체가 그 위험을 안고 있다).

---

## 7. Excel export의 옵트아웃 불가능한 호스트 로깅 호출

`Provider/ExcelProvider.ts:20-37`의 `logExcelDownload`는 `ExcelDownload()`(export 실행 함수) 성공
시 무조건 호출된다(`ExcelProvider.ts:214`, `248`):

```ts
// transfer/Provider/ExcelProvider.ts:28-33
const { callExternalHttpRequest } = await import('../../utils/RequestUtil');
await callExternalHttpRequest({
  url: getEndpoint('excelDownloadHistory'),
  method: 'POST',
  formData: { url, condition: conditionStr, usePassword },
});
```

`getEndpoint('excelDownloadHistory')`는 `RuntimeConfig.ts:79`에서 기본값
`'/excel-download-history/add'`로 설정되어 있고, `configureRuntime({ endpoints: {...} })`로
경로만 바꿀 수 있을 뿐 **"이 호출을 아예 하지 않는" 옵션이 없다.** 즉 host가 다운로드 이력
로깅용 백엔드를 갖고 있지 않다면, 모든 Excel export 시 알 수 없는 엔드포인트로 POST 요청이
나가고 (try/catch로 실패는 삼켜지지만 — `ExcelProvider.ts:34-36`) 네트워크 요청 자체는 항상
발생한다. 범용 라이브러리라면 `logExcelDownload`를 아예 no-op으로 만들 수 있는 스위치
(`endpoints.excelDownloadHistory = null` 등)나 `onExcelDownloaded` 콜백 형태의 훅으로 대체하는
편이 맞다 — 현재는 "원래 호스트 앱의 감사 로그 기능"이 제네릭 라이브러리 코드 경로에 조건 없이
박혀 있다.

---

## 8. `revision/RevisionField.tsx` — 특정 백엔드 스키마를 전제하는 "제네릭" 필드

`RevisionField`는 `getEndpoint('revisionApi')`(`RevisionField.tsx:145`, 기본값
`/revision`)로 리비전 목록을 가져오지만, 그 데이터 모델 자체가 특정 백엔드 계약을 강하게
전제한다:

```ts
// components/revision/RevisionField.tsx:116-123
interface Revision {
  id: string;
  createdAt: Date;
  createdBy: string;
  json: string;   // 값을 parsing 해서 EntityForm.setFetchValues 로 되돌릴 수 있는 JSON
  name: string;
  type?: string;  // RevisionType: CREATE, UPDATE, DELETE
}
```

또한 필터 조회 시 `revisionEntityId`라는 고정 필드명(`RevisionField.tsx:201-205`,
`.handleAndFilter('revisionEntityId', entityId)`)과 `revisionEntityName`(주석,
`RevisionField.tsx:200`: "revisionEntityName 필터 제거 - entityId만으로 조회") 등 호스트
백엔드의 리비전 테이블 컬럼명을 그대로 가정한다. `AUDIT_FIELD_NAMES`
(`RevisionField.tsx:19-27`, `updatedAt`/`dateUpdated`/`modifiedAt`/`dateModified`/
`lastModified`/`lastModifiedDate`/`auditable`)도 호스트 엔티티들의 감사 필드 네이밍 컨벤션을
하드코딩한 휴리스틱이다 — 다른 네이밍 컨벤션을 쓰는 신규 프로젝트에서는 diff 하이라이팅이
무의미해진다(항상 변경되는 필드가 걸러지지 않고 노출).

`apiUrlOverride`(`RevisionField.tsx:128,139-142`)로 URL만 바꿀 수 있고, 응답 페이로드 형태
(`Revision` 인터페이스, `revisionEntityId` 필터 키, audit 필드 이름 세트)는 오버라이드할
방법이 없다. 즉 "리비전 기능을 쓰려면 서버가 이 정확한 스키마를 구현해야 한다"는 제약이 라이브러리
코드에 고정되어 있다 — 필드/훅으로 주입 가능하게 만들지 않으면 이 기능은 사실상 원래 호스트
프로젝트 전용이다.

한편 `ViewEntityForm`을 재사용해 리비전 스냅샷을 읽기 전용으로 보여주는 방식
(`RevisionField.tsx:282-289`)이나, CSS 선택자 주입으로 변경 필드를 하이라이트하는
`RevisionDiffWrapper`(`RevisionField.tsx:50-114`, `<style>` 태그에 동적 셀렉터 목록을 넣는
기법)는 아이디어 자체는 실용적이다 — 다만 후자는 매 렌더마다 `<style>` 문자열을 재생성하는
방식이라 필드 수가 매우 많은 폼에서는 CSSOM 재계산 비용이 커질 수 있다(성능 이슈로 실측하진
않았으나 구조적으로 확장성이 낮다).

---

## 9. `components/api/*` — API 스펙 뷰어: 작지만 스타일 불일치의 축소판

`ViewApiSpecification.tsx`(`api/ViewApiSpecification.tsx:1-46`)는 `Tooltip`/`rcm-api-spec-*`
같은 목록형 클래스와 `flex items-center space-x-2`, `w-[24px] h-[24px]`
(`ViewApiSpecification.tsx:50,60`) 같은 원시 Tailwind가 한 컴포넌트 안에서 섞여 있다.
`ApiSpecificationButton.tsx:18`도 `'btn-outline-info rounded-full w-[24px] h-[24px]'`라는
호스트 프로젝트의 커스텀 유틸리티 클래스(`btn-outline-info`)를 그대로 갖고 있다 — 이 클래스가
라이브러리 CSS에 정의되어 있는지 확인이 필요하며, 정의되어 있지 않다면 host의 전역 CSS에
의존하는 숨은 결합이다.

기능 자체(개발자가 API 스펙+응답 예시를 모달로 보고 클립보드 복사)는 개발/QA용 디버그 도구로는
합리적이지만, "커머셜 라이브러리의 1급 export"로 보기엔 애매하다 — `sweetalert2` peer를
토스트 메시지 하나(`ViewApiSpecification.tsx:77-89`, 클립보드 복사 성공/실패 알림) 때문에
요구한다. `Type.ts`의 타입가드 `isApiSpecification`(`api/Type.ts:29-37`)은 잘 만들어져 있다.

---

## 10. QR / Address / Xref-Price 서브패스 — 서브패스 패턴은 좋으나 내부 재사용성은 확인 못함

`src/qr.ts`, `src/address.ts`, `src/xref-price.ts` 자체는 섹션 2에서 다룬 것처럼 옵트인
분리가 깔끔하다. 다만 이번 조사 범위(`transfer/misc/revision/api/common/helper/utils`)에서는
`AddressMapField`/`KakaoMap`/`XrefPriceMappingField`의 **내부 구현**을 깊게 보지 않았다 —
`address.ts:8-10`의 주석("`ApplyFullAddressFields`가 `AddressMapField`를 정적으로 인스턴스화하므로
메인 바렐에 두면 peer가 딸려온다")으로 미루어 보아 이 서브패스들도 동일한 DI 원칙을 따르고
있을 개연성이 높지만, `XrefPriceMappingField`/`AddressMapField`가 host 특화 API 계약(가격
매핑 테이블 스키마, 카카오맵 좌표계 등)을 얼마나 하드코딩하는지는 별도 조사가 필요하다 —
이 리포트에서는 확정적 결론을 내리지 않는다.

`XrefPiceMappingView.tsx`의 오탈자 리네임(`XrefPriceMappingView as XrefPiceMappingView`,
`xref-price.ts:10`)은 사소하지만 공개 API 이름에 오탈자가 그대로 노출되어 있다 — 한번
공개되면(semver) 되돌리기 어려운 API 흠집이다.

---

## 11. `utils/` 중복 감사 — `classNames.ts` vs `cn.ts`, `StringUtil` vs `CompareUtil`, `simpleCrypt`

### 11.1 `cn.ts` vs `classNames.ts` — 중복이 아니라 계층화, 문제 없음

`utils/cn.ts:14-16`은 `clsx` + `tailwind-merge`로 만든 범용 클래스 병합 함수이고,
`utils/classNames.ts:19-22`(`mergeSlot`)와 `classNames.ts:28-39`(`resolveSlots`)는 그 위에
"컴포넌트 slot 오버라이드 맵" 개념을 얹은 상위 헬퍼다(`mergeSlot`이 내부적으로 `cn`을 호출,
`classNames.ts:1,21`). 이건 중복이 아니라 정상적인 계층 구조다 — 다만 이름이 `classNames.ts`인
파일이 `ClassNamesMap`이라는 host 대면 API 타입을 정의하면서 정작 파일명이 브라우저
`classnames` 패키지/개념과 헷갈리기 쉬워 신규 기여자가 `cn.ts`와 혼동할 여지는 있다(사소함,
low).

### 11.2 `StringUtil.ts` vs `misc/index.ts` — 진짜 중복 (섹션 3과 동일 사안)

`utils/StringUtil.ts:170-183`의 `removeTrailingSeparator`와 `misc/index.ts:256-263`의 동일
이름 함수는 로직이 동일하다. `utils/CompareUtil.ts` 전체(107줄)가 `misc/index.ts:171-241`에
그대로 재구현되어 있다 — 섹션 3에서 이미 다뤘으므로 여기서는 "utils 내부 자체 중복"이 아니라
"utils ↔ misc 간 파일 단위 중복"임을 재확인한다.

### 11.3 `simpleCrypt.ts` — crypto-js 하드 의존성 + `uuid` 패키지 사장(死藏)

`package.json`의 `dependencies`(런타임 필수, peer 아님)에 `crypto-js: ^4.2.0`과 `uuid: ^9.0.0`이
**동시에** 들어 있다(`package.json:` dependencies 블록). 그런데:

- `utils/simpleCrypt.ts:1,13-30`은 AES 암/복호화(`encrypt`/`decrypt`)와 SHA256 해시
  (`hash`, `simpleCrypt.ts:32-46`)에 `crypto-js`를 쓴다 — 이건 정당하다(암호화가 목적이므로).
- 하지만 `generateUUID()`(`simpleCrypt.ts:48-94`, 47줄)는 **UUID v4를 처음부터 손으로
  재구현**한다: `crypto-js`의 `WordArray.random(16)`으로 난수를 얻은 뒤, 바이트 배열로 변환하고,
  버전/베리언트 비트를 수동 조작하고, hex 룩업 테이블을 만들어 문자열을 조립한다
  (`simpleCrypt.ts:52-93`). 이미 `dependencies`에 있는 `uuid` 패키지의 `v4()` 한 줄로 대체
  가능한 기능을, 굳이 `crypto-js`의 WordArray API를 빌려 47줄짜리 수제 구현으로 만든 것이다.
  실제 사용처(`AdvancedSearchForm.tsx:15,65,185,196`, `XrefPiceMappingView.tsx:26,281`)는 모두
  "리스트 캐시 키 리셋용 랜덤 문자열"이 필요한 것뿐이라 RFC 4122 준수 UUID일 필요조차 없다.
  → **`uuid` 의존성이 `SearchForm.ts`/`EntireChecker.tsx`에서만 쓰이고 `simpleCrypt`는 이를
  무시하고 있다**(`grep` 결과: `from 'uuid'`는 `form/SearchForm.ts`, `list/ui/EntireChecker.tsx`
  단 두 곳). 두 개의 UUID 생성 경로가 공존하는 것 자체가 불필요한 복잡도다.

- 하드코딩된 폴백 시크릿: `simpleCrypt.ts:9-11`

  ```ts
  function secretKey(): string {
    return getRuntimeConfig().cryptKey || 'rcm-token-secret';
  }
  ```

  host가 `configureRuntime({ cryptKey: ... })`을 호출하지 않으면 **모든 설치본에서 동일한
  고정 문자열**(`'rcm-token-secret'`)이 AES 키로 쓰인다. 오픈소스로 배포되는 npm 패키지의
  소스코드에 폴백 시크릿이 하드코딩되어 있다는 것은 곧 공개된 키라는 뜻이다 — `encrypt`/`decrypt`
  가 실제로 민감한 데이터(세션 토큰, PII 등)를 보호하는 용도로 쓰인다면 이 폴백값에 의존하는
  host는 사실상 평문과 다를 바 없는 "암호화"를 하고 있는 셈이다. 라이브러리 차원에서는 최소한
  `cryptKey`가 설정되지 않았을 때 콘솔 경고를 내거나, 프로덕션 빌드에서 폴백을 거부하는 안전장치가
  없다.

- `compress`/`decompress` 매개변수가 죽은 파라미터다: `encrypt(input, compress?)`
  (`simpleCrypt.ts:13`)와 `decrypt(ciphertext, decompress?)`(`simpleCrypt.ts:22`) 모두
  `if (isTrue(compress)) { }` / `if (isTrue(decompress)) { }`처럼 **빈 블록**이다
  (`simpleCrypt.ts:16-17`, `25-26`). 압축 기능이 있는 것처럼 시그니처만 남아 있고 실제 구현은
  없다 — 호출부가 `compress: true`를 넘겨도 아무 일도 일어나지 않는다는 것을 호출자가 알 방법이
  타입 시그니처만으로는 없다.

**crypto-js를 하드 의존성으로 둘 근거는 있는가?** — 있다: `RevisionField`류가 아니라 세션/토큰
암호화 등 라이브러리 핵심 기능(`utils/index.ts:11`에서 barrel로도 재노출)에 실제로 쓰이므로
optional peer로 내리기는 어렵다. 다만 `crypto-js`는 번들 크기가 크고(전체 알고리즘 모음을
가져옴), 실제 사용은 AES + SHA256 + 랜덤 바이트 3가지뿐이다 — Web Crypto API(`crypto.subtle`)나
더 가벼운 특화 패키지로 대체하면 번들 크기를 줄일 여지가 있다(구체적 대체 필요성은 "generateUUID를
crypto-js로 구현하는 것" 정도의 낭비를 줄이는 수준에서는 확실히 있다).

---

## 12. 강점으로 인정할 부분 (공정성)

- **서브패스 DI 패턴**(섹션 2) — `registry.ts` + `configureXxx()` 시임은 이 리포지토리
  전체에서 본 것 중 가장 견고한 "opt-in peer" 아키텍처다.
- **`RuntimeConfig.ts`의 `endpoints`/`permissions` 레지스트리**(`RuntimeConfig.ts:21-54`) —
  "Stage 9 host-coupling detox"라는 주석대로, 하드코딩된 프로젝트 리터럴을 오버라이드 가능한
  네임드 엔드포인트로 뽑아낸 리팩터링 자체는 방향이 맞다. 다만 `excelDownloadHistory`처럼
  "완전히 끌 수 있는 옵션"이 없는 사례가 남아 있다(섹션 7).
  ㆍ참고: 신규 프로젝트에서 이 시스템을 실제로 배선하려면 어떤 엔드포인트가 필수/선택인지,
  적용 순서(부트스트랩 타이밍)는 무엇인지 실전 절차서가 필요하다 — 이는 코드 자체의 결함이라기보다
  "온보딩 문서 부재"로 이번 크로스커팅 이슈 목록에 반영해야 할 사안이다.
- **Excel export의 비밀번호 보호 지연 로딩**(섹션 2) — `officecrypto-tool`을 optional로 유지하면서
  Node Buffer 폴리필 부재/미등록 상태를 명확한 에러로 안내하는 방식(`ExcelProvider.ts:43-69`)은
  프로덕션 라이브러리다운 방어적 설계다.
- **`getRangeDateValue`/`getImportedRangeDateValue`류의 왕복 변환 함수**(`transfer/Type.ts:747-815`)
  — 배열/구분자(`~`, `,`, `' ~ '`) 3종을 모두 관용적으로 처리해 실제 엑셀 사용자가 수기로 편집한
  날짜 범위 셀도 최대한 살리려는 실전 대응이 보인다.

---

## 13. 종합 — 제네릭 라이브러리 자격 판정 (요청 포커스 질문에 대한 답)

| 대상 | 판정 | 근거 |
|---|---|---|
| Excel 옵트인 서브패스 + registry DI | **제네릭 라이브러리 자격 있음** | 섹션 2, 다만 `logExcelDownload` 무조건 호출(섹션 7)은 옵트아웃 스위치 추가 필요 |
| Revision 이력 | **호스트 앱 잔재 — 재설계 필요** | `Revision` 인터페이스, `revisionEntityId` 필터 키, `AUDIT_FIELD_NAMES` 휴리스틱이 특정 백엔드 스키마를 전제(섹션 8) |
| API 스펙 뷰어 | **디버그 도구 수준, 1급 기능 아님** | 스타일 불일치 + host 커스텀 클래스 의존(섹션 9), sweetalert2 peer 대비 기능이 얇음 |
| QR/Address/Xref-Price 서브패스 | **패턴은 합격, 내부 구현 재조사 필요** | 섹션 10 — 이번 범위에서 필드 내부까지는 못 봄 |
| `misc/index.ts` | **당장 host 이관에는 쓸 수 있으나 신규 프로젝트엔 부적합한 grab-bag** | `utils/`와 100% 중복되는 함수 다수(섹션 3), 죽은 레거시 플레이스홀더 존재 |
| `utils/simpleCrypt.ts` + crypto-js | **핵심 기능은 유지, UUID 재구현은 제거 대상** | 하드코딩 폴백 시크릿(보안 리스크), 빈 압축 파라미터, `uuid` 패키지 사장(섹션 11.3) |
| `common/func.ts` / `ShowNotifications.tsx` | **"framework-free" 주장과 모순, 리팩터링 필요** | Tailwind 런타임 클래스 조립 + `dangerouslySetInnerHTML` XSS 위험(섹션 4) |

**한 줄 결론**: 옵트인 서브패스/registry 계층은 상용화 기반으로 써도 좋을 만큼 잘 설계되어
있지만, 그 아래에 깔린 `misc`/`common`/`ShowNotifications`/`RevisionField`/`simpleCrypt`는
호스트 앱에서 도려낸 조직이 아직 라이브러리의 결합조직으로 온전히 치환되지 않은 상태다 —
"복사됐지만 아직 추상화되지 않은 코드"가 이 서브시스템의 정체다.
