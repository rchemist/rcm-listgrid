> **[원자료 경고]** 2026-07-10 제로베이스 분석 워크플로우의 에이전트 산출물 원본이다. 일부 주장 심각도는 이후 적대적 검증에서 **정정**되었다 — 인용 전 반드시 [`../verification-log.md`](../verification-log.md)와 종합 보고서 [`../../2026-07-10-zero-base-review.md`](../../2026-07-10-zero-base-review.md)를 우선하라.

# 서브시스템 지도+비평: 필드 카탈로그 (40+ 필드 타입)

**스코프**: `src/listgrid/components/fields/**` (abstract/, view/, filter/, rule/, address/, contentasset/), `src/listgrid/form/TagsInput/**`, `src/listgrid/validations/**`
**총 규모**: fields/ 디렉토리만 약 14,213 LOC (view/ 하위 포함), 필드 클래스 약 40여개 + view 렌더러 약 20여개

---

## 1. 요약 판정

필드 카탈로그는 **추상 클래스 계층 설계는 준수하지만(빌더 패턴 자체는 잘 만들어짐), 카탈로그 안에 호스트 프로젝트(학원/교육 CRM + 이커머스성 "오퍼/주문" 도메인)의 비즈니스 로직과 한국 로컬 서비스(카카오맵, 다음 우편번호, SMS 발송)가 필드 클래스 레벨에 직접 하드코딩되어 있다.** 이 때문에 "범용 CRUD UI 엔진"이라는 표방과 달리, 실제로는 특정 서비스의 필드 세트를 클래스로 그대로 옮겨놓은 것에 가깝다. 또한 검증(validation) 헬퍼 함수에 연산자 우선순위 버그가 있어 **update 모드에서 숫자 min/max 검증이 사용자가 입력한 새 값이 아니라 서버에서 가져온 원래 값을 검사하는** 실질적 버그가 존재한다. `DatetimeField` 는 자신의 필드 타입을 `'datetime'`이 아니라 `'date'`로 등록해 Excel import/export 변환 로직이 조용히 잘못된 브랜치를 타는 버그도 있다.

---

## 2. 상속 계층 품질 (FormField → Abstract* → concrete)

### 2.1 계층 구조 자체는 합리적

`FormField` (`src/listgrid/components/fields/abstract/FormField.tsx:163`) 는 제네릭 `TSelf extends FormField<TSelf,...>` self-referencing 타입으로 fluent builder(`withLabel`, `withRequired`, ...)와 `clone()`/`copyFields()` 를 통한 불변 복제를 잘 캡슐화했다. `render()` → `renderInstance()`(추상 메서드) 분리, `viewValue()` → `renderViewInstance()` 분리 패턴은 템플릿 메서드 패턴으로 일관성 있게 적용됐다(`FormField.tsx:483-511`, `234-270`).

`isDirty()` (`FormField.tsx:542-590`) 은 create/update 모드별 분기와 배열/객체 비교까지 처리하는 등 세심하게 설계됐고, `normalizeEmptyValue()` 헬퍼로 빈 문자열/빈 객체를 undefined로 정규화하는 것도 실무에서 자주 터지는 엣지케이스를 미리 처리한 흔적이다.

계층은 `FormField → ListableFormField → OptionalField → MultipleOptionalField` 순으로 리스트 지원, 옵션 지원, 다중 선택 지원을 단계적으로 추가하는 믹스인에 가까운 구조이며, `AbstractDateField`, `AbstractManyToOneField`, `CheckButtonValidationField` 는 FormField/ListableFormField를 바로 상속하는 병렬 분기다. 즉 계층이 트리가 아니라 "필요한 조합마다 새 abstract 클래스"에 가까운데, 실제 조합 수가 적어 큰 문제는 아니다.

