[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / FilterRenderParameters

# Interface: FilterRenderParameters\<T, TValue\>

Defined in: [listgrid/config/EntityField.ts:180](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L180)

## Type Parameters

### T

`T` *extends* `object` = `any`

### TValue

`TValue` = `any`

## Properties

### entityForm

> **entityForm**: [`EntityForm`](../classes/EntityForm.md)\<`T`\>

Defined in: [listgrid/config/EntityField.ts:181](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L181)

***

### onChange

> **onChange**: (`value`, `op?`) => `void`

Defined in: [listgrid/config/EntityField.ts:182](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L182)

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

Defined in: [listgrid/config/EntityField.ts:183](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L183)

***

### helpText?

> `optional` **helpText?**: `string`

Defined in: [listgrid/config/EntityField.ts:184](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L184)

***

### value?

> `optional` **value?**: `Promise`\<`TValue`\>

Defined in: [listgrid/config/EntityField.ts:185](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L185)
