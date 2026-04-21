[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ConditionalSelectOption

# Class: ConditionalSelectOption

Defined in: [listgrid/config/OnChangeEntityForm.ts:52](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/OnChangeEntityForm.ts#L52)

## Implements

- [`ConditionalSelectOptionProps`](../type-aliases/ConditionalSelectOptionProps.md)

## Constructors

### Constructor

> **new ConditionalSelectOption**(`value`): `ConditionalSelectOption`

Defined in: [listgrid/config/OnChangeEntityForm.ts:57](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/OnChangeEntityForm.ts#L57)

#### Parameters

##### value

`any`

#### Returns

`ConditionalSelectOption`

## Properties

### value

> **value**: `any`

Defined in: [listgrid/config/OnChangeEntityForm.ts:53](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/OnChangeEntityForm.ts#L53)

#### Implementation of

`ConditionalSelectOptionProps.value`

***

### result

> **result**: `Map`\<`string`, [`SelectOption`](../interfaces/SelectOption.md)[]\>

Defined in: [listgrid/config/OnChangeEntityForm.ts:54](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/OnChangeEntityForm.ts#L54)

#### Implementation of

`ConditionalSelectOptionProps.result`

***

### defaultValue

> **defaultValue**: `any`

Defined in: [listgrid/config/OnChangeEntityForm.ts:55](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/OnChangeEntityForm.ts#L55)

#### Implementation of

`ConditionalSelectOptionProps.defaultValue`

## Methods

### create()

> `static` **create**(`value`): `ConditionalSelectOption`

Defined in: [listgrid/config/OnChangeEntityForm.ts:61](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/OnChangeEntityForm.ts#L61)

#### Parameters

##### value

`any`

#### Returns

`ConditionalSelectOption`

***

### withDefaultValue()

> **withDefaultValue**(`defaultValue?`): `this`

Defined in: [listgrid/config/OnChangeEntityForm.ts:65](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/OnChangeEntityForm.ts#L65)

#### Parameters

##### defaultValue?

`any`

#### Returns

`this`

***

### addSelectOption()

> **addSelectOption**(`fieldName`, ...`options`): `this`

Defined in: [listgrid/config/OnChangeEntityForm.ts:70](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/OnChangeEntityForm.ts#L70)

#### Parameters

##### fieldName

`string`

##### options

...[`SelectOption`](../interfaces/SelectOption.md)[]

#### Returns

`this`
