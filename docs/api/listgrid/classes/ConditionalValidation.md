[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ConditionalValidation

# Class: ConditionalValidation

Defined in: [listgrid/config/OnChangeEntityForm.ts:37](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/OnChangeEntityForm.ts#L37)

## Implements

- [`ConditionalValidations`](../type-aliases/ConditionalValidations.md)

## Constructors

### Constructor

> **new ConditionalValidation**(`value`): `ConditionalValidation`

Defined in: [listgrid/config/OnChangeEntityForm.ts:41](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/OnChangeEntityForm.ts#L41)

#### Parameters

##### value

[`ConditionalValidationValue`](../type-aliases/ConditionalValidationValue.md)

#### Returns

`ConditionalValidation`

## Properties

### value

> **value**: [`ConditionalValidationValue`](../type-aliases/ConditionalValidationValue.md)

Defined in: [listgrid/config/OnChangeEntityForm.ts:38](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/OnChangeEntityForm.ts#L38)

#### Implementation of

`ConditionalValidations.value`

***

### result

> **result**: `Map`\<`string`, [`OptionalValidation`](../type-aliases/OptionalValidation.md)\>

Defined in: [listgrid/config/OnChangeEntityForm.ts:39](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/OnChangeEntityForm.ts#L39)

#### Implementation of

`ConditionalValidations.result`

## Methods

### create()

> `static` **create**(`value`): `ConditionalValidation`

Defined in: [listgrid/config/OnChangeEntityForm.ts:45](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/OnChangeEntityForm.ts#L45)

#### Parameters

##### value

[`ConditionalValidationValue`](../type-aliases/ConditionalValidationValue.md)

#### Returns

`ConditionalValidation`

***

### addValidation()

> **addValidation**(`fieldName`, `type`, ...`validations`): `this`

Defined in: [listgrid/config/OnChangeEntityForm.ts:49](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/OnChangeEntityForm.ts#L49)

#### Parameters

##### fieldName

`string`

##### type

`"append"` \| `"overwrite"`

##### validations

...[`Validation`](../interfaces/Validation.md)[]

#### Returns

`this`
