[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ValidateResult

# Class: ValidateResult

Defined in: [listgrid/validations/Validation.tsx:39](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/Validation.tsx#L39)

## Constructors

### Constructor

> **new ValidateResult**(`error`, `message`): `ValidateResult`

Defined in: [listgrid/validations/Validation.tsx:43](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/Validation.tsx#L43)

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

Defined in: [listgrid/validations/Validation.tsx:40](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/Validation.tsx#L40)

***

### message

> **message**: `string`

Defined in: [listgrid/validations/Validation.tsx:41](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/Validation.tsx#L41)

## Methods

### fail()

> `static` **fail**(`message`): `ValidateResult`

Defined in: [listgrid/validations/Validation.tsx:48](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/Validation.tsx#L48)

#### Parameters

##### message

`string`

#### Returns

`ValidateResult`

***

### success()

> `static` **success**(): `ValidateResult`

Defined in: [listgrid/validations/Validation.tsx:52](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/Validation.tsx#L52)

#### Returns

`ValidateResult`

***

### hasError()

> **hasError**(): `boolean`

Defined in: [listgrid/validations/Validation.tsx:56](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/Validation.tsx#L56)

#### Returns

`boolean`

***

### withMessage()

> **withMessage**(`message`): `ValidateResult`

Defined in: [listgrid/validations/Validation.tsx:60](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/Validation.tsx#L60)

#### Parameters

##### message

`string`

#### Returns

`ValidateResult`
