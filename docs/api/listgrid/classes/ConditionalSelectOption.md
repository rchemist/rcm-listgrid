[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ConditionalSelectOption

# Class: ConditionalSelectOption

Defined in: [listgrid/config/OnChangeEntityForm.ts:59](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/OnChangeEntityForm.ts#L59)

## Implements

- [`ConditionalSelectOptionProps`](../type-aliases/ConditionalSelectOptionProps.md)

## Constructors

### Constructor

> **new ConditionalSelectOption**(`value`): `ConditionalSelectOption`

Defined in: [listgrid/config/OnChangeEntityForm.ts:64](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/OnChangeEntityForm.ts#L64)

#### Parameters

##### value

`any`

#### Returns

`ConditionalSelectOption`

## Properties

### value

> **value**: `any`

Defined in: [listgrid/config/OnChangeEntityForm.ts:60](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/OnChangeEntityForm.ts#L60)

#### Implementation of

`ConditionalSelectOptionProps.value`

***

### result

> **result**: `Map`\<`string`, [`SelectOption`](../interfaces/SelectOption.md)[]\>

Defined in: [listgrid/config/OnChangeEntityForm.ts:61](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/OnChangeEntityForm.ts#L61)

#### Implementation of

`ConditionalSelectOptionProps.result`

***

### defaultValue

> **defaultValue**: `any`

Defined in: [listgrid/config/OnChangeEntityForm.ts:62](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/OnChangeEntityForm.ts#L62)

#### Implementation of

`ConditionalSelectOptionProps.defaultValue`

## Methods

### create()

> `static` **create**(`value`): `ConditionalSelectOption`

Defined in: [listgrid/config/OnChangeEntityForm.ts:68](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/OnChangeEntityForm.ts#L68)

#### Parameters

##### value

`any`

#### Returns

`ConditionalSelectOption`

***

### withDefaultValue()

> **withDefaultValue**(`defaultValue?`): `this`

Defined in: [listgrid/config/OnChangeEntityForm.ts:72](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/OnChangeEntityForm.ts#L72)

#### Parameters

##### defaultValue?

`any`

#### Returns

`this`

***

### addSelectOption()

> **addSelectOption**(`fieldName`, ...`options`): `this`

Defined in: [listgrid/config/OnChangeEntityForm.ts:77](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/OnChangeEntityForm.ts#L77)

#### Parameters

##### fieldName

`string`

##### options

...[`SelectOption`](../interfaces/SelectOption.md)[]

#### Returns

`this`