**강점으로 인정**: `ListableFormField.viewValue`가 `renderListItemInstance()` 로직을 재사용하도록 오버라이드된 것(`ListableFormField.tsx:247-266`)은 "목록 표시"와 "상세 View 표시"의 포맷을 한 곳에서 유지하게 해주는 좋은 설계이며, 실제로 중복을 줄인 사례다.

### 2.2 새 필드 타입을 추가하려면 몇 곳을 고쳐야 하는가

`FieldType` 유니온(`src/listgrid/config/Config.ts:12-38`)에 문자열 리터럴을 추가하는 것 외에, `field.type === '...'` 형태의 하드코드 분기가 다음 14개 파일에 흩어져 있다(`grep -rn "\.type === '"`):

- `form/SearchForm.ts`, `config/ListGrid.ts`, `config/OnChangeEntityForm.ts`, `transfer/Type.ts`, `components/form/ui/AlertItem.tsx`, `components/list/hooks/useQuickSearchBar.ts`, `components/fields/abstract/ListableFormField.tsx`, `components/fields/abstract/OptionalField.tsx`, `components/fields/abstract/FormField.tsx`, `components/fields/rule/Type.ts`, `components/fields/rule/RuleCondition.tsx`, `components/fields/rule/RuleBasedFieldView.tsx`, `components/fields/rule/RuleBasedSelector.tsx`, `components/revision/RevisionField.tsx`

예: `FormField.tsx:391` `if (this.type === 'manyToOne' && value && typeof value === 'object')` — ManyToOne의 "빈 객체→undefined" 처리가 상위 추상 클래스에 타입 문자열 분기로 박혀 있다. 이건 OOP상 `ManyToOneField`가 `getDisplayValue`를 오버라이드해서 처리해야 할 로직이 베이스 클래스에 새어 들어온 것이다. 새 필드 타입이 "select류/date류/manyToOne류"와 조금이라도 다른 특수 동작이 필요하면, 클래스 자체 구현 외에 이 14개 파일 중 관련된 곳을 찾아 분기를 추가해야 한다 — **다형성이 아니라 문자열 스위치 기반 확장**이라 실수로 한 곳을 빠뜨리기 쉬운 구조다. `FULL_WIDTH_FIELD_TYPES` (`FormField.tsx:96-110`) 배열도 별도로 유지보수해야 하는 추가 지점이다.

---

## 3. view/ 렌더러 vs 필드 클래스 분리 — 일관성 없음

`components/fields/view/*.tsx` 20개 파일이 존재하지만 분리 기준이 필드마다 다르다:

- **완전 분리**: `ManyToOneField.tsx` 는 렌더링을 `ManyToOneView`/`CardManyToOneView`/`SelectBoxManyToOneView`/`ManyToOneListView`/`ManyToOneMultiFilterView` 5개 view 컴포넌트로 위임한다(`ManyToOneField.tsx:16-22`). Xref 계열(`XrefMappingField`, `XrefPreferMappingField`, `XrefPriceMappingField`, `XrefAvailableDateMappingField`)도 각각 `view/XrefXxxView.tsx`에 위임한다.
- **분리 안 됨**: `DateField`, `SelectField`, `MultiSelectField`, `CustomOptionField` 는 JSX를 필드 클래스 내부(`renderInstance`)에 직접 작성한다. `SelectField.tsx` 는 644줄짜리 파일에 상태 변경 사유 모달 열기, 즉시 변경(PUT 직접 호출), Badge 색상 매핑까지 필드 클래스 안에 다 들어있다(§4.1 참조).

즉 "필드 클래스는 설정/오케스트레이션만, view/는 렌더링만"이라는 원칙이 팀 컨벤션으로 굳어지지 못했고, 어떤 필드가 view/로 분리되는지는 작성자의 그때그때 판단에 달려있다. 이는 유지보수자가 "이 필드의 렌더링 로직이 어디 있는지"를 매번 다시 찾아야 하는 비용을 만든다.

