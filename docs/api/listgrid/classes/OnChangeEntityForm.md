[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / OnChangeEntityForm

# Class: OnChangeEntityForm

Defined in: [listgrid/config/OnChangeEntityForm.ts:83](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/OnChangeEntityForm.ts#L83)

## Constructors

### Constructor

> **new OnChangeEntityForm**(): `OnChangeEntityForm`

#### Returns

`OnChangeEntityForm`

## Methods

### changeHidden()

> `static` **changeHidden**(`name`, `options`): [`ModifyEntityFormFunc`](../type-aliases/ModifyEntityFormFunc.md)

Defined in: [listgrid/config/OnChangeEntityForm.ts:84](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/OnChangeEntityForm.ts#L84)

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

Defined in: [listgrid/config/OnChangeEntityForm.ts:91](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/OnChangeEntityForm.ts#L91)

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

Defined in: [listgrid/config/OnChangeEntityForm.ts:98](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/OnChangeEntityForm.ts#L98)

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

Defined in: [listgrid/config/OnChangeEntityForm.ts:105](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/OnChangeEntityForm.ts#L105)

#### Parameters

##### name

`string`

##### options

[`ConditionalValidations`](../type-aliases/ConditionalValidations.md) \| [`ConditionalValidations`](../type-aliases/ConditionalValidations.md)[]

#### Returns

[`ModifyEntityFormFunc`](../type-aliases/ModifyEntityFormFunc.md)
