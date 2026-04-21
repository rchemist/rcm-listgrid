[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ValidateResult

# Class: ValidateResult

Defined in: [listgrid/validations/Validation.tsx:32](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/validations/Validation.tsx#L32)

## Constructors

### Constructor

> **new ValidateResult**(`error`, `message`): `ValidateResult`

Defined in: [listgrid/validations/Validation.tsx:36](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/validations/Validation.tsx#L36)

#### Parameters

##### error

`boolean`

##### message

`string`

#### Returns

`ValidateResult`

## Properties

### error

> **error**: `boolean`

Defined in: [listgrid/validations/Validation.tsx:33](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/validations/Validation.tsx#L33)

***

### message

> **message**: `string`

Defined in: [listgrid/validations/Validation.tsx:34](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/validations/Validation.tsx#L34)

## Methods

### fail()

> `static` **fail**(`message`): `ValidateResult`

Defined in: [listgrid/validations/Validation.tsx:41](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/validations/Validation.tsx#L41)

#### Parameters

##### message

`string`

#### Returns

`ValidateResult`

***

### success()

> `static` **success**(): `ValidateResult`

Defined in: [listgrid/validations/Validation.tsx:45](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/validations/Validation.tsx#L45)

#### Returns

`ValidateResult`

***

### hasError()

> **hasError**(): `boolean`

Defined in: [listgrid/validations/Validation.tsx:49](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/validations/Validation.tsx#L49)

#### Returns

`boolean`

***

### withMessage()

> **withMessage**(`message`): `ValidateResult`

Defined in: [listgrid/validations/Validation.tsx:53](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/validations/Validation.tsx#L53)

#### Parameters

##### message

`string`

#### Returns

`ValidateResult`
