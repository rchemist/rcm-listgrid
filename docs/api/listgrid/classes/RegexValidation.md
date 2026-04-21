[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / RegexValidation

# Class: RegexValidation

Defined in: [listgrid/validations/RegexValidation.ts:6](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/validations/RegexValidation.ts#L6)

## Extends

- [`ValidationItem`](ValidationItem.md)

## Extended by

- [`EmailValidation`](EmailValidation.md)
- [`TelephoneNumberValidation`](TelephoneNumberValidation.md)
- [`PhoneNumberValidation`](PhoneNumberValidation.md)
- [`PasswordValidation`](PasswordValidation.md)

## Constructors

### Constructor

> **new RegexValidation**(`id`, `regex`, `message?`): `RegexValidation`

Defined in: [listgrid/validations/RegexValidation.ts:9](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/validations/RegexValidation.ts#L9)

#### Parameters

##### id

`string`

##### regex

`RegExp`

##### message?

`string`

#### Returns

`RegexValidation`

#### Overrides

`ValidationItem.constructor`

## Properties

### regex

> **regex**: `RegExp`

Defined in: [listgrid/validations/RegexValidation.ts:7](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/validations/RegexValidation.ts#L7)

***

### id

> **id**: `string`

Defined in: [listgrid/validations/Validation.tsx:67](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/validations/Validation.tsx#L67)

#### Inherited from

[`ValidationItem`](ValidationItem.md).[`id`](ValidationItem.md#id)

***

### message?

> `optional` **message?**: `string`

Defined in: [listgrid/validations/Validation.tsx:69](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/validations/Validation.tsx#L69)

#### Inherited from

[`ValidationItem`](ValidationItem.md).[`message`](ValidationItem.md#message)

## Methods

### validate()

> **validate**(`entityForm`, `value`, `message?`): `Promise`\<[`ValidateResult`](ValidateResult.md)\>

Defined in: [listgrid/validations/RegexValidation.ts:14](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/validations/RegexValidation.ts#L14)

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

#### Overrides

[`ValidationItem`](ValidationItem.md).[`validate`](ValidationItem.md#validate)

***

### getErrorMessage()

> **getErrorMessage**(): `string`

Defined in: [listgrid/validations/Validation.tsx:83](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/validations/Validation.tsx#L83)

에러 메시지 반환

#### Returns

`string`

#### Inherited from

[`ValidationItem`](ValidationItem.md).[`getErrorMessage`](ValidationItem.md#geterrormessage)

***

### getValueAsString()

> **getValueAsString**(`entityForm`, `value`): `string`

Defined in: [listgrid/validations/Validation.tsx:92](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/validations/Validation.tsx#L92)

현재 필드값을 string 으로 반환하는 편의성 메소드

#### Parameters

##### entityForm

[`EntityForm`](EntityForm.md)

##### value

[`FieldValue`](../interfaces/FieldValue.md)

#### Returns

`string`

#### Inherited from

[`ValidationItem`](ValidationItem.md).[`getValueAsString`](ValidationItem.md#getvalueasstring)

***

### getValueAsNumber()

> **getValueAsNumber**(`entityForm`, `value`): `number`

Defined in: [listgrid/validations/Validation.tsx:109](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/validations/Validation.tsx#L109)

현재 필드값을 number 로 반환하는 편의성 메소드

#### Parameters

##### entityForm

[`EntityForm`](EntityForm.md)

##### value

[`FieldValue`](../interfaces/FieldValue.md)

#### Returns

`number`

#### Inherited from

[`ValidationItem`](ValidationItem.md).[`getValueAsNumber`](ValidationItem.md#getvalueasnumber)

***

### getValueAsBoolean()

> **getValueAsBoolean**(`entityForm`, `value`): `boolean`

Defined in: [listgrid/validations/Validation.tsx:120](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/validations/Validation.tsx#L120)

현재 필드값을 boolean 로 반환하는 편의성 메소드.

#### Parameters

##### entityForm

[`EntityForm`](EntityForm.md)

##### value

[`FieldValue`](../interfaces/FieldValue.md)

#### Returns

`boolean`

#### Inherited from

[`ValidationItem`](ValidationItem.md).[`getValueAsBoolean`](ValidationItem.md#getvalueasboolean)

***

### returnValidateResult()

> **returnValidateResult**(`error`, `message?`): [`ValidateResult`](ValidateResult.md)

Defined in: [listgrid/validations/Validation.tsx:131](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/validations/Validation.tsx#L131)

ValidateResult 를 반환하는 편의성 메소드.

#### Parameters

##### error

`boolean`

##### message?

`string`

#### Returns

[`ValidateResult`](ValidateResult.md)

#### Inherited from

[`ValidationItem`](ValidationItem.md).[`returnValidateResult`](ValidationItem.md#returnvalidateresult)
