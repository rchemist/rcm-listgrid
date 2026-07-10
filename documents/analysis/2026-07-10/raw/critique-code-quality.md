> **[원자료 경고]** 2026-07-10 제로베이스 분석 워크플로우의 에이전트 산출물 원본이다. 일부 주장 심각도는 이후 적대적 검증에서 **정정**되었다 — 인용 전 반드시 [`../verification-log.md`](../verification-log.md)와 종합 보고서 [`../../2026-07-10-zero-base-review.md`](../../2026-07-10-zero-base-review.md)를 우선하라.

# 코드 품질·중복 심판 — `@rchemist/listgrid` v0.3.25

**스코프**: 필드 카탈로그(`components/fields/**`), SubCollectionField 3variants, 검증 시스템, ViewListGrid/AdvancedSearchForm, 부가 기능(transfer/misc/utils), 에러 처리 전반, 오버사이즈 파일.
**방법**: map-fields.md / map-aux-features.md / map-quality.md / map-core-model.md 를 1차 입력으로 삼되, 지도가 제기한 핵심 주장(critical/high 스멀)은 전부 실제 코드를 직접 열어 재검증했다. grep 집계와 `wc -l` 실측을 병행했다. 리포는 read-only로만 다뤘다.

---

## 1. 결론 요약 (TL;DR)

이 코드베이스의 문제는 "설계를 못해서"가 아니라 **"설계된 추상화를 실제로 쓰지 않고 매번 새로 복붙했다"**는 데 있다. `FormField`의 빌더 패턴, `SubCollectionField`의 부모 클래스, `MultipleOptionalField.createCacheKey()` 같은 재사용 지점이 이미 존재하는데도 구체 클래스들은 그걸 찾지 못하고(또는 찾지 않고) 매번 새로 작성했다. 그 결과:

- **최소 4개 확인된 실질 버그**가 복붙 과정에서 생겼다 — 그중 2개는 데이터 정합성(검증 무력화, Excel 변환 오류)에 직접 영향을 준다.
- **SubCollectionField 3variants**(Card/Table/Inline)의 `buildSearchForm()`은 문자 그대로 동일한 로직을 3벌 유지한다(변수명·주석까지 동일, pageSize 기본값만 다름).
- **Xref* 4형제**는 공통 베이스 없이 각자 `isBlank()`/헬프텍스트/생성자 보일러플레이트를 반복한다.
- **FieldRenderer.tsx 한 파일 안에서** 커스텀 렌더러용 onChange(`handleFieldChange`, L75-141)와 기본 렌더러용 onChange(`viewParams.onChange`, L239-311)가 약 65줄을 그대로 복제하고 있다 — "다른 파일 간 중복"이 아니라 "같은 파일 안 자기 복제"라는 점에서 더 심각하다.
- **`misc/index.ts` ↔ `utils/CompareUtil.ts`/`StringUtil.ts`**는 파일 단위로 로직이 100% 중복되어 있고 둘 다 테스트로 지켜지는 "공식 API" 취급을 받는다 — 의도적 이중 유지보수 상태.
- **`AdvancedSearchForm`(V1, 218L)**은 `index.ts`로 공개 export만 되어 있을 뿐 라이브러리 내부 어디에서도 쓰이지 않는 죽은 코드다. `ViewListGrid.tsx`는 `AdvancedSearchFormV2`를 `AdvancedSearchForm`이라는 이름으로 alias-import해서 쓴다(`ViewListGrid.tsx:9`) — 즉 소비자가 두 심볼 중 뭐가 "진짜"인지 소스만 봐서는 알 수 없다.
- **에러 처리**: `catch (e) { console.error(e); }` 패턴이 40곳 이상 반복되고, 그중 최소 6곳(`EntityForm.tsx` 4곳, `FieldRenderer.tsx` 2곳)은 **호스트가 등록한 콜백(onInitialize/onFetchData/onChanges)의 실패를 사용자에게 전혀 알리지 않고** 폼을 부분 초기화 상태로 조용히 렌더링한다.
- **오버사이즈 파일**: `EntityForm.tsx`(1074L), `SearchForm.ts`(961L), `CardManyToOneView.tsx`(887L), `FormField.tsx`(862L), `EntityFormBase.tsx`(852L), `Type.ts`(815L), `useListGridLogic.ts`(802L), `ViewListGrid.tsx`(745L) 등 8개 파일이 700줄을 넘는다. 이 중 다수가 "책임이 여러 개라서 크다"가 아니라 "복붙된 유사 로직이 쌓여서 크다"는 패턴에 해당한다(§6).