파일명 오탈자도 발견됨: `view/XrefPiceMappingView.tsx` (Price의 오탈자, `r` 누락) — `XrefPriceMappingField.tsx:9`에서 이 오탈자 파일을 그대로 import한다. 기능상 문제는 없지만 코드베이스 전반의 마무리 품질을 보여주는 사례.

---

## 4. Copy-paste 중복 — Date/Datetime/Month/Year, Select 변형, Xref 패밀리

### 4.1 Date 계열 — 진짜 버그를 낳은 중복

`DateField`(`components/fields/DateField.tsx`)와 `DatetimeField`(`components/fields/DatetimeField.tsx`)는 `AbstractDateField`를 상속하지만, 렌더링/포맷 로직을 각자 처음부터 새로 작성했다(공통화된 부분 없음: `getCurrentValue`의 `'today'` 특수값 처리, readonly TextInput 분기, list filter, list item 포맷이 모두 병렬 중복).

이 복붙 과정에서 **실제 버그**가 생겼다:

```typescript
// src/listgrid/components/fields/DatetimeField.tsx:22-25
export class DatetimeField extends AbstractDateField<DatetimeField> {
  constructor(name: string, order: number, limit?: MinMaxStringLimit, range?: boolean) {
    super(name, order, 'date', limit, range);   // ← 'datetime' 이어야 하는데 'date' 를 그대로 복붙
  }
```

`DateField.tsx:24`의 `super(name, order, 'date', limit, range)`를 그대로 복사해오면서 문자열 리터럴을 `'datetime'`으로 바꾸지 않은 것으로 보인다. 이로 인해 `DatetimeField` 인스턴스의 `this.type`이 실제로는 `'date'`가 되고, 이는 `transfer/Type.ts`의 Excel import/export 변환 로직에서 조용히 잘못된 분기로 빠진다:

```typescript
// src/listgrid/transfer/Type.ts:565-576 (export 시 변환)
} else if (this.type === 'datetime') {
  return await getRangeDatetimeValue(value);   // DatetimeField 가 도달해야 할 분기
} else if (this.type === 'date') {
  return await getRangeDateValue(value);        // 실제로는 여기로 감 (버그)
}
```

(import 시에도 `transfer/Type.ts:607-610`에 동일 패턴 존재.) 결과적으로 `DatetimeField`를 쓰는 모든 엔티티는 Excel 내보내기/가져오기에서 시간(HH:mm) 부분이 날짜 전용 변환 함수로 처리되어 데이터가 유실되거나 형식이 깨질 가능성이 높다. `FieldType` 문자열 스위치 기반 설계(§2.2)가 이런 복붙 실수를 컴파일 타임에 잡아주지 못한다는 것 자체가 구조적 취약점을 보여준다.

`MonthField`(`MonthField.tsx`)와 `YearField`(`YearField.tsx`)는 `AbstractDateField`조차 상속하지 않고 `ListableFormField`를 직접 상속하며, min/max validation을 각자 다시 구현한다(`MonthField.tsx:52-89`는 문자열 비교, `YearField.tsx`는 옵션 목록 생성). 4개의 "날짜류" 필드가 각자 다른 조상, 다른 validation 구현, 다른 range 지원 방식을 가진 것은 공통 추상화가 애초에 date/datetime만 겨냥했고 month/year는 별개 계보로 급조됐음을 보여준다.

### 4.2 Select 계열 — 4개 클래스, 중복된 캐시 키/청크 로직

`SelectField`, `MultiSelectField`, `CustomOptionField`(alias 기반 원격 옵션) 는 모두 `createCacheKey()`라는 거의 동일한 함수를 각자 private으로 재구현한다:

