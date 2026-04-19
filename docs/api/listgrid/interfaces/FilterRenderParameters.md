[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / FilterRenderParameters

# Interface: FilterRenderParameters\<T, TValue\>

Defined in: [listgrid/config/EntityField.ts:187](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L187)

## Type Parameters

### T

`T` *extends* `object` = `any`

### TValue

`TValue` = `any`

## Properties

### entityForm

> **entityForm**: [`EntityForm`](../classes/EntityForm.md)\<`T`\>

Defined in: [listgrid/config/EntityField.ts:188](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L188)

***

### onChange

> **onChange**: (`value`, `op?`) => `void`

Defined in: [listgrid/config/EntityField.ts:189](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L189)

#### Parameters

##### value

`TValue`

##### op?

[`QueryConditionType`](../type-aliases/QueryConditionType.md)

#### Returns

`void`

***

### placeHolder?

> `optional` **placeHolder?**: `string`

Defined in: [listgrid/config/EntityField.ts:190](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L190)

***

### helpText?

> `optional` **helpText?**: `string`

Defined in: [listgrid/config/EntityField.ts:191](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L191)

***

### value?

> `optional` **value?**: `Promise`\<`TValue`\>

Defined in: [listgrid/config/EntityField.ts:192](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L192)