**이건 고쳐질 수 있는가?** — 대부분은 **기계적으로 고칠 수 있는 수준**이다(공통 베이스 클래스 추출, 함수 중복 제거, 연산자 우선순위 괄호 추가). 근본적으로 재설계가 필요한 것은 1건뿐: `field.type === '...'` 문자열 스위치 기반 확장 모델(§5) — 이건 다형성으로 대체하려면 40여 개 필드 클래스와 14개 소비 파일을 동시에 건드려야 하는 아키텍처 레벨 변경이다.

---

## 2. 확정된 실질 버그 (critical/high) — 재검증 완료

### 2.1 `getValueAsNumber`/`getValueAsBoolean` 연산자 우선순위 오류 → min/max 검증 무력화 (critical)

`src/listgrid/validations/Validation.tsx:109-113`:

```ts
getValueAsNumber(entityForm: EntityForm, value: FieldValue): number {
  return Number(
    (value?.current ?? entityForm.getRenderType() === 'update') ? value?.fetched : value?.default,
  );
}
```

직접 코드를 읽고 JS 연산자 우선순위(`===` > `??` > `?:`)로 재계산해 확인했다: 실제 평가 순서는 `(value?.current ?? (entityForm.getRenderType() === 'update')) ? value?.fetched : value?.default`. `value.current`가 정의돼 있으면(사용자가 값을 입력/수정한 경우) `??`가 단락되어 `value.current` 자체가 조건식이 되고, 그 값이 truthy면 `value.fetched`(서버 원본값)를, falsy(0 등)면 `value.default`를 반환한다 — **어느 분기에서도 사용자가 방금 입력한 `value.current`가 검증 대상이 되지 않는다.**

사용처는 `validations/MinMaxNumberValidation.ts:14` 단 한 곳(grep으로 확인). 즉 수량/가격 등 `MinMaxNumberValidation`이 걸린 모든 숫자 필드는 **update 모드에서 사용자가 새로 입력한 값이 아니라 폼이 처음 로드됐을 때의 서버값을 min/max 검사**한다. `getValueAsBoolean`(L120-124)도 동일 패턴.

- **영향**: min/max validation이 update 시나리오에서 사실상 no-op. 사용자가 min=1,max=100인데 9999를 입력해도 서버 원본값(예: 50)이 검사 대상이라 통과한다.
- **재현**: 정적 분석으로 100% 확정(런타임 재현은 미실행, 로직 경로상 필연적 결과).
- **수정 난이도**: 낮음 — 괄호 하나 추가. `value?.current ?? (entityForm.getRenderType() === 'update' ? value?.fetched : value?.default)`.
- **LOC**: 2줄.

### 2.2 `DatetimeField`가 자신의 타입을 `'date'`로 등록 → Excel 변환 데이터 유실 (high)

`src/listgrid/components/fields/DatetimeField.tsx:22-24`:
```ts
constructor(name: string, order: number, limit?: MinMaxStringLimit, range?: boolean) {
  super(name, order, 'date', limit, range);   // 'datetime' 이어야 함
}
```
`DateField.tsx:23`의 동일한 `super(name, order, 'date', ...)` 호출을 복붙하면서 문자열 리터럴을 바꾸지 않은 것으로 보인다. 직접 `transfer/Type.ts:565-576`(export 변환), `:607-610`(import 변환)를 읽어 확인: `else if (this.type === 'datetime') { return getRangeDatetimeValue(value); } else if (this.type === 'date') { return getRangeDateValue(value); }` — `DatetimeField` 인스턴스의 `this.type`이 `'date'`이므로 항상 두 번째 분기로 빠진다.

- **영향**: `DatetimeField`를 쓰는 모든 엔티티는 Excel export/import 시 시간(HH:mm) 정보가 날짜 전용 변환 함수로 처리되어 유실되거나 형식이 깨진다.
- **수정 난이도**: 낮음 — 리터럴 1글자 수정(`'date'` → `'datetime'`). 단, `this.type`을 참조하는 다른 분기(필터/뷰 렌더링 등)에 회귀가 없는지 확인 필요.
- **LOC**: 1줄 + 회귀 테스트 추가 권장.

### 2.3 `EntityForm.clone()` 의 `manageEntityForm` aliasing 버그 (critical)