```typescript
// SelectField.tsx:482-488, MultiSelectField 내부, CustomOptionField.tsx:155-162 — 3곳 모두 동일 패턴
private createCacheKey(renderType?: RenderType) {
  let key: string = ``;
  for (const option of this.options!) { key += `_${option.value}`; }
  return hexHash(`${this.getName()}_${this.getCurrentValue(renderType)}_${key}`);
}
```
(`OptionalField`에도 `MultipleOptionalField.createCacheKey`가 이미 존재하는데(`abstract/OptionalField.tsx:253-260`) `SelectField`/`CustomOptionField`는 그걸 쓰지 않고 각자 사설로 재작성했다 — 부모 클래스에 있는 걸 못 찾고 새로 만든 전형적 사례.)

또한 `SelectField.tsx`와 `CustomOptionField.tsx`는 각각 독립적인 옵션 프리페치/캐시 시스템(`selectFieldOptionsCache`/`selectFieldOptionsPending` vs `customOptionCache`)을 모듈 레벨 `Map`으로 병렬 구현한다 — N+1 방지 로직 자체는 (§4.3에서 지적할 문제와 별개로) 합리적이지만, 동일한 패턴이 필드마다 새로 쓰였다.

### 4.3 SelectField 안의 도메인 특화 로직 — 제네릭 필드가 아니다

`SelectField`(644줄)에는 다음이 필드 클래스 레벨에 하드코딩돼 있다:

- **상태값 → 색상 매핑 하드코딩**: `SelectField.tsx:413-437`
  ```typescript
  const colorMap: Record<string, ColorType> = {
    ACTIVE: 'success', ENROLLED: 'success', PAID: 'success', COMPLETED: 'success',
    APPROVED: 'success', GRADUATED: 'info', PENDING: 'warning', ON_LEAVE: 'warning',
    ...
    CANCELLED: 'danger', GIVE_UP: 'danger', EXPELLED: 'danger', UNPAID: 'danger', ...
  };
  ```
  `ENROLLED`/`GRADUATED`/`ON_LEAVE`/`EXPELLED`는 학원/교육 CRM 도메인 용어(등록/졸업/휴학/제적)이고 `PAID`/`UNPAID`는 결제 도메인이다. **이건 원본 호스트 서비스의 상태값 어휘가 "범용 SelectField"에 그대로 굳어 들어간 것**이다. 이 값에 해당하지 않는 이커머스나 티켓팅 등 다른 도메인 프로젝트에서는 죽은 코드이거나, 우연히 같은 문자열(`PENDING`, `CANCELLED` 등)을 쓰는 다른 필드에 의도치 않은 색상이 적용될 위험이 있다.
- **즉시 변경(Immediate Change) 기능이 EntityForm 경로를 우회해 직접 PUT 호출**: `SelectFieldRenderer.tsx:247-347` 는 `entityForm.save()`를 쓰지 않고 `getExternalApiDataWithError({ url: `${entityForm.getUrl()}/${entityForm.id}`, method: 'PUT', ... })`를 직접 호출하고, 성공 시 `window.location.reload()`(`SelectFieldRenderer.tsx:346`)로 전체 페이지를 강제 리로드한다. 이는 SPA 상태 관리 원칙에 반하는 하드 리프레시이며, 라이브러리가 호스트의 EntityForm 저장 파이프라인을 우회하는 별도의 API 계약(REST PUT + `modifiedFields` 필드)을 자체적으로 강제한다.
- **상태 변경 사유(reason) 입력 모달, 상태 변경 검증(validateStatusChange)** 등은 그 자체로는 재사용 가능한 패턴이지만, "상태 변경"이라는 워크플로우 자체가 리스트그리드/폼 라이브러리의 책임 범위를 넘어선다 — 이는 애플리케이션 레이어(주문/신청 상태 관리)의 관심사다.

### 4.4 Xref* 패밀리 — 공통 상위 클래스 부재로 인한 반복

`XrefMappingField`, `XrefPreferMappingField`, `XrefPriceMappingField`, `XrefAvailableDateMappingField` 4개 클래스는:

1. 모두 `FormField`를 **직접** 상속한다 (abstract/ 폴더에 `AbstractXrefMappingField` 같은 공통 베이스가 없음에도 abstract/ 폴더 자체는 존재).
2. 4개 클래스 모두 동일한 패턴의 `isBlank()` 오버라이드를 반복한다:
   ```typescript
   // XrefMappingField.tsx:102-116, XrefPreferMappingField.tsx:79-89,
   // XrefPriceMappingField.tsx:85-95, XrefAvailableDateMappingField.tsx:58-68 — 4곳 거의 동일
   async isBlank(renderType: RenderType = 'create'): Promise<boolean> {
     const value = await this.getCurrentValue(renderType);
     if (value === undefined || value === null || value === '') return true;
     const mappingValue = value as XrefXxxMappingValue;
     return isEmpty(mappingValue.mapped);
   }
   ```
3. 모두 생성자에서 동일한 `this.helpText = '이 정보를 변경한 후 반드시 저장 버튼을 눌러야 변경 사항이 반영됩니다.';`(`XrefMappingField.tsx:46`, `XrefPreferMappingField.tsx:33`, `XrefPriceMappingField.tsx:36`, `XrefAvailableDateMappingField.tsx:23`)를 하드코딩한다 — i18n도 안 되고 한국어 고정 문자열이 4곳에 박제.
4. 모두 `constructor`/`createInstance`에서 동일한 필드(`entityForm`, `filters`)를 반복 전달한다.

이 4개는 명백히 "N:M 관계 매핑 UI"라는 공통 추상화의 하위 variant인데, `AbstractXrefMappingField<TSelf, TValue>` 하나로 묶으면 `isBlank`/`helpText` 초기화/생성자 보일러플레이트를 4배에서 1배로 줄일 수 있었다. `XrefPriceMappingField`라는 이름 자체도 "가격"이라는 도메인 개념(학원 수강료/이용권 가격 등)이 필드 타입 이름에 박혀있어 범용 라이브러리 네이밍으로는 부적절하다.

---

## 5. 도메인 특화 필드 — 범용 라이브러리에 있으면 안 되는 것들

| 항목 | 위치 | 문제 |
|---|---|---|
| Kakao Map 좌표 표시 | `components/fields/address/KakaoMap.tsx:1-76` | `react-kakao-maps-sdk`, `kakao.maps.services.Geocoder` 전역 객체 직접 사용(`KakaoMap.tsx:36`). 지오코더 인터페이스 추상화가 전혀 없어 카카오 API가 아닌 다른 지도 서비스로 교체 불가능 |
| 다음 우편번호 검색 | `components/fields/address/PostCodeSelector.tsx:7,245` | `react-daum-postcode` 하드 의존. 대한민국 주소 체계(시/도, 시/군/구, 우편번호) 전용 UI(`PostCodeSelectorForm`, `AddressFieldView.tsx`) |
| `package.json` 필수 의존성 | `package.json:132,134` | `react-daum-postcode`, `react-kakao-maps-sdk`가 (peer)dependencies로 선언되어, 이 두 필드를 쓰지 않는 소비 프로젝트도 번들에 영향받거나 최소한 설치 목록에 나타남 |
| SMS 발송 모달 | `components/fields/view/SmsModal.tsx:22-212` | EUC-KR 바이트 계산(`getByteLength`, `:30-43`), `getEndpoint('smsNotificationSend')` 하드코드 엔드포인트, "90바이트 초과 시 LMS 전환" 같은 한국 통신사 SMS/LMS 정책이 그대로 UI 로직에 박제 |
| 마케팅 필드 | `components/fields/Preset.tsx:342-361` | `MarketingField()` — "마케팅 메시지", "이 오퍼가 적용될 때 주문서에 표시되는 메시지" 라는 헬프텍스트(`Preset.tsx:352`)는 특정 이커머스/주문 도메인("오퍼", "주문서") 용어 그대로 |
| 가입 채널(DeviceType) | `components/fields/Preset.tsx:287-304` | `DeviceTypes`가 `PC`/`MOBILE`/`MOBILE_APP`/`UNDEFINED`로 고정되고 라벨이 "가입 채널"(`Preset.tsx:295`) — 회원가입 도메인 특화 |
| `xrefAt`(지정일) 프리셋 | `Preset.tsx:276-285` | Xref(연관 매핑) 개념 자체가 호스트 서비스의 카테고리/상품 배치 도메인 용어 |

