[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ValidationItem

# Abstract Class: ValidationItem

Defined in: [listgrid/validations/Validation.tsx:66](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/Validation.tsx#L66)

## Extended by

- [`RequiredValidation`](RequiredValidation.md)
- [`CustomValidation`](CustomValidation.md)
- [`RegexValidation`](RegexValidation.md)
- [`RegexFormulaValidation`](RegexFormulaValidation.md)
- [`MinMaxNumberValidation`](MinMaxNumberValidation.md)
- [`StringValidation`](StringValidation.md)
- [`IpAddressValidation`](IpAddressValidation.md)

## Implements

- [`Validation`](../interfaces/Validation.md)

## Properties

### id

> **id**: `string`

Defined in: [listgrid/validations/Validation.tsx:74](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/Validation.tsx#L74)

#### Implementation of

[`Validation`](../interfaces/Validation.md).[`id`](../interfaces/Validation.md#id)

***

### message?

> `optional` **message?**: `string`

Defined in: [listgrid/validations/Validation.tsx:76](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/Validation.tsx#L76)

#### Implementation of

[`Validation`](../interfaces/Validation.md).[`message`](../interfaces/Validation.md#message)

## Methods

### validate()

> `abstract` **validate**(`entityForm`, `value`, `message?`): `Promise`\<[`ValidateResult`](ValidateResult.md)\>

Defined in: [listgrid/validations/Validation.tsx:84](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/Validation.tsx#L84)

검증 로직

#### Parameters

##### entityForm

[`EntityForm`](EntityForm.md)

##### value

[`FieldValue`](../interfaces/FieldValue.md)

##### message?

`string`

#### Returns

`Promise`\<[`ValidateResult`](ValidateResult.md)\>

#### Implementation of

[`Validation`](../interfaces/Validation.md).[`validate`](../interfaces/Validation.md#validate)

***

### getErrorMessage()

> **getErrorMessage**(): `string`

Defined in: [listgrid/validations/Validation.tsx:90](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/Validation.tsx#L90)

에러 메시지 반환

#### Returns

`string`

#### Implementation of

[`Validation`](../interfaces/Validation.md).[`getErrorMessage`](../interfaces/Validation.md#geterrormessage)

***

### getValueAsString()

> **getValueAsString**(`entityForm`, `value`): `string`

Defined in: [listgrid/validations/Validation.tsx:99](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/Validation.tsx#L99)

현재 필드값을 string 으로 반환하는 편의성 메소드

#### Parameters

##### entityForm

[`EntityForm`](EntityForm.md)

##### value

[`FieldValue`](../interfaces/FieldValue.md)

#### Returns

`string`

***

### getValueAsNumber()

> **getValueAsNumber**(`entityForm`, `value`): `number`

Defined in: [listgrid/validations/Validation.tsx:116](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/Validation.tsx#L116)

현재 필드값을 number 로 반환하는 편의성 메소드

#### Parameters

##### entityForm

[`EntityForm`](EntityForm.md)

##### value

[`FieldValue`](../interfaces/FieldValue.md)

#### Returns

`number`

***

### getValueAsBoolean()

> **getValueAsBoolean**(`entityForm`, `value`): `boolean`

Defined in: [listgrid/validations/Validation.tsx:127](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/Validation.tsx#L127)

현재 필드값을 boolean 로 반환하는 편의성 메소드.

#### Parameters

##### entityForm

[`EntityForm`](EntityForm.md)

##### value

[`FieldValue`](../interfaces/FieldValue.md)

#### Returns

`boolean`

***

### returnValidateResult()

> **returnValidateResult**(`error`, `message?`): [`ValidateResult`](ValidateResult.md)

Defined in: [listgrid/validations/Validation.tsx:138](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/Validation.tsx#L138)

ValidateResult 를 반환하는 편의성 메소드.

#### Parameters

##### error

`boolean`

##### message?

`string`

#### Returns

[`ValidateResult`](ValidateResult.md)