`src/listgrid/config/EntityForm.tsx:51`을 직접 읽어 확인:
```ts
entityForm.manageEntityForm = this.manageEntityForm;   // 참조 그대로 대입, 얕은 복사조차 없음
```
같은 함수 안에서 `tabs`(L58-62), `fields`(L74-78), `collections`(L81-86), `clientExtensions`(L54) 등은 전부 `new Map(...)` 또는 개별 `.clone()`으로 제대로 복제되는데, `manageEntityForm`만 참조를 그대로 넘긴다. 그리고 `config/form/EntityFormValidation.tsx:127,132,137`(`withCreatable`/`withUpdatable`/`withDeletable`)을 직접 읽어 확인:
```ts
withCreatable(creatable: boolean): this {
  this.manageEntityForm.create = creatable;   // 스프레드 없이 직접 mutate
  return this;
}
```
- **영향**: `entityForm.clone()`으로 만든 사본에 `withCreatable(false)` 등을 호출하면, 원본 `entityForm`의 권한 객체도 함께 바뀐다. `SubCollectionField.getListGrid()`(`SubCollectionField.tsx:211-226`, map-core-model 재확인)가 `entityForm.clone(true)`를 호출해 서브컬렉션용 폼을 만드는 경로가 이 버그에 직접 노출된다 — 서브컬렉션에서 생성 권한을 끄면 부모 폼의 생성 권한도 조용히 꺼질 수 있다.
- **수정 난이도**: 낮음 — `entityForm.manageEntityForm = { ...this.manageEntityForm };`로 교체.
- **LOC**: 1줄.

### 2.4 `FieldRenderer.tsx` — onChange async IIFE 미포착 예외 = 잠재적 unhandled rejection (medium)

`FieldRenderer.tsx:76-141`과 `:239-311`을 직접 읽어 확인: `handleFieldChange`와 `viewParams.onChange` 둘 다 `(async () => { ... })()` 형태의 즉시실행 async 함수를 호출부에서 `.catch()` 없이 실행한다. 내부의 `try/catch`(L104-113, L268-277)는 `cloned.onChanges` 콜백 루프만 감싸고, 그 앞뒤의 `entityForm.clone(true)`, `cloned.setValue(...)`, `cloned.validate(...)` 호출이 던지는 예외는 어디서도 잡히지 않는다.
- **영향**: 필드 값 변경 시 clone/validate 단계에서 예외가 나면 브라우저 콘솔에 "Uncaught (in promise)"만 남고 UI는 아무 피드백 없이 멈춘 것처럼 보인다(로딩 스피너가 꺼지지 않을 수 있음 — `setOpenBaseLoading` 관련 상태가 갱신되지 않으므로).
- **수정 난이도**: 낮음 — IIFE 전체를 try/catch로 감싸거나 `.catch((e) => console.error(e))` 추가.
- **LOC**: 각 위치 2-4줄, 2곳.

---

## 3. Copy-paste 중복 군집 — 정량화

### 3.1 SubCollectionField Card/Table/Inline 3variants (high, ~1,332L 중 상당수가 근중복)

`wc -l` 실측: `CardSubCollectionField.tsx` 317L, `TableSubCollectionField.tsx` 225L, `InlineSubCollectionField.tsx` 390L, 부모 `SubCollectionField.tsx` 400L.

`buildSearchForm()` 메서드를 3개 파일에서 직접 읽어 비교한 결과, **변수명·주석·로직 순서까지 문자 그대로 동일**하다(pageSize 기본값만 `10000`/`10000`/`10` 로 다름):

```ts
// CardSubCollectionField.tsx:216-252, TableSubCollectionField.tsx:140-169,
// InlineSubCollectionField.tsx:289-325 — 3곳 거의 100% 동일 (약 35줄 × 3)
async buildSearchForm(parentEntityForm: EntityForm): Promise<SearchForm> {
  const searchForm = new SearchForm();
  searchForm.withPageSize(this.fetchOptions?.pageSize ?? 10000 /* or 10 */);
  if (this.fetchOptions?.viewDetail) { searchForm.withViewDetail(true); }
  const mappedByFilter = this.getMappedByFilter(parentEntityForm);
  if (this.fetchOptions?.filters) {
    const additionalFilters = await this.fetchOptions.filters(parentEntityForm);
    if (additionalFilters.length > 0 && additionalFilters[0]!.items) {
      const hasMappedByFilter = additionalFilters[0]!.items.some(
        (item: FilterItem) => item.name === mappedByFilter.name,
      );
      if (!hasMappedByFilter) { additionalFilters[0]!.items.unshift(mappedByFilter); }
      additionalFilters.forEach((filterGroup) => {
        searchForm.withFilter(filterGroup.condition, ...filterGroup.items);
      });
    }
  } else {
    searchForm.handleAndFilter(mappedByFilter.name, mappedByFilter.value);
  }
  return searchForm;
}
```

