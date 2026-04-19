[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / InlineExpansionState

# Interface: InlineExpansionState

Defined in: [listgrid/components/list/types/RowItem.types.ts:13](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/list/types/RowItem.types.ts#L13)

Inline expansion state for SubCollection

## Properties

### expandedItems

> **expandedItems**: `string`[]

Defined in: [listgrid/components/list/types/RowItem.types.ts:14](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/list/types/RowItem.types.ts#L14)

***

### isExpanded

> **isExpanded**: (`id`) => `boolean`

Defined in: [listgrid/components/list/types/RowItem.types.ts:15](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/list/types/RowItem.types.ts#L15)

#### Parameters

##### id

`string`

#### Returns

`boolean`

***

### toggleExpansion

> **toggleExpansion**: (`id`) => `void`

Defined in: [listgrid/components/list/types/RowItem.types.ts:16](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/list/types/RowItem.types.ts#L16)

#### Parameters

##### id

`string`

#### Returns

`void`

***

### collapseItem

> **collapseItem**: (`id`) => `void`

Defined in: [listgrid/components/list/types/RowItem.types.ts:17](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/list/types/RowItem.types.ts#L17)

#### Parameters

##### id

`string`

#### Returns

`void`

***

### canExpand

> **canExpand**: `boolean`

Defined in: [listgrid/components/list/types/RowItem.types.ts:18](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/list/types/RowItem.types.ts#L18)

***

### setManagedId

> **setManagedId**: (`value`) => `void`

Defined in: [listgrid/components/list/types/RowItem.types.ts:19](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/list/types/RowItem.types.ts#L19)

#### Parameters

##### value

`any`

#### Returns

`void`
