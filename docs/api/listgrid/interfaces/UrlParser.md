[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / UrlParser

# Interface: UrlParser\<T\>

Defined in: [listgrid/urlState/types.ts:7](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/urlState/types.ts#L7)

## Type Parameters

### T

`T`

## Properties

### parse

> **parse**: (`value`) => `T` \| `null`

Defined in: [listgrid/urlState/types.ts:8](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/urlState/types.ts#L8)

#### Parameters

##### value

`string`

#### Returns

`T` \| `null`

***

### serialize

> **serialize**: (`value`) => `string`

Defined in: [listgrid/urlState/types.ts:9](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/urlState/types.ts#L9)

#### Parameters

##### value

`T`

#### Returns

`string`

***

### eq?

> `optional` **eq?**: (`a`, `b`) => `boolean`

Defined in: [listgrid/urlState/types.ts:10](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/urlState/types.ts#L10)

#### Parameters

##### a

`T`

##### b

`T`

#### Returns

`boolean`
