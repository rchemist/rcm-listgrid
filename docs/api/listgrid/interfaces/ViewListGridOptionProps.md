[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ViewListGridOptionProps

# Interface: ViewListGridOptionProps

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:59](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGrid.types.ts#L59)

## Properties

### hideTitle?

> `optional` **hideTitle?**: `boolean`

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:60](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGrid.types.ts#L60)

***

### onDragPriority?

> `optional` **onDragPriority?**: `object`

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:61](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGrid.types.ts#L61)

#### support

> **support**: `boolean`

#### onModify?

> `optional` **onModify?**: (`changed`) => `Promise`\<`void`\>

##### Parameters

###### changed

`Map`\<`string`, `number`\>

##### Returns

`Promise`\<`void`\>

***

### onDrag?

> `optional` **onDrag?**: (`idList`) => `void`

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:62](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGrid.types.ts#L62)

#### Parameters

##### idList

`string`[]

#### Returns

`void`

***

### useAccordion?

> `optional` **useAccordion?**: `object`

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:63](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGrid.types.ts#L63)

#### render

> **render**: (`item`, `router`) => `Promise`\<`ReactNode`\>

##### Parameters

###### item

`any`

###### router

`any`

##### Returns

`Promise`\<`ReactNode`\>

***

### readonly?

> `optional` **readonly?**: `boolean`

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:64](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGrid.types.ts#L64)

***

### subCollection?

> `optional` **subCollection?**: [`SubCollectionProps`](SubCollectionProps.md)

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:65](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGrid.types.ts#L65)

***

### onSelect?

> `optional` **onSelect?**: (`item`, `setManagedId`) => `void`

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:66](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGrid.types.ts#L66)

#### Parameters

##### item

`any`

##### setManagedId

(`value`) => `void`

#### Returns

`void`

***

### manyToOne?

> `optional` **manyToOne?**: `object`

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:67](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGrid.types.ts#L67)

#### onSelect

> **onSelect**: (`item`, `setManagedId`) => `void`

##### Parameters

###### item

`any`

###### setManagedId

(`value`) => `void`

##### Returns

`void`

***

### popup?

> `optional` **popup?**: `boolean`

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:68](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGrid.types.ts#L68)

***

### filterable?

> `optional` **filterable?**: `boolean`

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:69](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGrid.types.ts#L69)

***

### sortable?

> `optional` **sortable?**: `boolean`

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:70](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGrid.types.ts#L70)

***

### createOrUpdate?

> `optional` **createOrUpdate?**: [`CreateUpdateOptions`](CreateUpdateOptions.md)

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:71](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGrid.types.ts#L71)

***

### delete?

> `optional` **delete?**: `object`

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:72](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGrid.types.ts#L72)

#### onDelete?

> `optional` **onDelete?**: (`entityForm`, `rows`, `checkedItems`) => `Promise`\<[`EntityFormActionResult`](EntityFormActionResult.md)\>

##### Parameters

###### entityForm

[`EntityForm`](../classes/EntityForm.md)

###### rows

`any`[]

###### checkedItems

`string`[]

##### Returns

`Promise`\<[`EntityFormActionResult`](EntityFormActionResult.md)\>

#### postDelete?

> `optional` **postDelete?**: (`entityForm`, `rows`, `checkedItems`) => `Promise`\<`void`\>

##### Parameters

###### entityForm

[`EntityForm`](../classes/EntityForm.md)

###### rows

`any`[]

###### checkedItems

`string`[]

##### Returns

`Promise`\<`void`\>

***

### selection?

> `optional` **selection?**: [`SelectionOptions`](SelectionOptions.md)

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:81](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGrid.types.ts#L81)

***

### filters?

> `optional` **filters?**: (`entityForm`) => `Promise`\<`object`[]\>

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:83](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGrid.types.ts#L83)

#### Parameters

##### entityForm

[`EntityForm`](../classes/EntityForm.md)

#### Returns

`Promise`\<`object`[]\>

***

### fields?

> `optional` **fields?**: [`ListableFormField`](../classes/ListableFormField.md)\<`any`, `any`, `any`\>[]

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:86](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGrid.types.ts#L86)

***

### onFetched?

> `optional` **onFetched?**: [`PostFetchListData`](../type-aliases/PostFetchListData.md)

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:87](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGrid.types.ts#L87)

***

### headerButtons?

> `optional` **headerButtons?**: (`props`) => `Promise`\<`ReactNode`\>[]

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:88](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGrid.types.ts#L88)

#### Parameters

##### props

[`ListGridHeaderButtonProps`](ListGridHeaderButtonProps.md)

#### Returns

`Promise`\<`ReactNode`\>

***

### cacheable?

> `optional` **cacheable?**: `boolean`

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:89](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGrid.types.ts#L89)

***

### messages?

> `optional` **messages?**: `object`

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:90](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGrid.types.ts#L90)

#### noData?

> `optional` **noData?**: `string`

***

### topContent?

> `optional` **topContent?**: (`parentId`, `searchForm?`) => `ReactNode`

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:93](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGrid.types.ts#L93)

#### Parameters

##### parentId

`string`

##### searchForm?

[`SearchForm`](../classes/SearchForm.md)

#### Returns

`ReactNode`

***

### defaultPageSize?

> `optional` **defaultPageSize?**: `number`

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:94](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGrid.types.ts#L94)

***

### hidePageSize?

> `optional` **hidePageSize?**: `boolean`

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:95](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGrid.types.ts#L95)

***

### hidePagination?

> `optional` **hidePagination?**: `boolean`

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:96](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGrid.types.ts#L96)

***

### hideAdvancedSearch?

> `optional` **hideAdvancedSearch?**: `boolean`

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:97](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGrid.types.ts#L97)

***

### openInNewWindow?

> `optional` **openInNewWindow?**: [`OpenInNewWindowOptions`](OpenInNewWindowOptions.md)

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:102](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGrid.types.ts#L102)

새창 열기 버튼 설정
활성화 시 각 행의 오른쪽에 새창으로 열기 버튼이 표시됩니다.

***

### urlSync?

> `optional` **urlSync?**: `boolean` \| [`UrlSyncOptions`](UrlSyncOptions.md)

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:111](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGrid.types.ts#L111)

URL 동기화 설정
페이징, 검색, 필터, 정렬 상태를 URL 쿼리 파라미터와 동기화
- true: 기본 옵션으로 활성화
- false: 비활성화
- UrlSyncOptions: 세부 옵션 지정
기본값: 메인 엔티티(subCollection이 아닌)에서 자동 활성화
