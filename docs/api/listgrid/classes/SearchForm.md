[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / SearchForm

# Class: SearchForm

Defined in: [listgrid/form/SearchForm.ts:188](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/SearchForm.ts#L188)

## Constructors

### Constructor

> **new SearchForm**(): `SearchForm`

#### Returns

`SearchForm`

## Methods

### create()

> `static` **create**(`props?`): `SearchForm`

Defined in: [listgrid/form/SearchForm.ts:209](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/SearchForm.ts#L209)

#### Parameters

##### props?

###### page?

`number`

###### pageSize?

`number`

#### Returns

`SearchForm`

***

### deserialize()

> `static` **deserialize**(`data`): `SearchForm`

Defined in: [listgrid/form/SearchForm.ts:308](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/SearchForm.ts#L308)

검색 결과에서 반환된 JSON 을 SearchForm 객체로 만든다.

#### Parameters

##### data

`any`

#### Returns

`SearchForm`

***

### withPage()

> **withPage**(`page`): `this`

Defined in: [listgrid/form/SearchForm.ts:321](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/SearchForm.ts#L321)

#### Parameters

##### page

`number`

#### Returns

`this`

***

### hasPreservedFilters()

> **hasPreservedFilters**(): `boolean`

Defined in: [listgrid/form/SearchForm.ts:326](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/SearchForm.ts#L326)

#### Returns

`boolean`

***

### getPreservedFilters()

> **getPreservedFilters**(): [`SearchValueConfig`](../interfaces/SearchValueConfig.md)[]

Defined in: [listgrid/form/SearchForm.ts:330](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/SearchForm.ts#L330)

#### Returns

[`SearchValueConfig`](../interfaces/SearchValueConfig.md)[]

***

### withPreservedFilters()

> **withPreservedFilters**(...`filters`): `this`

Defined in: [listgrid/form/SearchForm.ts:334](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/SearchForm.ts#L334)

#### Parameters

##### filters

...[`SearchValueConfig`](../interfaces/SearchValueConfig.md)[]

#### Returns

`this`

***

### withPageSize()

> **withPageSize**(`pageSize`): `this`

Defined in: [listgrid/form/SearchForm.ts:339](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/SearchForm.ts#L339)

#### Parameters

##### pageSize

`number`

#### Returns

`this`

***

### withSort()

> **withSort**(`fieldName`, `direction?`): `this`

Defined in: [listgrid/form/SearchForm.ts:344](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/SearchForm.ts#L344)

#### Parameters

##### fieldName

`string`

##### direction?

[`Direction`](../type-aliases/Direction.md)

#### Returns

`this`

***

### handleAndFilter()

> **handleAndFilter**(`fieldName`, `value`, `op?`, `not?`): `this`

Defined in: [listgrid/form/SearchForm.ts:367](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/SearchForm.ts#L367)

#### Parameters

##### fieldName

`string`

##### value

`string` \| `number` \| `boolean` \| readonly (`string` \| `number` \| `boolean`)[] \| `null` \| `undefined`

##### op?

[`QueryConditionType`](../type-aliases/QueryConditionType.md)

##### not?

`boolean`

#### Returns

`this`

***

### withFilter()

> **withFilter**(`condition`, ...`filterItems`): `this`

Defined in: [listgrid/form/SearchForm.ts:415](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/SearchForm.ts#L415)

#### Parameters

##### condition

`"AND"` \| `"OR"`

##### filterItems

...[`FilterItem`](../interfaces/FilterItem.md)[]

#### Returns

`this`

***

### withFilterIgnoreDuplicate()

> **withFilterIgnoreDuplicate**(`condition`, ...`filterItems`): `this`

Defined in: [listgrid/form/SearchForm.ts:445](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/SearchForm.ts#L445)

#### Parameters

##### condition

`"AND"` \| `"OR"`

##### filterItems

...[`FilterItem`](../interfaces/FilterItem.md)[]

#### Returns

`this`

***

### isShouldReturnEmpty()

> **isShouldReturnEmpty**(): `boolean`

Defined in: [listgrid/form/SearchForm.ts:459](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/SearchForm.ts#L459)

#### Returns

`boolean`

***

### withShouldReturnEmpty()

> **withShouldReturnEmpty**(`shouldReturnEmpty`): `this`

Defined in: [listgrid/form/SearchForm.ts:463](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/SearchForm.ts#L463)

#### Parameters

##### shouldReturnEmpty

`boolean`

#### Returns

`this`

***

### removeFilter()

> **removeFilter**(`fieldName`): `this`

Defined in: [listgrid/form/SearchForm.ts:468](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/SearchForm.ts#L468)

#### Parameters

##### fieldName

`string`

#### Returns

`this`

***

### withIgnoreCache()

> **withIgnoreCache**(`ignoreCache?`): `this`

Defined in: [listgrid/form/SearchForm.ts:482](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/SearchForm.ts#L482)

#### Parameters

##### ignoreCache?

`boolean`

#### Returns

`this`

***

### clearFilters()

> **clearFilters**(): `SearchForm`

Defined in: [listgrid/form/SearchForm.ts:487](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/SearchForm.ts#L487)

#### Returns

`SearchForm`

***

### clearSorts()

> **clearSorts**(): `SearchForm`

Defined in: [listgrid/form/SearchForm.ts:492](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/SearchForm.ts#L492)

#### Returns

`SearchForm`

***

### getFilters()

> **getFilters**(): `Map`\<`"AND"` \| `"OR"`, [`FilterItem`](../interfaces/FilterItem.md)[]\>

Defined in: [listgrid/form/SearchForm.ts:497](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/SearchForm.ts#L497)

#### Returns

`Map`\<`"AND"` \| `"OR"`, [`FilterItem`](../interfaces/FilterItem.md)[]\>

***

### getSorts()

> **getSorts**(): `Map`\<`string`, [`Direction`](../type-aliases/Direction.md)\>

Defined in: [listgrid/form/SearchForm.ts:501](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/SearchForm.ts#L501)

#### Returns

`Map`\<`string`, [`Direction`](../type-aliases/Direction.md)\>

***

### filterValues()

> **filterValues**(): `Map`\<`string`, `string` \| `string`[]\>

Defined in: [listgrid/form/SearchForm.ts:505](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/SearchForm.ts#L505)

#### Returns

`Map`\<`string`, `string` \| `string`[]\>

***

### filterItems()

> **filterItems**(): `Map`\<`string`, \{ `value`: `string` \| `string`[]; `operator`: [`QueryConditionType`](../type-aliases/QueryConditionType.md); \}\>

Defined in: [listgrid/form/SearchForm.ts:521](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/SearchForm.ts#L521)

#### Returns

`Map`\<`string`, \{ `value`: `string` \| `string`[]; `operator`: [`QueryConditionType`](../type-aliases/QueryConditionType.md); \}\>

***

### getPage()

> **getPage**(): `number`

Defined in: [listgrid/form/SearchForm.ts:543](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/SearchForm.ts#L543)

#### Returns

`number`

***

### getPageSize()

> **getPageSize**(): `number`

Defined in: [listgrid/form/SearchForm.ts:547](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/SearchForm.ts#L547)

#### Returns

`number`

***

### getFilter()

> **getFilter**(`name`): `object`[]

Defined in: [listgrid/form/SearchForm.ts:551](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/SearchForm.ts#L551)

#### Parameters

##### name

`string`

#### Returns

`object`[]

***

### isFilteredOrSorted()

> **isFilteredOrSorted**(...`fieldNames`): `boolean`

Defined in: [listgrid/form/SearchForm.ts:565](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/SearchForm.ts#L565)

#### Parameters

##### fieldNames

...`string`[]

#### Returns

`boolean`

***

### clearFilterAndSort()

> **clearFilterAndSort**(): `this`

Defined in: [listgrid/form/SearchForm.ts:590](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/SearchForm.ts#L590)

#### Returns

`this`

***

### getSortDirection()

> **getSortDirection**(`name`): [`Direction`](../type-aliases/Direction.md) \| `null`

Defined in: [listgrid/form/SearchForm.ts:596](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/SearchForm.ts#L596)

#### Parameters

##### name

`string`

#### Returns

[`Direction`](../type-aliases/Direction.md) \| `null`

***

### getSearchValue()

> **getSearchValue**(`name`): `string` \| `string`[] \| `null` \| `undefined`

Defined in: [listgrid/form/SearchForm.ts:603](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/SearchForm.ts#L603)

#### Parameters

##### name

`string`

#### Returns

`string` \| `string`[] \| `null` \| `undefined`

***

### getFiltersByCondition()

> **getFiltersByCondition**(`condition`): [`FilterItem`](../interfaces/FilterItem.md)[]

Defined in: [listgrid/form/SearchForm.ts:623](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/SearchForm.ts#L623)

조건 유형별 필터 조회

#### Parameters

##### condition

`"AND"` \| `"OR"`

'AND' 또는 'OR'

#### Returns

[`FilterItem`](../interfaces/FilterItem.md)[]

해당 조건의 FilterItem 배열

***

### getSearchValueFromAnyCondition()

> **getSearchValueFromAnyCondition**(`name`): `string` \| `string`[] \| `null` \| `undefined`

Defined in: [listgrid/form/SearchForm.ts:632](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/SearchForm.ts#L632)

AND/OR 양쪽 조건에서 값 조회 (AND 우선)

#### Parameters

##### name

`string`

필드명

#### Returns

`string` \| `string`[] \| `null` \| `undefined`

필터 값 또는 null

***

### buildQuickSearchFilter()

> **buildQuickSearchFilter**(`value`, `fields`): [`FilterItem`](../interfaces/FilterItem.md)

Defined in: [listgrid/form/SearchForm.ts:656](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/SearchForm.ts#L656)

다중 필드 OR 검색 필터 생성

#### Parameters

##### value

`string`

검색값

##### fields

`string`[]

검색 대상 필드 배열

#### Returns

[`FilterItem`](../interfaces/FilterItem.md)

subFilters를 포함한 FilterItem

***

### handleQuickSearch()

> **handleQuickSearch**(`value`, `fields`): `this`

Defined in: [listgrid/form/SearchForm.ts:684](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/SearchForm.ts#L684)

빠른검색 처리 (AND 조건에 subFilters(OR)를 추가)

결과 쿼리 예시:
(name LIKE '%검색어%' OR studentNumber LIKE '%검색어%') AND isActive = true

#### Parameters

##### value

`string`

검색값 (빈 문자열이면 필터 제거)

##### fields

`string`[]

검색 대상 필드 배열

#### Returns

`this`

***

### getQuickSearchValue()

> **getQuickSearchValue**(): `string` \| `null`

Defined in: [listgrid/form/SearchForm.ts:762](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/SearchForm.ts#L762)

빠른검색 값 조회

#### Returns

`string` \| `null`

빠른검색 값 또는 null

***

### getQuickSearchFields()

> **getQuickSearchFields**(): `string`[]

Defined in: [listgrid/form/SearchForm.ts:796](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/SearchForm.ts#L796)

빠른검색 대상 필드 목록 조회

#### Returns

`string`[]

빠른검색 대상 필드 배열

***

### clone()

> **clone**(): `SearchForm`

Defined in: [listgrid/form/SearchForm.ts:800](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/SearchForm.ts#L800)

#### Returns

`SearchForm`

***

### getFilterOperator()

> **getFilterOperator**(`fieldName`): [`QueryConditionType`](../type-aliases/QueryConditionType.md) \| `undefined`

Defined in: [listgrid/form/SearchForm.ts:852](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/SearchForm.ts#L852)

#### Parameters

##### fieldName

`string`

#### Returns

[`QueryConditionType`](../type-aliases/QueryConditionType.md) \| `undefined`

***

### withViewDetail()

> **withViewDetail**(`viewDetail`): `this`

Defined in: [listgrid/form/SearchForm.ts:868](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/SearchForm.ts#L868)

#### Parameters

##### viewDetail

`boolean`

#### Returns

`this`

***

### hasFilters()

> **hasFilters**(): `boolean`

Defined in: [listgrid/form/SearchForm.ts:873](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/SearchForm.ts#L873)

#### Returns

`boolean`

***

### getCacheKey()

> **getCacheKey**(): `string`

Defined in: [listgrid/form/SearchForm.ts:882](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/SearchForm.ts#L882)

#### Returns

`string`
