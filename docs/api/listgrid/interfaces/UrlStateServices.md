[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / UrlStateServices

# Interface: UrlStateServices

Defined in: [listgrid/urlState/types.ts:23](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/urlState/types.ts#L23)

## Properties

### useQueryStates

> **useQueryStates**: (`parsers`, `options?`) => \[`Record`\<`string`, `any`\>, [`QueryStatesSetter`](../type-aliases/QueryStatesSetter.md)\]

Defined in: [listgrid/urlState/types.ts:28](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/urlState/types.ts#L28)

Hook reading and writing URL query parameters via host-supplied parsers.
Intentionally typed loosely; the Next.js adapter bridges to `nuqs.useQueryStates`.

#### Parameters

##### parsers

`Record`\<`string`, [`UrlParser`](UrlParser.md)\<`any`\>\>

##### options?

[`UrlStateSetOptions`](UrlStateSetOptions.md)

#### Returns

\[`Record`\<`string`, `any`\>, [`QueryStatesSetter`](../type-aliases/QueryStatesSetter.md)\]
