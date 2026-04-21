[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / Session

# Interface: Session

Defined in: [listgrid/auth/types.ts:20](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/auth/types.ts#L20)

## Indexable

> \[`key`: `string`\]: `unknown`

## Properties

### roles?

> `optional` **roles?**: `string`[]

Defined in: [listgrid/auth/types.ts:21](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/auth/types.ts#L21)

***

### authentication?

> `optional` **authentication?**: `object`

Defined in: [listgrid/auth/types.ts:22](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/auth/types.ts#L22)

#### Index Signature

\[`key`: `string`\]: `unknown`

#### roles?

> `optional` **roles?**: `string`[]

***

### getUser?

> `optional` **getUser?**: () => [`SessionUser`](SessionUser.md) \| `null` \| `undefined`

Defined in: [listgrid/auth/types.ts:29](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/auth/types.ts#L29)

#### Returns

[`SessionUser`](SessionUser.md) \| `null` \| `undefined`