`render()` 메서드들도 "lazy import view 컴포넌트 → readonly 판정 → tooltip 조회 → useSearchForm이면 buildSearchForm 호출 → viewProps 조립 → Suspense 래핑" 순서가 3곳에서 동일한 골격을 따른다(각 파일 L216-317/140-225/289-390 구간). **근중복 추정 LOC: buildSearchForm(35줄×3=105줄) + render 골격 공통부(약 40줄×3=120줄) ≈ 200줄 이상이 `AbstractSubCollectionField`류의 template method 하나로 통합 가능.**

- **정리 방향**: `SubCollectionField`(공통 부모, 이미 존재)에 `buildSearchForm()` 기본 구현을 두고, Card/Table/Inline은 `pageSize` 기본값만 오버라이드하는 protected 값으로 파라미터화. render()는 "view 컴포넌트 동적 import 경로"만 서브클래스가 제공하고 나머지 흐름(readonly/tooltip/Suspense)을 부모가 template method로 담당.
- **예상 절감**: 약 150-200줄, 향후 버그 수정 시 3곳 대신 1곳만 고치면 됨.

### 3.2 Xref* 4형제 — 공통 베이스 부재 (high, ~382L 중 보일러플레이트 반복)

`wc -l` 실측: `XrefMappingField.tsx` 117L, `XrefPreferMappingField.tsx` 95L, `XrefPriceMappingField.tsx` 101L, `XrefAvailableDateMappingField.tsx` 69L.

`isBlank()` 오버라이드를 직접 대조 확인 — 4곳 모두 다음 골격이 동일:
```ts
async isBlank(renderType: RenderType = 'create'): Promise<boolean> {
  const value = await this.getCurrentValue(renderType);
  if (value === undefined || value === null || value === '') { return true; }
  const mappingValue = value as XrefXxxMappingValue;
  return isEmpty(mappingValue.mapped);   // 필드마다 약간의 variant
}
```
여기에 더해 4개 클래스 모두 `FormField`를 직접 상속(공통 `AbstractXrefMappingField` 부재), 동일한 한국어 helpText 하드코딩("이 정보를 변경한 후 반드시 저장 버튼을 눌러야..."), 동일한 `entityForm`/`filters` 생성자 파라미터 반복.

- **정리 방향**: `AbstractXrefMappingField<TSelf, TValue>` 추출 — `isBlank`/생성자 보일러플레이트/helpText 기본값을 부모로 이동.
- **예상 절감**: 약 60-80줄(4곳 → 1곳 + variant 훅 포인트).

### 3.3 `FieldRenderer.tsx` 파일 내부 자기복제 — onChange 로직 2벌 (high)

§2.4에서 이미 버그 관점으로 다뤘지만, 순수 중복 관점에서도 지적할 가치가 있다: `handleFieldChange`(L75-141, 커스텀 렌더러용)와 `viewParams.onChange`(L239-311, 기본 렌더러용)가 **주석까지 포함해 약 65줄을 그대로 복제**한다(clone → setValue → validate → onChanges 순회 → manyToOneLink 갱신 → requestAnimationFrame 스크롤 보정). 이 파일 하나(483L)의 약 27%가 이 중복에 해당한다.

- **정리 방향**: 공통 `applyFieldChange(entityForm, fieldName, value, options)` 헬퍼로 추출, 두 onChange 핸들러는 이를 호출만 하도록 축소.
- **예상 절감**: 약 55-60줄.
- **부수 효과**: §2.4의 unhandled rejection 버그도 헬�퍼 레벨에서 한 번만 고치면 양쪽에 다 적용됨.

### 3.4 `misc/index.ts` ↔ `utils/CompareUtil.ts`/`StringUtil.ts` — 파일 단위 100% 중복 (high)

직접 대조: `misc/index.ts:171-241`(`isNulls`/`isEquals`/`isEqualCollection`/`isEmpty`/`isPositive`/`isNegative`)과 `utils/CompareUtil.ts:3-107` 전체가 공백/주석 차이만 있는 동일 로직이다. `removeTrailingSeparator`(`misc/index.ts:256-263` vs `utils/StringUtil.ts:170-183`)도 동일. `misc/index.ts` 파일 헤더(L1-9)가 스스로 "Ported to match the original semantics exactly"라고 인정하고 있어 의도적 이관 흔적임을 알 수 있다.

