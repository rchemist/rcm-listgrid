[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / AbstractRowItemProps

# Interface: AbstractRowItemProps

Defined in: [listgrid/components/list/types/RowItem.types.ts:52](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/RowItem.types.ts#L52)

## Extends

- [`ViewFieldManageable`](ViewFieldManageable.md)

## Extended by

- [`ViewRowItemProps`](ViewRowItemProps.md)
- [`RowItemProps`](RowItemProps.md)

## Properties

### fields

> **fields**: [`ListableFormField`](../classes/ListableFormField.md)\<`any`, `any`, `any`\>[]

Defined in: [listgrid/components/list/types/RowItem.types.ts:53](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/RowItem.types.ts#L53)

***

### router

> **router**: `any`

Defined in: [listgrid/components/list/types/RowItem.types.ts:54](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/RowItem.types.ts#L54)

***

### path

> **path**: `any`

Defined in: [listgrid/components/list/types/RowItem.types.ts:55](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/RowItem.types.ts#L55)

***

### entityForm

> **entityForm**: [`EntityForm`](../classes/EntityForm.md)

Defined in: [listgrid/components/list/types/RowItem.types.ts:56](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/RowItem.types.ts#L56)

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

***

### onRefresh?

> `optional` **onRefresh?**: () => `void`

Defined in: [listgrid/components/list/types/RowItem.types.ts:62](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/RowItem.types.ts#L62)

#### Returns

`void`

***

### viewFields

> **viewFields**: `string`[]

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:167](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGrid.types.ts#L167)

#### Inherited from

[`ViewFieldManageable`](ViewFieldManageable.md).[`viewFields`](ViewFieldManageable.md#viewfields)

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

[`ViewFieldManageable`](ViewFieldManageable.md).[`setViewFields`](ViewFieldManageable.md#setviewfields)
