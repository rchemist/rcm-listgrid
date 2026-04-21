[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / SearchForm

# Class: SearchForm

Defined in: [listgrid/form/SearchForm.ts:181](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/SearchForm.ts#L181)

## Constructors

### Constructor

> **new SearchForm**(): `SearchForm`

#### Returns

`SearchForm`

## Methods

### create()

> `static` **create**(`props?`): `SearchForm`

Defined in: [listgrid/form/SearchForm.ts:202](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/SearchForm.ts#L202)

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

Defined in: [listgrid/form/SearchForm.ts:301](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/SearchForm.ts#L301)

검색 결과에서 반환된 JSON 을 SearchForm 객체로 만든다.

#### Parameters

##### data

`any`

#### Returns

`SearchForm`

***

### withPage()

> **withPage**(`page`): `this`

Defined in: [listgrid/form/SearchForm.ts:314](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/SearchForm.ts#L314)

#### Parameters

##### page

`number`

#### Returns

`this`

***

### hasPreservedFilters()

> **hasPreservedFilters**(): `boolean`

Defined in: [listgrid/form/SearchForm.ts:319](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/SearchForm.ts#L319)

#### Returns

`boolean`

***

### getPreservedFilters()

> **getPreservedFilters**(): [`SearchValueConfig`](../interfaces/SearchValueConfig.md)[]

Defined in: [listgrid/form/SearchForm.ts:323](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/SearchForm.ts#L323)

#### Returns

[`SearchValueConfig`](../interfaces/SearchValueConfig.md)[]

***

### withPreservedFilters()

> **withPreservedFilters**(...`filters`): `this`

Defined in: [listgrid/form/SearchForm.ts:327](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/SearchForm.ts#L327)

#### Parameters

##### filters

...[`SearchValueConfig`](../interfaces/SearchValueConfig.md)[]

#### Returns

`this`

***

### withPageSize()

> **withPageSize**(`pageSize`): `this`

Defined in: [listgrid/form/SearchForm.ts:332](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/SearchForm.ts#L332)

#### Parameters

##### pageSize

`number`

#### Returns

`this`

***

### withSort()

> **withSort**(`fieldName`, `direction?`): `this`

Defined in: [listgrid/form/SearchForm.ts:337](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/SearchForm.ts#L337)

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

Defined in: [listgrid/form/SearchForm.ts:360](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/SearchForm.ts#L360)

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

Defined in: [listgrid/form/SearchForm.ts:408](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/SearchForm.ts#L408)

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

Defined in: [listgrid/form/SearchForm.ts:438](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/SearchForm.ts#L438)

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

Defined in: [listgrid/form/SearchForm.ts:452](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/SearchForm.ts#L452)

#### Returns

`boolean`

***

### withShouldReturnEmpty()

> **withShouldReturnEmpty**(`shouldReturnEmpty`): `this`

Defined in: [listgrid/form/SearchForm.ts:456](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/SearchForm.ts#L456)

#### Parameters

##### shouldReturnEmpty

`boolean`

#### Returns

`this`

***

### removeFilter()

> **removeFilter**(`fieldName`): `this`

Defined in: [listgrid/form/SearchForm.ts:461](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/SearchForm.ts#L461)

#### Parameters

##### fieldName

`string`

#### Returns

`this`

***

### withIgnoreCache()

> **withIgnoreCache**(`ignoreCache?`): `this`

Defined in: [listgrid/form/SearchForm.ts:475](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/SearchForm.ts#L475)

#### Parameters

##### ignoreCache?

`boolean`

#### Returns

`this`

***

### clearFilters()

> **clearFilters**(): `SearchForm`

Defined in: [listgrid/form/SearchForm.ts:480](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/SearchForm.ts#L480)

#### Returns

`SearchForm`

***

### clearSorts()

> **clearSorts**(): `SearchForm`

Defined in: [listgrid/form/SearchForm.ts:485](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/SearchForm.ts#L485)

#### Returns

`SearchForm`

***

### getFilters()

> **getFilters**(): `Map`\<`"AND"` \| `"OR"`, [`FilterItem`](../interfaces/FilterItem.md)[]\>

Defined in: [listgrid/form/SearchForm.ts:490](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/SearchForm.ts#L490)

#### Returns

`Map`\<`"AND"` \| `"OR"`, [`FilterItem`](../interfaces/FilterItem.md)[]\>

***

### getSorts()

> **getSorts**(): `Map`\<`string`, [`Direction`](../type-aliases/Direction.md)\>

Defined in: [listgrid/form/SearchForm.ts:494](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/SearchForm.ts#L494)

#### Returns

`Map`\<`string`, [`Direction`](../type-aliases/Direction.md)\>

***

### filterValues()

> **filterValues**(): `Map`\<`string`, `string` \| `string`[]\>

Defined in: [listgrid/form/SearchForm.ts:498](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/SearchForm.ts#L498)

#### Returns

`Map`\<`string`, `string` \| `string`[]\>

***

### filterItems()

> **filterItems**(): `Map`\<`string`, \{ `value`: `string` \| `string`[]; `operator`: [`QueryConditionType`](../type-aliases/QueryConditionType.md); \}\>

Defined in: [listgrid/form/SearchForm.ts:514](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/SearchForm.ts#L514)

#### Returns

`Map`\<`string`, \{ `value`: `string` \| `string`[]; `operator`: [`QueryConditionType`](../type-aliases/QueryConditionType.md); \}\>

***

### getPage()

> **getPage**(): `number`

Defined in: [listgrid/form/SearchForm.ts:536](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/SearchForm.ts#L536)

#### Returns

`number`

***

### getPageSize()

> **getPageSize**(): `number`

Defined in: [listgrid/form/SearchForm.ts:540](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/SearchForm.ts#L540)

#### Returns

`number`

***

### getFilter()

> **getFilter**(`name`): `object`[]

Defined in: [listgrid/form/SearchForm.ts:544](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/SearchForm.ts#L544)

#### Parameters

##### name

`string`

#### Returns

`object`[]

***

### isFilteredOrSorted()

> **isFilteredOrSorted**(...`fieldNames`): `boolean`

Defined in: [listgrid/form/SearchForm.ts:558](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/SearchForm.ts#L558)

#### Parameters

##### fieldNames

...`string`[]

#### Returns

`boolean`

***

### clearFilterAndSort()

> **clearFilterAndSort**(): `this`

Defined in: [listgrid/form/SearchForm.ts:583](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/SearchForm.ts#L583)

#### Returns

`this`

***

### getSortDirection()

> **getSortDirection**(`name`): [`Direction`](../type-aliases/Direction.md) \| `null`

Defined in: [listgrid/form/SearchForm.ts:589](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/SearchForm.ts#L589)

#### Parameters

##### name

`string`

#### Returns

[`Direction`](../type-aliases/Direction.md) \| `null`

***

### getSearchValue()

> **getSearchValue**(`name`): `string` \| `string`[] \| `null` \| `undefined`

Defined in: [listgrid/form/SearchForm.ts:596](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/SearchForm.ts#L596)

#### Parameters

##### name

`string`

#### Returns

`string` \| `string`[] \| `null` \| `undefined`

***

### getFiltersByCondition()

> **getFiltersByCondition**(`condition`): [`FilterItem`](../interfaces/FilterItem.md)[]

Defined in: [listgrid/form/SearchForm.ts:616](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/SearchForm.ts#L616)

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

Defined in: [listgrid/form/SearchForm.ts:625](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/SearchForm.ts#L625)

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

Defined in: [listgrid/form/SearchForm.ts:649](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/SearchForm.ts#L649)

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

Defined in: [listgrid/form/SearchForm.ts:677](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/SearchForm.ts#L677)

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

Defined in: [listgrid/form/SearchForm.ts:755](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/SearchForm.ts#L755)

빠른검색 값 조회

#### Returns

`string` \| `null`

빠른검색 값 또는 null

***

### getQuickSearchFields()

> **getQuickSearchFields**(): `string`[]

Defined in: [listgrid/form/SearchForm.ts:789](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/SearchForm.ts#L789)

빠른검색 대상 필드 목록 조회

#### Returns

`string`[]

빠른검색 대상 필드 배열

***

### clone()

> **clone**(): `SearchForm`

Defined in: [listgrid/form/SearchForm.ts:793](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/SearchForm.ts#L793)

#### Returns

`SearchForm`

***

### getFilterOperator()

> **getFilterOperator**(`fieldName`): [`QueryConditionType`](../type-aliases/QueryConditionType.md) \| `undefined`

Defined in: [listgrid/form/SearchForm.ts:845](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/SearchForm.ts#L845)

#### Parameters

##### fieldName

`string`

#### Returns

[`QueryConditionType`](../type-aliases/QueryConditionType.md) \| `undefined`

***

### withViewDetail()

> **withViewDetail**(`viewDetail`): `this`

Defined in: [listgrid/form/SearchForm.ts:861](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/SearchForm.ts#L861)

#### Parameters

##### viewDetail

`boolean`

#### Returns

`this`

***

### hasFilters()

> **hasFilters**(): `boolean`

Defined in: [listgrid/form/SearchForm.ts:866](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/SearchForm.ts#L866)

#### Returns

`boolean`

***

### getCacheKey()

> **getCacheKey**(): `string`

Defined in: [listgrid/form/SearchForm.ts:875](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/SearchForm.ts#L875)

#### Returns

`string`
