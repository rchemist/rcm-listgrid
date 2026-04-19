[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / SelectionOptions

# Interface: SelectionOptions

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:27](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/list/types/ViewListGrid.types.ts#L27)

## Properties

### enabled?

> `optional` **enabled?**: `boolean` \| ((`entityForm`) => `boolean`)

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:29](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/list/types/ViewListGrid.types.ts#L29)

***

### selectableFilter?

> `optional` **selectableFilter?**: (`item`) => `boolean`

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:32](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/list/types/ViewListGrid.types.ts#L32)

#### Parameters

##### item

`any`

#### Returns

`boolean`

***

### onSelectionChange?

> `optional` **onSelectionChange?**: (`checkedItems`, `allItems`) => `void`

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:35](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/list/types/ViewListGrid.types.ts#L35)

#### Parameters

##### checkedItems

`string`[]

##### allItems

`any`[]

#### Returns

`void`

***

### maxSelection?

> `optional` **maxSelection?**: `number`

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:38](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/list/types/ViewListGrid.types.ts#L38)

***

### minSelection?

> `optional` **minSelection?**: `number`

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:39](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/list/types/ViewListGrid.types.ts#L39)

***

### validateSelection?

> `optional` **validateSelection?**: (`checkedItems`) => `object`

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:42](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/list/types/ViewListGrid.types.ts#L42)

#### Parameters

##### checkedItems

`string`[]

#### Returns

`object`

##### valid

> **valid**: `boolean`

##### message?

> `optional` **message?**: `string`

***

### actions?

> `optional` **actions?**: [`SelectionActionButton`](SelectionActionButton.md)[]

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:45](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/list/types/ViewListGrid.types.ts#L45)

***

### deleteButton?

> `optional` **deleteButton?**: `false` \| \{ `show?`: `boolean` \| ((`checkedItems`) => `boolean`); `label?`: `string` \| ((`checkedItems`) => `string`); `confirmMessage?`: `string` \| ((`checkedItems`) => `string`); `className?`: `string`; `icon?`: `ReactNode`; \}

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:48](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/list/types/ViewListGrid.types.ts#L48)
