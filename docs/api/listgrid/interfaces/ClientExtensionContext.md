[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ClientExtensionContext

# Interface: ClientExtensionContext\<TSession, TUser\>

Defined in: [listgrid/extensions/EntityFormExtension.types.ts:15](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/extensions/EntityFormExtension.types.ts#L15)

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

Defined in: [listgrid/extensions/EntityFormExtension.types.ts:16](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/extensions/EntityFormExtension.types.ts#L16)

***

### user?

> `optional` **user?**: `TUser`

Defined in: [listgrid/extensions/EntityFormExtension.types.ts:17](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/extensions/EntityFormExtension.types.ts#L17)

***

### entityForm

> **entityForm**: [`EntityForm`](../classes/EntityForm.md)

Defined in: [listgrid/extensions/EntityFormExtension.types.ts:18](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/extensions/EntityFormExtension.types.ts#L18)