`Preset.tsx`(442줄) 파일 전체가 사실상 "범용 필드 조합 헬퍼"를 가장한 **호스트 서비스 전용 필드 프리셋 모음**이다. `AliasField`, `SlugField`, `PublishStatusFieldPreset`(DRAFT/PUBLISHED/DISCARDED 상태 머신, `Preset.tsx:367-442`) 등은 CMS/게시물 도메인에 특화되어 있고, `applyPublishStatusEntityForm()` 함수는 게시 상태에 따라 옵션 목록을 갈아끼우고 `entityForm.setReadOnly()`까지 호출하는 정교한 상태 머신을 라이브러리 유틸리티로 내장하고 있다. 이 정도 로직은 "라이브러리가 제공하는 조립 부품"이 아니라 "이 프로젝트의 특정 엔티티 폼 설정"이며, 다른 프로젝트에서 재사용될 확률이 낮다.

**contentasset/** (`ContentAssetField.tsx`, `useContentAsset.ts`)는 README까지 갖춰(`contentasset/README.md`) 상대적으로 잘 캡슐화되어 있고 도메인 특화 정도가 낮아 이 서브시스템 안에서는 비교적 양호한 사례다.

---

## 6. Rule 엔진 (rule/) — 호스트 컨벤션이 새어든 필터링 로직

`rule/Type.ts:124-131`:
```typescript
export function isIgnoreField(field: FormField<any>) {
  if (field.name === 'active' && field.type === 'boolean') {
    // active 조건을 rule 로 지정하는 것은 말이 안 된다.
    return true;
  }
  return false;
}
```
필드 이름 `'active'`가 하드코딩되어 있다 — 이는 "이 프로젝트에서는 모든 엔티티가 `active`라는 boolean 필드를 갖는다"는 호스트의 네이밍 컨벤션을 전제한 것으로, 다른 프로젝트가 다른 이름(`isActive`, `enabled`, `status`)을 쓰면 이 필터링은 조용히 무력화된다.

---

## 7. Validation 시스템 — 설계는 깔끔하나 헬퍼 함수에 실질적 버그

### 7.1 설계

`Validation` 인터페이스(`validations/Validation.tsx:6-30`) + `ValidationItem` 추상 클래스(`:59-136`) + `ValidateResult`(`:32-57`) 구조는 단순하고 합성 가능하다. `RequiredValidation`, `RegexValidation`, `MinMaxNumberValidation`, `EmailValidation`, `PhoneNumberValidation` 등은 각각 짧고 단일 책임을 지킨다. `FormField.withValidations(...)`으로 여러 검증을 배열로 등록하고 `FormField.validate()`(`FormField.tsx:779-823`)에서 hidden/readonly/permission 체크 후 순회 실행하는 흐름도 합리적이다.

### 7.2 실제 버그: `getValueAsNumber`/`getValueAsBoolean` 연산자 우선순위 오류

```typescript
// src/listgrid/validations/Validation.tsx:109-113
getValueAsNumber(entityForm: EntityForm, value: FieldValue): number {
  return Number(
    (value?.current ?? entityForm.getRenderType() === 'update') ? value?.fetched : value?.default,
  );
}
```
`??`는 `===`보다 낮은 우선순위이므로 실제 평가 순서는 `value?.current ?? (entityForm.getRenderType() === 'update')`다. 즉:

- `value.current`가 정의돼 있으면(사용자가 값을 수정한 경우) `??`가 단락되어 **`value.current` 그 자체**가 다음 삼항연산의 조건식이 된다.
- `value.current`가 truthy(예: 양수)면 조건이 참이 되어 `value?.fetched`를 반환 — **사용자가 새로 입력한 값이 아니라 서버에서 가져온 원래 값을 검증한다.**
- `value.current`가 `0`처럼 falsy이면 조건이 거짓이 되어 `value?.default`를 반환 — 생성 모드의 기본값과 뒤섞인다.

이 함수를 사용하는 `MinMaxNumberValidation.validate()`(`validations/MinMaxNumberValidation.ts:13-14`)는 update 폼에서 **사용자가 방금 입력한 숫자가 아니라 폼이 처음 로드됐을 때의 값을 min/max 검사**하게 된다. 예: 수량 필드의 min=1, max=100이고 서버에서 가져온 원래 값이 50이었는데 사용자가 9999로 바꾼 경우, 이 검증은 여전히 "50"을 검사해 통과시켜버린다 — **min/max validation이 사실상 무력화**되는 시나리오다. `getValueAsBoolean`(`:120-124`)도 동일한 패턴이므로 동일한 결함을 가진다. 의도한 코드는 아마 `value?.current ?? (entityForm.getRenderType() === 'update' ? value?.fetched : value?.default)`였을 것이다.

이 버그는 grep으로 직접 검증 가능하며(`getValueAsNumber`/`getValueAsBoolean` 사용처는 `MinMaxNumberValidation.ts:14`가 유일), 재현을 위한 실행 환경은 없었으므로 **정적 분석 기반 확정(코드 경로상 100% 재현되는 로직 오류)**이나 런타임 관찰로 검증되지는 않았다.

---

## 8. TagsInput — 상대적으로 깔끔한 사례

`form/TagsInput/types.ts`는 `TagItem`/`TagsInputProps`/`TagsInputContextType`/`TagProps`/`TagsInputDropdownProps`로 책임이 명확히 분리된 타입 정의이며, `onValidateTag` 콜백으로 호스트가 커스텀 검증을 주입할 수 있게 한 것은 좋은 확장점이다. 이 스코프에서 도메인 특화 코드가 없는 몇 안 되는 파일 중 하나다.

---

## 9. 종합 판정 — 40여 개 필드 클래스가 "제품"이 되기 위한 조건

1. **(critical)** `SelectField`/`Preset.tsx`/`address/`/`SmsModal`에 박제된 호스트 도메인 어휘(학원 CRM 상태값, 카카오맵, SMS, "오퍼/주문서")를 제거하거나 플러그인화하지 않는 한, 이 라이브러리를 가져다 쓰는 두 번째 프로젝트는 필연적으로 데드 코드(불필요한 카카오맵 의존성, 안 맞는 색상 매핑)를 떠안는다.
2. **(critical)** `getValueAsNumber`/`getValueAsBoolean` 버그는 실제 서비스에서 update 폼의 숫자 min/max 검증을 무력화하는 회귀이므로 다른 리팩토링보다 먼저 고쳐야 한다.
3. **(high)** `DatetimeField`의 타입 리터럴 버그는 Excel import/export 데이터 무결성에 영향을 준다.
4. **(high)** Xref 4형제의 공통 베이스 부재, Date/Datetime/Month/Year의 서로 다른 조상, Select 3형제의 캐시 키 중복은 "새 필드 추가/기존 필드 수정" 비용을 실제보다 부풀린다.
5. **(medium)** `field.type === '...'` 문자열 스위치가 14개 파일에 흩어져 있는 구조는 다형성으로 대체하지 않으면 신규 필드 타입 추가 시 실수 유입 통로로 계속 작동한다.
6. FormField 추상 계층 자체(빌더 패턴, clone/copyFields, isDirty 정규화)는 **잘 설계된 부분으로 인정**해야 하며, 이 부분을 갈아엎을 필요는 없다 — 문제는 그 위에 얹힌 concrete 필드들의 도메인 오염과 복붙이다.
