[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ConditionalValidation

# Class: ConditionalValidation

Defined in: [listgrid/config/OnChangeEntityForm.ts:30](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/OnChangeEntityForm.ts#L30)

## Implements

- [`ConditionalValidations`](../type-aliases/ConditionalValidations.md)

## Constructors

### Constructor

> **new ConditionalValidation**(`value`): `ConditionalValidation`

Defined in: [listgrid/config/OnChangeEntityForm.ts:34](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/OnChangeEntityForm.ts#L34)

#### Parameters

##### value

[`ConditionalValidationValue`](../type-aliases/ConditionalValidationValue.md)

#### Returns

`ConditionalValidation`

## Properties

### value

> **value**: [`ConditionalValidationValue`](../type-aliases/ConditionalValidationValue.md)

Defined in: [listgrid/config/OnChangeEntityForm.ts:31](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/OnChangeEntityForm.ts#L31)

#### Implementation of

`ConditionalValidations.value`

***

### result

> **result**: `Map`\<`string`, [`OptionalValidation`](../type-aliases/OptionalValidation.md)\>

Defined in: [listgrid/config/OnChangeEntityForm.ts:32](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/OnChangeEntityForm.ts#L32)

#### Implementation of

`ConditionalValidations.result`

## Methods

### create()

> `static` **create**(`value`): `ConditionalValidation`

Defined in: [listgrid/config/OnChangeEntityForm.ts:38](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/OnChangeEntityForm.ts#L38)

#### Parameters

##### value

[`ConditionalValidationValue`](../type-aliases/ConditionalValidationValue.md)

#### Returns

`ConditionalValidation`

***

### addValidation()

> **addValidation**(`fieldName`, `type`, ...`validations`): `this`

Defined in: [listgrid/config/OnChangeEntityForm.ts:42](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/OnChangeEntityForm.ts#L42)

#### Parameters

##### fieldName

`string`

##### type

`"append"` \| `"overwrite"`

##### validations

...[`Validation`](../interfaces/Validation.md)[]

#### Returns

`this`