- **위험도가 높은 이유**: `misc/index.test.ts:1-40`이 `misc`에서 직접 import해 테스트하므로 **두 벌 모두 테스트로 지켜지는 "공식 API"**로 취급된다 — 즉 "죽은 코드라 지우면 그만"이 아니라, 한쪽만 고쳐지고 다른 쪽이 방치될 위험이 실제로 존재하는 이중 유지보수 상태다.
- **정리 방향**: `misc/index.ts`의 해당 함수들을 `utils/CompareUtil.ts`/`StringUtil.ts`의 재노출(`export { isEquals } from '../utils/CompareUtil'`)로 교체. 다만 이는 npm 공개 API 표면(semver)이므로 **재노출로 전환하는 것 자체는 안전**하지만, 두 API 중 하나를 deprecated로 문서화하고 다음 major에서 제거하는 계획이 필요.
- **예상 절감**: 약 70-90줄(로직 중복 제거, re-export는 몇 줄만 남음).

### 3.5 Select 계열 — `createCacheKey` 3중 재구현 (medium)

`abstract/OptionalField.tsx:253-260`(`MultipleOptionalField.createCacheKey`)에 이미 존재하는 로직을 `SelectField.tsx:482-488`, `CustomOptionField.tsx:155-162`가 각자 private으로 재구현했음을 직접 확인:
```ts
// 3곳 모두 동일 패턴
private createCacheKey(renderType?: RenderType) {
  let key: string = ``;
  for (const option of this.options!) { key += `_${option.value}`; }
  return hexHash(`${this.getName()}_${this.getCurrentValue(renderType)}_${key}`);
}
```
- **정리 방향**: 부모의 `protected createCacheKey()`를 그대로 상속받아 쓰도록 자식의 private 재구현 제거.
- **예상 절감**: 약 20줄(3곳 → 0).

### 3.6 Date/Datetime/Month/Year — 계보 불일치 (medium, 재설계에 가까움)

`DateField`/`DatetimeField`는 `AbstractDateField` 상속, `MonthField`/`YearField`는 `ListableFormField`를 직접 상속하며 각자 min/max validation을 재구현(`MonthField.tsx:52-89` 문자열 비교 vs `YearField.tsx` 옵션 목록 생성). §2.2 버그가 이 계보 혼란에서 파생됐다는 점을 고려하면, 단순 복붙 제거보다 **공통 `AbstractDateFamilyField`로 4개를 재편**하는 것이 근본 해법이나, 이는 각 필드의 저장 포맷(`string` vs `string[]` range)이 달라 기계적 추출이 아니라 설계 작업에 가깝다.
- **우선순위**: 버그(§2.2) 수정이 먼저이고, 계보 통합은 별도 리팩터 스프린트로 분리 권장.

### 3.7 `DataImporter.tsx` — File/URL 업로드 분기 70줄 복제 (medium)

map-aux-features가 지적한 내용을 직접 라인 대조로 확인: `DataImporter.tsx:126-190`(File 인스턴스 분기)과 `:201-266`(서버 기저장 URL 분기)이 `XLSX.read → sheet_to_json → 필드 매칭 루프(row.findIndex, subStringBetween) → buildSheetData` 흐름을 거의 동일하게 반복한다. 바이트를 얻는 방식(`FileReader` vs `fetch`)만 다르다.
- **정리 방향**: "바이트 획득"과 "파싱+필드매칭"을 분리해 후자를 공유 헬퍼로 추출.
- **예상 절감**: 약 60-65줄.

---

## 4. 죽은 코드 / 방치된 실험

