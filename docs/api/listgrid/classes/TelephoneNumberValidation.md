[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / TelephoneNumberValidation

# Class: TelephoneNumberValidation

Defined in: [listgrid/validations/TelephoneNumberValidation.ts:16](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/TelephoneNumberValidation.ts#L16)

## Extends

- [`RegexValidation`](RegexValidation.md)

## Constructors

### Constructor

> **new TelephoneNumberValidation**(`id?`, `regex?`, `message?`): `TelephoneNumberValidation`

Defined in: [listgrid/validations/TelephoneNumberValidation.ts:17](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/TelephoneNumberValidation.ts#L17)

#### Parameters

##### id?

`string`

##### regex?

`RegExp`

##### message?

`string`

#### Returns

`TelephoneNumberValidation`

#### Overrides

[`RegexValidation`](RegexValidation.md).[`constructor`](RegexValidation.md#constructor)

## Properties

### regex

> **regex**: `RegExp`

Defined in: [listgrid/validations/RegexValidation.ts:14](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/RegexValidation.ts#L14)

#### Inherited from

[`RegexValidation`](RegexValidation.md).[`regex`](RegexValidation.md#regex)

***

### id

> **id**: `string`

Defined in: [listgrid/validations/Validation.tsx:74](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/Validation.tsx#L74)

#### Inherited from

[`RegexValidation`](RegexValidation.md).[`id`](RegexValidation.md#id)

***

### message?

> `optional` **message?**: `string`

Defined in: [listgrid/validations/Validation.tsx:76](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/Validation.tsx#L76)

#### Inherited from

[`RegexValidation`](RegexValidation.md).[`message`](RegexValidation.md#message)

## Methods

### validate()

> **validate**(`entityForm`, `value`, `message?`): `Promise`\<[`ValidateResult`](ValidateResult.md)\>

Defined in: [listgrid/validations/TelephoneNumberValidation.ts:29](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/TelephoneNumberValidation.ts#L29)

전화번호 검증 시 하이픈을 제거한 후 검증합니다.
빈 값인 경우 검증을 통과시킵니다 (required 검증은 필드의 required 설정으로 처리).

#### Parameters

##### entityForm

[`EntityForm`](EntityForm.md)

##### value

[`FieldValue`](../interfaces/FieldValue.md)

##### message?

`string`

#### Returns

`Promise`\<[`ValidateResult`](ValidateResult.md)\>

#### Overrides

[`RegexValidation`](RegexValidation.md).[`validate`](RegexValidation.md#validate)

***

### getErrorMessage()

> **getErrorMessage**(): `string`

Defined in: [listgrid/validations/Validation.tsx:90](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/Validation.tsx#L90)

에러 메시지 반환

#### Returns

`string`

#### Inherited from

[`RegexValidation`](RegexValidation.md).[`getErrorMessage`](RegexValidation.md#geterrormessage)

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

#### Inherited from

[`RegexValidation`](RegexValidation.md).[`getValueAsString`](RegexValidation.md#getvalueasstring)

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

#### Inherited from

[`RegexValidation`](RegexValidation.md).[`getValueAsNumber`](RegexValidation.md#getvalueasnumber)

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

#### Inherited from

[`RegexValidation`](RegexValidation.md).[`getValueAsBoolean`](RegexValidation.md#getvalueasboolean)

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

#### Inherited from

[`RegexValidation`](RegexValidation.md).[`returnValidateResult`](RegexValidation.md#returnvalidateresult)
