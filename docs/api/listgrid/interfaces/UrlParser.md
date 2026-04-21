[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / UrlParser

# Interface: UrlParser\<T\>

Defined in: [listgrid/urlState/types.ts:7](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/urlState/types.ts#L7)

## Type Parameters

### T

`T`

## Properties

### parse

> **parse**: (`value`) => `T` \| `null`

Defined in: [listgrid/urlState/types.ts:8](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/urlState/types.ts#L8)

#### Parameters

##### value

`string`

#### Returns

`T` \| `null`

***

### serialize

> **serialize**: (`value`) => `string`

Defined in: [listgrid/urlState/types.ts:9](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/urlState/types.ts#L9)

#### Parameters

##### value

`T`

#### Returns

`string`

***

### eq?

> `optional` **eq?**: (`a`, `b`) => `boolean`

Defined in: [listgrid/urlState/types.ts:10](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/urlState/types.ts#L10)

#### Parameters

##### a

`T`

##### b

`T`

#### Returns

`boolean`
