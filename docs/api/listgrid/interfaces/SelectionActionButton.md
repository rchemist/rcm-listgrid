[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / SelectionActionButton

# Interface: SelectionActionButton

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:15](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/list/types/ViewListGrid.types.ts#L15)

## Properties

### label

> **label**: `string` \| ((`checkedItems`) => `string`)

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:16](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/list/types/ViewListGrid.types.ts#L16)

***

### onClick

> **onClick**: (`entityForm`, `checkedItems`) => `Promise`\<`void`\>

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:17](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/list/types/ViewListGrid.types.ts#L17)

#### Parameters

##### entityForm

[`EntityForm`](../classes/EntityForm.md)

##### checkedItems

`string`[]

#### Returns

`Promise`\<`void`\>

***

### color?

> `optional` **color?**: `ColorType`

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:18](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/list/types/ViewListGrid.types.ts#L18)

***

### outline?

> `optional` **outline?**: `boolean`

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:19](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/list/types/ViewListGrid.types.ts#L19)

***

### className?

> `optional` **className?**: `string`

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:20](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/list/types/ViewListGrid.types.ts#L20)

***

### icon?

> `optional` **icon?**: `ReactNode`

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:21](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/list/types/ViewListGrid.types.ts#L21)

***

### show?

> `optional` **show?**: `boolean` \| ((`checkedItems`) => `boolean`)

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:22](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/list/types/ViewListGrid.types.ts#L22)

***

### confirmMessage?

> `optional` **confirmMessage?**: `string` \| ((`checkedItems`) => `string`)

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:23](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/list/types/ViewListGrid.types.ts#L23)

***

### canExecute?

> `optional` **canExecute?**: (`checkedItems`) => `boolean`

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:24](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/list/types/ViewListGrid.types.ts#L24)

#### Parameters

##### checkedItems

`string`[]

#### Returns

`boolean`
