[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ViewRowItemProps

# Interface: ViewRowItemProps

Defined in: [listgrid/components/list/types/RowItem.types.ts:22](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/RowItem.types.ts#L22)

## Extends

- [`AbstractRowItemProps`](AbstractRowItemProps.md).[`ItemCheckable`](ItemCheckable.md)

## Properties

### session?

> `optional` **session?**: [`Session`](Session.md)

Defined in: [listgrid/components/list/types/RowItem.types.ts:23](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/RowItem.types.ts#L23)

***

### isAdmin?

> `optional` **isAdmin?**: `boolean`

Defined in: [listgrid/components/list/types/RowItem.types.ts:25](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/RowItem.types.ts#L25)

관리자 권한 여부 (부모에서 계산하여 전달)

***

### isSubCollection

> **isSubCollection**: `boolean`

Defined in: [listgrid/components/list/types/RowItem.types.ts:26](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/RowItem.types.ts#L26)

***

### list

> **list**: `any`[]

Defined in: [listgrid/components/list/types/RowItem.types.ts:27](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/RowItem.types.ts#L27)

***

### enableCheckItem

> **enableCheckItem**: `boolean`

Defined in: [listgrid/components/list/types/RowItem.types.ts:28](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/RowItem.types.ts#L28)

***

### managePriority

> **managePriority**: `boolean`

Defined in: [listgrid/components/list/types/RowItem.types.ts:29](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/RowItem.types.ts#L29)

***

### startNumber

> **startNumber**: `number`

Defined in: [listgrid/components/list/types/RowItem.types.ts:30](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/RowItem.types.ts#L30)

***

### onDrag?

> `optional` **onDrag?**: (`idList`) => `void`

Defined in: [listgrid/components/list/types/RowItem.types.ts:31](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/RowItem.types.ts#L31)

#### Parameters

##### idList

`string`[]

#### Returns

`void`

***

### useAccordion?

> `optional` **useAccordion?**: `object`

Defined in: [listgrid/components/list/types/RowItem.types.ts:32](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/RowItem.types.ts#L32)

#### render

> **render**: (`item`, `refresh`) => `Promise`\<`ReactNode`\>

##### Parameters

###### item

`any`

###### refresh

() => `void`

##### Returns

`Promise`\<`ReactNode`\>

***

### sortRowsPriority?

> `optional` **sortRowsPriority?**: (`rows`) => `Promise`\<`void`\>

Defined in: [listgrid/components/list/types/RowItem.types.ts:35](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/RowItem.types.ts#L35)

#### Parameters

##### rows

`any`[]

#### Returns

`Promise`\<`void`\>

***

### messages?

> `optional` **messages?**: `object`

Defined in: [listgrid/components/list/types/RowItem.types.ts:36](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/RowItem.types.ts#L36)

#### noData?

> `optional` **noData?**: `string`

***

### viewMode

> **viewMode**: `"popup"` \| `"page"`

Defined in: [listgrid/components/list/types/RowItem.types.ts:39](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/RowItem.types.ts#L39)

***

### selectionOptions?

> `optional` **selectionOptions?**: [`SelectionOptions`](SelectionOptions.md)

Defined in: [listgrid/components/list/types/RowItem.types.ts:40](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/RowItem.types.ts#L40)

***

### showCheckboxInput?

> `optional` **showCheckboxInput?**: `boolean`

Defined in: [listgrid/components/list/types/RowItem.types.ts:41](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/RowItem.types.ts#L41)

***

### openInNewWindow?

> `optional` **openInNewWindow?**: [`OpenInNewWindowOptions`](OpenInNewWindowOptions.md)

Defined in: [listgrid/components/list/types/RowItem.types.ts:43](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/RowItem.types.ts#L43)

새창 열기 버튼 옵션

***

### inlineExpansion?

> `optional` **inlineExpansion?**: [`InlineExpansionState`](InlineExpansionState.md)

Defined in: [listgrid/components/list/types/RowItem.types.ts:45](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/RowItem.types.ts#L45)

SubCollection 인라인 확장 상태 (depth <= maxInlineDepth일 때 사용)

***

### mappedBy?

> `optional` **mappedBy?**: `string`

Defined in: [listgrid/components/list/types/RowItem.types.ts:47](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/RowItem.types.ts#L47)

SubCollection mappedBy 필드 (부모 참조 필드) - ViewEntityForm에서 자동 숨김 처리

***

### inlineViewReadonly?

> `optional` **inlineViewReadonly?**: `boolean`

Defined in: [listgrid/components/list/types/RowItem.types.ts:49](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/RowItem.types.ts#L49)

인라인/상세 뷰에서 수정 불가 여부 (readonly 또는 modifyOnView: false일 때 true)

***

### fields

> **fields**: [`ListableFormField`](../classes/ListableFormField.md)\<`any`, `any`, `any`\>[]

Defined in: [listgrid/components/list/types/RowItem.types.ts:53](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/RowItem.types.ts#L53)

#### Inherited from

[`AbstractRowItemProps`](AbstractRowItemProps.md).[`fields`](AbstractRowItemProps.md#fields)

***

### router

> **router**: `any`

Defined in: [listgrid/components/list/types/RowItem.types.ts:54](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/RowItem.types.ts#L54)

#### Inherited from

[`AbstractRowItemProps`](AbstractRowItemProps.md).[`router`](AbstractRowItemProps.md#router)

***

### path

> **path**: `any`

Defined in: [listgrid/components/list/types/RowItem.types.ts:55](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/RowItem.types.ts#L55)

#### Inherited from

[`AbstractRowItemProps`](AbstractRowItemProps.md).[`path`](AbstractRowItemProps.md#path)

***

### entityForm

> **entityForm**: [`EntityForm`](../classes/EntityForm.md)

Defined in: [listgrid/components/list/types/RowItem.types.ts:56](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/RowItem.types.ts#L56)

#### Inherited from

[`AbstractRowItemProps`](AbstractRowItemProps.md).[`entityForm`](AbstractRowItemProps.md#entityform)

***

### onSelect?

> `optional` **onSelect?**: (`item`, `setManagedId?`, `clearFilterAndSort?`) => `void`

Defined in: [listgrid/components/list/types/RowItem.types.ts:57](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/RowItem.types.ts#L57)

#### Parameters

##### item

`any`

##### setManagedId?

(`value`) => `void`

##### clearFilterAndSort?

() => `void`

#### Returns

`void`

#### Inherited from

[`AbstractRowItemProps`](AbstractRowItemProps.md).[`onSelect`](AbstractRowItemProps.md#onselect)

***

### onRefresh?

> `optional` **onRefresh?**: () => `void`

Defined in: [listgrid/components/list/types/RowItem.types.ts:62](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/RowItem.types.ts#L62)

#### Returns

`void`

#### Inherited from

[`AbstractRowItemProps`](AbstractRowItemProps.md).[`onRefresh`](AbstractRowItemProps.md#onrefresh)

***

### viewFields

> **viewFields**: `string`[]

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:167](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGrid.types.ts#L167)

#### Inherited from

[`AbstractRowItemProps`](AbstractRowItemProps.md).[`viewFields`](AbstractRowItemProps.md#viewfields)

***

### setViewFields?

> `optional` **setViewFields?**: (`viewFields`) => `void`

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:168](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGrid.types.ts#L168)

#### Parameters

##### viewFields

`string`[]

#### Returns

`void`

#### Inherited from

[`AbstractRowItemProps`](AbstractRowItemProps.md).[`setViewFields`](AbstractRowItemProps.md#setviewfields)

***

### checkedItems

> **checkedItems**: `any`[]

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:172](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGrid.types.ts#L172)

#### Inherited from

[`ItemCheckable`](ItemCheckable.md).[`checkedItems`](ItemCheckable.md#checkeditems)

***

### setCheckedItems?

> `optional` **setCheckedItems?**: (`itemIds`) => `void`

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:173](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGrid.types.ts#L173)

#### Parameters

##### itemIds

`any`[]

#### Returns

`void`

#### Inherited from

[`ItemCheckable`](ItemCheckable.md).[`setCheckedItems`](ItemCheckable.md#setcheckeditems)