| 대상 | 근거 | 판정 |
|---|---|---|
| `AdvancedSearchForm`(V1, 218L) | `index.ts:192`로 export되지만 `ViewListGrid.tsx:9`는 `AdvancedSearchFormV2 as AdvancedSearchForm`으로 alias-import — grep 재확인 결과 라이브러리 내부 어디서도 V1을 실제로 렌더링하는 곳 없음 | **공개 API로 노출된 죽은 코드.** 신규 소비자가 실수로 `import { AdvancedSearchForm }`를 쓰면 유지보수되지 않는(추정) 구버전 컴포넌트를 붙이게 된다. |
| `misc/index.ts:533-537`의 `RequestUtil: any = {}`, `EntityError: any` | 파일 자체 주석 "intentional: legacy placeholders... consumers dereference fields on these dynamically" — grep으로 참조처를 찾지 못함(map-aux-features와 동일 결론) | **참조처 불명 + 타입 무방비.** 지울 수 있는지 별도 확인 필요하나, 최소한 `any` 무형 스텁을 라이브러리 공개 표면에 두는 것 자체가 위험 신호. |
| `DataImportProcessor.tsx:10-11` `const classes: Record<string, string> = {}` | "CSS module removed in Stage 8" 주석과 함께 빈 스텁, `className={classes.row}`(`:176,184,206,210`)가 항상 `undefined` | **마이그레이션 잔해.** 기능적으로 무해하나 클래스 시스템이 없다는 것을 스텁이 숨기고 있어 리더를 혼란시킴. |
| `simpleCrypt.ts`의 `compress`/`decompress` 파라미터 | `simpleCrypt.ts:13,16-17,22,25-26` — `if (isTrue(compress)) { }` 빈 블록 | **시그니처만 있고 구현 없는 죽은 파라미터.** 호출자가 `compress: true`를 넘겨도 아무 효과 없음을 타입만으로는 알 수 없음. |
| `simpleCrypt.ts:48-94`의 수제 `generateUUID()`(47줄) | `dependencies`에 이미 `uuid@9.0.0`이 있는데도 `crypto-js` WordArray로 UUID v4를 손으로 재구현 | **불필요한 사장(死藏) 코드 경로.** `uuid` 패키지는 `SearchForm.ts`/`EntireChecker.tsx` 단 두 곳에서만 쓰이고, `simpleCrypt`는 이를 무시. 두 개의 UUID 생성 경로가 공존. |

---

## 5. 확장 모델의 구조적 취약점 (문자열 스위치) — 재설계가 필요한 유일한 항목

`field.type === '...'` 형태의 하드코드 분기가 14개 파일에 흩어져 있음을 grep으로 재확인(`form/SearchForm.ts`, `config/ListGrid.ts`, `config/OnChangeEntityForm.ts`, `transfer/Type.ts`, `components/form/ui/AlertItem.tsx`, `components/list/hooks/useQuickSearchBar.ts`, `components/fields/abstract/{ListableFormField,OptionalField,FormField}.tsx`, `components/fields/rule/{Type,RuleCondition,RuleBasedFieldView,RuleBasedSelector}.tsx`, `components/revision/RevisionField.tsx`). §2.2(DatetimeField 'date' 버그)는 바로 이 설계의 산물이다 — 다형성이었다면 `DatetimeField.getExcelExportValue()`를 오버라이드하는 형태라 컴파일 타임에 분기 자체가 필요 없었을 것이다.

이건 **기계적 정리로 끝나지 않는다**: 40여 개 필드 클래스 + 14개 소비 파일을 동시에 리팩터링해야 하는 아키텍처 변경이며, "새 필드 추가 시 14개 파일 중 어디를 고쳐야 하는지 실수로 빠뜨리는" 구조적 위험을 없애려면 `EntityField` 인터페이스에 `getExcelExportValue()`/`isIgnorableInRule()` 같은 다형 메서드를 추가하고 각 필드가 필요시 오버라이드하는 방식으로 전환해야 한다. **우선순위는 낮게 잡되(당장 버그를 일으키는 곳은 이미 §2.2로 개별 수정 가능), 차기 major 버전의 아키텍처 과제로 등재할 것을 권고.**

---

## 6. 오버사이즈 파일 — 분해 우선순위

`wc -l` 실측(테스트 제외, 내림차순 상위):

