[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / RowItemProps

# Interface: RowItemProps

Defined in: [listgrid/components/list/types/RowItem.types.ts:65](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/RowItem.types.ts#L65)

## Extends

- [`AbstractRowItemProps`](AbstractRowItemProps.md)

## Properties

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

### clickAccordion?

> `optional` **clickAccordion?**: () => `void`

Defined in: [listgrid/components/list/types/RowItem.types.ts:66](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/RowItem.types.ts#L66)

#### Returns

`void`

***

### item

> **item**: `any`

Defined in: [listgrid/components/list/types/RowItem.types.ts:67](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/RowItem.types.ts#L67)

***

### index

> **index**: `number`

Defined in: [listgrid/components/list/types/RowItem.types.ts:68](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/RowItem.types.ts#L68)

***

### viewMode

> **viewMode**: `"popup"` \| `"page"`

Defined in: [listgrid/components/list/types/RowItem.types.ts:69](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/RowItem.types.ts#L69)

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
