[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / StringValidation

# Class: StringValidation

Defined in: [listgrid/validations/StringValidation.ts:13](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/StringValidation.ts#L13)

## Extends

- [`ValidationItem`](ValidationItem.md)

## Constructors

### Constructor

> **new StringValidation**(`args`, `message?`): `StringValidation`

Defined in: [listgrid/validations/StringValidation.ts:47](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/StringValidation.ts#L47)

#### Parameters

##### args

###### length?

\{ `min?`: `number`; `max?`: `number`; \}

###### length.min?

`number`

###### length.max?

`number`

###### regex?

`RegExp`

###### id

`string`

##### message?

`string`

#### Returns

`StringValidation`

#### Overrides

`ValidationItem.constructor`

## Properties

### length?

> `optional` **length?**: [`MinMaxLimit`](../type-aliases/MinMaxLimit.md)

Defined in: [listgrid/validations/StringValidation.ts:14](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/StringValidation.ts#L14)

***

### regex?

> `optional` **regex?**: `RegExp`

Defined in: [listgrid/validations/StringValidation.ts:15](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/StringValidation.ts#L15)

***

### id

> **id**: `string`

Defined in: [listgrid/validations/Validation.tsx:74](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/Validation.tsx#L74)

#### Inherited from

[`ValidationItem`](ValidationItem.md).[`id`](ValidationItem.md#id)

***

### message?

> `optional` **message?**: `string`

Defined in: [listgrid/validations/Validation.tsx:76](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/Validation.tsx#L76)

#### Inherited from

[`ValidationItem`](ValidationItem.md).[`message`](ValidationItem.md#message)

## Methods

### validate()

> **validate**(`entityForm`, `value`, `message?`): `Promise`\<[`ValidateResult`](ValidateResult.md)\>

Defined in: [listgrid/validations/StringValidation.ts:17](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/StringValidation.ts#L17)

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

Defined in: [listgrid/validations/Validation.tsx:90](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/Validation.tsx#L90)

에러 메시지 반환

#### Returns

`string`

#### Inherited from

[`ValidationItem`](ValidationItem.md).[`getErrorMessage`](ValidationItem.md#geterrormessage)

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

[`ValidationItem`](ValidationItem.md).[`getValueAsString`](ValidationItem.md#getvalueasstring)

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

[`ValidationItem`](ValidationItem.md).[`getValueAsNumber`](ValidationItem.md#getvalueasnumber)

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

[`ValidationItem`](ValidationItem.md).[`getValueAsBoolean`](ValidationItem.md#getvalueasboolean)

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

[`ValidationItem`](ValidationItem.md).[`returnValidateResult`](ValidationItem.md#returnvalidateresult)