| 순위 | 파일 | LOC | 분해 근거 |
|---|---|---|---|
| 1 | `config/EntityForm.tsx` | 1074 | map-core-model이 지적한 5단계 상속(Base→Validation→Data→Actions→Extensions)이 "파일만 쪼갠 단일 God Object"임을 그대로 인정. `fetchData()`가 `useSession()` React 훅을 클래스 메서드 안에서 호출(rules-of-hooks 위반, eslint-disable로 억제)하는 것도 이 파일의 책임 과다를 보여주는 증거. **분해 방향**: CRUD 오케스트레이션(EntityForm 자체)과 "React 훅이 필요한 세션 주입"을 완전히 분리 — 세션은 훅이 아니라 `fetchData(session)` 매개변수로 주입받는 함수형 설계로 전환. |
| 2 | `form/SearchForm.ts` | 961 | 검색조건 도메인 모델. in-place mutate(`withPage`/`withSort`/`withFilter`)와 `toJSON()` Map 직렬화 로직이 뒤섞여 있음(map-list-runtime 지적, 재검증 완료 — §7 참고). |
| 3 | `components/fields/view/CardManyToOneView.tsx` | 887 | 단일 view 컴포넌트치고 이례적으로 크다 — 별도 조사 필요(이번 스코프 밖이나 다음 리뷰에서 최우선 후보). |
| 4 | `components/fields/abstract/FormField.tsx` | 862 | 40여 개 필드의 공통 베이스. 크기 자체는 정당화 가능(빌더 패턴+clone+isDirty+validate 모두 여기 응집) — **분해보다는 유지가 맞다**, 단 `field.type === 'manyToOne'`류(§5) 문자열 분기가 새어 들어온 부분만 제거 대상. |
| 5 | `config/form/EntityFormBase.tsx` | 852 | `if (... this instanceof EntityForm)` 형태의 죽은 방어 코드 반복(map-core-model 지적) — EntityFormBase의 유일한 서브클래스가 EntityForm 하나뿐이므로 이 instanceof 체크들은 항상 참이거나 항상 거짓인 코드다. 제거 시 즉시 가독성 개선. |
| 6 | `transfer/Type.ts` | 815 | `field.type === '...'` 스위치 밀집 지역(§5) — 다형성 전환 시 이 파일 크기가 자연히 줄어듦. |
| 7 | `components/list/hooks/useListGridLogic.ts` | 802 | 반환 타입이 `any`(map-list-runtime, `useListGridLogic.ts:38` 재확인) — 크기와 타입 안전성 결여가 겹친 최우선 분해 후보. URL 하이드레이션/초기화 두 effect가 ref 플래그로 암묵 연결(`:451-513,641-675`)돼 분해 시 순서 의존성부터 명시화해야 함. |
| 8 | `components/list/ViewListGrid.tsx` | 745 | 렌더 전용이라 God Object는 아니나, 대응 테스트가 0건(map-quality 확인) — 크기보다 **테스트 부재가 더 급한 문제**. |

**분해 우선순위 제안**: (1) `EntityFormBase.tsx`의 죽은 instanceof 방어 코드 제거 — 위험 없이 즉시 가능, 가장 낮은 비용. (2) `useListGridLogic.ts`의 `any` 반환 타입에 실제 인터페이스 부여 — 타입 안전성 확보가 분해보다 선행돼야 함(타입 없이 쪼개면 경계에서 또 `any`가 샌다). (3) `EntityForm.tsx`의 세션 훅 분리 — 아키텍처 변경이라 별도 스프린트 필요.

---

## 7. 에러 처리 홀 — 전수 재조사

`catch (e) {` 패턴 40건을 grep으로 전수 추출해 각 위치의 catch 뒤 처리를 직접 확인했다. 분류:

**A. 의도된 fallback (정당)** — `misc/index.ts:295,364` 등 포맷/캐시 실패 시 빈 값 반환. 주석으로 의도가 명시됨.

**B. 호스트 콜백 실패의 무음 처리 (문제)** —
- `config/EntityForm.tsx:262,596,709` — `onInitialize`/`onFetchData` 콜백 루프, `// nothing to do` 주석과 `console.error`만. **호출자(폼 렌더링 화면)에 전파되지 않음.**
- `components/form/FieldRenderer.tsx:109,278` — `onChanges` 콜백 루프, 동일 패턴. §2.4에서 지적한 대로 이 IIFE들 자체가 상위 catch 없이 실행되므로, 콜백 루프 밖의 예외는 아예 처리조차 안 됨.
- `transfer/DataExportService.ts:295` — export 처리 중 예외를 콘솔에만 남김. 사용자는 "다운로드가 안 됐는데 왜인지 모르는" 상태에 놓임.
- `transfer/Provider/ExcelProvider.ts:34` — 다운로드 이력 로깅 실패는 무음 처리가 합리적(부가 기능이므로) — 이건 오분류하지 않도록 주의. **정당한 사용.**
- `components/form/ui/buttons/DeleteButton.tsx:91-92` — `postMessage`로 opener에 알리는 실패, UX에 큰 영향 없어 보이나 삭제 후 부모 창 갱신이 안 될 수 있음 — 재확인 필요.

