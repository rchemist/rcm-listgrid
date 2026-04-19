[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / Validation

# Interface: Validation

Defined in: [listgrid/validations/Validation.tsx:13](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/Validation.tsx#L13)

## Properties

### id

> **id**: `string`

Defined in: [listgrid/validations/Validation.tsx:16](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/Validation.tsx#L16)

***

### message?

> `optional` **message?**: `string`

Defined in: [listgrid/validations/Validation.tsx:19](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/Validation.tsx#L19)

## Methods

### validate()

> **validate**(`entityForm`, `value`, `message?`): `Promise`\<[`ValidateResult`](../classes/ValidateResult.md)\>

Defined in: [listgrid/validations/Validation.tsx:27](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/Validation.tsx#L27)

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

Defined in: [listgrid/validations/Validation.tsx:36](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/Validation.tsx#L36)

에러 메시지 반환

#### Returns

`string`
