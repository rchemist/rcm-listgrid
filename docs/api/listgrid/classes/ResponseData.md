[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ResponseData

# Class: ResponseData\<T\>

Defined in: [listgrid/api/types.ts:31](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/api/types.ts#L31)

## Type Parameters

### T

`T` = `any`

## Constructors

### Constructor

> **new ResponseData**\<`T`\>(`init?`): `ResponseData`\<`T`\>

Defined in: [listgrid/api/types.ts:37](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/api/types.ts#L37)

#### Parameters

##### init?

`Partial`\<`ResponseData`\<`T`\>\>

#### Returns

`ResponseData`\<`T`\>

## Properties

### data

> **data**: `T`

Defined in: [listgrid/api/types.ts:32](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/api/types.ts#L32)

***

### status?

> `optional` **status?**: `number`

Defined in: [listgrid/api/types.ts:33](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/api/types.ts#L33)

***

### error?

> `optional` **error?**: `string`

Defined in: [listgrid/api/types.ts:34](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/api/types.ts#L34)

***

### entityError?

> `optional` **entityError?**: [`IEntityError`](../interfaces/IEntityError.md)

Defined in: [listgrid/api/types.ts:35](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/api/types.ts#L35)

## Methods

### isError()

> **isError**(): `boolean`

Defined in: [listgrid/api/types.ts:41](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/api/types.ts#L41)

#### Returns

`boolean`