**핵심 지적**: A와 B가 **코드 스타일상 구분되지 않는다** — 둘 다 `catch (e) { console.error(e); }`로 보인다. 최소한 "이건 의도된 graceful degradation"과 "이건 사용자에게 알려야 할 실패"를 구분하는 컨벤션(예: `// intentional-fallback` vs `// TODO: surface to user via onError callback`)이 없으면, 다음 기여자가 B 패턴을 A인 줄 알고 계속 늘릴 위험이 있다.

- **정리 방향**: `EntityForm`에 이미 존재하는 `alertMessages`/`errors` 메커니즘을 활용해, 콜백 실패 시 최소한 `entityForm.alertMessages.push(...)`로 사용자에게 "일부 초기화 로직이 실패했습니다" 수준의 신호라도 남기는 것을 권고. 완전한 예외 전파(throw)는 폼 전체를 깨뜨릴 수 있어 과할 수 있으나, 현재의 완전 무음은 반대쪽 극단이다.

---

## 8. 강점으로 인정할 부분 (공정성)

- `FormField` 추상 계층(빌더 패턴, `clone()`/`copyFields()`, `isDirty()` create/update 분기, `normalizeEmptyValue()`)은 **잘 설계됐고 갈아엎을 필요 없다** — 문제는 그 위에 얹힌 concrete 필드들의 복붙이지, 베이스 설계가 아니다.
- `ListableFormField.viewValue`가 `renderListItemInstance()`를 재사용하도록 오버라이드된 것(`ListableFormField.tsx:247-266`)은 실제로 "목록/상세 View 포맷 통일"이라는 재사용을 달성한 몇 안 되는 성공 사례다.
- 옵트인 서브패스(`excel.ts`/`qr.ts`/`address.ts`/`api-spec.ts`/`xref-price.ts`) + `registry.ts` DI 시임은 이 리포지토리 전체에서 가장 잘 만들어진 부분이다 — "무거운 peer는 opt-in"이라는 원칙이 코드로 정확히 구현됐다.
- 테스트가 있는 곳(48개 파일)의 품질 자체는 스냅샷 남용 0건, skip 0건, 파일당 평균 `expect()` 31회로 실질적이다. 문제는 커버리지의 "분포"이지 "있는 테스트의 질"이 아니다.
- `EntityForm.initialize.test.ts` 등은 실제 프로덕션 회귀(#9)를 근거로 문서화한 모범적 회귀 테스트다.

---

## 9. 프로덕션 준비 종합 판정 (이 심판의 결론)

**펀더멘털은 건재하다.** `FormField`/`SubCollectionField` 상속 계층, DI 레지스트리 패턴, tsconfig의 strict 설정 등 "설계"가 필요한 부분은 이미 합리적으로 되어 있다. 문제는 그 설계 위에서 **실행이 규율 없이 이루어졌다**는 점 — 같은 패턴을 새로 만들 때마다 기존 걸 찾아 쓰지 않고 복붙했고, 그 복붙 과정에서 리터럴 오타(`'date'` vs `'datetime'`)와 연산자 우선순위 실수 같은 "복붙 특유의 버그"가 실제로 발생했다.

**고칠 수 있는가, 근본적인가**: 이 심판이 확인한 항목 중 **90% 이상은 기계적으로 고칠 수 있는 수준**이다(공통 베이스 추출, 함수 재사용, 괄호 추가, re-export 전환). 근본적 재설계가 필요한 것은 `field.type === '...'` 문자열 스위치 확장 모델(§5) 단 하나이며, 이것도 "당장 깨졌다"기보다 "다음 버그의 온상"이라는 예방적 이유에서다.

**착수 순서 권고**:
1. §2.1, 2.2, 2.3 (버그 3건) — 각 1-5줄, 반나절 내 수정+회귀테스트 가능. **최우선.**
2. §2.4 (unhandled rejection) — 2곳 수정, 반나절.
3. §3.1 (SubCollectionField 3variants 통합) — 약 200줄 절감, 1-2일.
4. §3.3, 3.4, 3.5 (FieldRenderer 자기복제, misc/utils 중복, createCacheKey) — 각 반나절~1일, 합산 3-4일.
5. §6 (EntityFormBase 죽은 코드 제거, useListGridLogic 타입 부여) — 1-2일.
6. §3.2, 3.6, 3.7 (Xref 베이스 추출, Date 계열 재편, DataImporter 통합) — 2-3일, 필드 계열 재설계 포함.
7. §5 (문자열 스위치 → 다형성 전환) — 별도 스프린트, 차기 major 아키텍처 과제로 분리.
