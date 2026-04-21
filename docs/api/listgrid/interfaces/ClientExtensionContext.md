[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ClientExtensionContext

# Interface: ClientExtensionContext\<TSession, TUser\>

Defined in: [listgrid/extensions/EntityFormExtension.types.ts:8](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/extensions/EntityFormExtension.types.ts#L8)

Extension Context - Client에서 사용 가능한 정보
제네릭 Session 타입 사용 - 프로젝트별로 구체 타입 확장 가능

## Type Parameters

### TSession

`TSession` = [`Session`](Session.md)

### TUser

`TUser` = `any`

## Indexable

> \[`key`: `string`\]: `any`

## Properties

### session?

> `optional` **session?**: `TSession`

Defined in: [listgrid/extensions/EntityFormExtension.types.ts:9](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/extensions/EntityFormExtension.types.ts#L9)

***

### user?

> `optional` **user?**: `TUser`

Defined in: [listgrid/extensions/EntityFormExtension.types.ts:10](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/extensions/EntityFormExtension.types.ts#L10)

***

### entityForm

> **entityForm**: [`EntityForm`](../classes/EntityForm.md)

Defined in: [listgrid/extensions/EntityFormExtension.types.ts:11](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/extensions/EntityFormExtension.types.ts#L11)
