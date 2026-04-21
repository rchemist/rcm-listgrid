[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / Validation

# Interface: Validation

Defined in: [listgrid/validations/Validation.tsx:6](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/validations/Validation.tsx#L6)

## Properties

### id

> **id**: `string`

Defined in: [listgrid/validations/Validation.tsx:9](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/validations/Validation.tsx#L9)

***

### message?

> `optional` **message?**: `string`

Defined in: [listgrid/validations/Validation.tsx:12](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/validations/Validation.tsx#L12)

## Methods

### validate()

> **validate**(`entityForm`, `value`, `message?`): `Promise`\<[`ValidateResult`](../classes/ValidateResult.md)\>

Defined in: [listgrid/validations/Validation.tsx:20](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/validations/Validation.tsx#L20)

실제 검증 로직

#### Parameters

##### entityForm

[`EntityForm`](../classes/EntityForm.md)

현재의 엔티티폼 상태

##### value

[`FieldValue`](FieldValue.md)\<`any`\> \| `undefined`

현재 필드의 필드값. FieldValue 타입인 경우 value.currentValue 가 현재 값

##### message?

`string`

상위 폼에서 넘어 온 기본 오류 메시지

#### Returns

`Promise`\<[`ValidateResult`](../classes/ValidateResult.md)\>

***

### getErrorMessage()

> **getErrorMessage**(): `string`

Defined in: [listgrid/validations/Validation.tsx:29](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/validations/Validation.tsx#L29)

에러 메시지 반환

#### Returns

`string`
