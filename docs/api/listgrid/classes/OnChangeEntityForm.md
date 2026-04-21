[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / OnChangeEntityForm

# Class: OnChangeEntityForm

Defined in: [listgrid/config/OnChangeEntityForm.ts:76](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/OnChangeEntityForm.ts#L76)

## Constructors

### Constructor

> **new OnChangeEntityForm**(): `OnChangeEntityForm`

#### Returns

`OnChangeEntityForm`

## Methods

### changeHidden()

> `static` **changeHidden**(`name`, `options`): [`ModifyEntityFormFunc`](../type-aliases/ModifyEntityFormFunc.md)

Defined in: [listgrid/config/OnChangeEntityForm.ts:77](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/OnChangeEntityForm.ts#L77)

#### Parameters

##### name

`string`

##### options

[`ConditionalProps`](../type-aliases/ConditionalProps.md) \| [`ConditionalProps`](../type-aliases/ConditionalProps.md)[]

#### Returns

[`ModifyEntityFormFunc`](../type-aliases/ModifyEntityFormFunc.md)

***

### changeRequired()

> `static` **changeRequired**(`name`, `options`): [`ModifyEntityFormFunc`](../type-aliases/ModifyEntityFormFunc.md)

Defined in: [listgrid/config/OnChangeEntityForm.ts:84](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/OnChangeEntityForm.ts#L84)

#### Parameters

##### name

`string`

##### options

[`ConditionalProps`](../type-aliases/ConditionalProps.md) \| [`ConditionalProps`](../type-aliases/ConditionalProps.md)[]

#### Returns

[`ModifyEntityFormFunc`](../type-aliases/ModifyEntityFormFunc.md)

***

### changeSelectOptions()

> `static` **changeSelectOptions**(`name`, `options`): [`ModifyEntityFormFunc`](../type-aliases/ModifyEntityFormFunc.md)

Defined in: [listgrid/config/OnChangeEntityForm.ts:91](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/OnChangeEntityForm.ts#L91)

#### Parameters

##### name

`string`

##### options

[`ConditionalSelectOptionProps`](../type-aliases/ConditionalSelectOptionProps.md) \| [`ConditionalSelectOptionProps`](../type-aliases/ConditionalSelectOptionProps.md)[]

#### Returns

[`ModifyEntityFormFunc`](../type-aliases/ModifyEntityFormFunc.md)

***

### derivedValidations()

> `static` **derivedValidations**(`name`, `options`): [`ModifyEntityFormFunc`](../type-aliases/ModifyEntityFormFunc.md)

Defined in: [listgrid/config/OnChangeEntityForm.ts:98](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/OnChangeEntityForm.ts#L98)

#### Parameters

##### name

`string`

##### options

[`ConditionalValidations`](../type-aliases/ConditionalValidations.md) \| [`ConditionalValidations`](../type-aliases/ConditionalValidations.md)[]

#### Returns

[`ModifyEntityFormFunc`](../type-aliases/ModifyEntityFormFunc.md)
