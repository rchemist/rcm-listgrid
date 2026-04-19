[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ListableFormFieldProps

# Interface: ListableFormFieldProps\<TValue, TForm\>

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:109](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/ListableFormField.tsx#L109)

## Extends

- [`FormFieldProps`](FormFieldProps.md)\<`TValue`, `TForm`\>

## Extended by

- [`OptionalFieldProps`](OptionalFieldProps.md)
- [`AbstractManyToOneFieldProps`](AbstractManyToOneFieldProps.md)
- [`AbstractDateFieldProps`](AbstractDateFieldProps.md)

## Type Parameters

### TValue

`TValue` = `any`

### TForm

`TForm` *extends* `object` = `any`

## Properties

### value?

> `optional` **value?**: [`FieldValue`](FieldValue.md)\<`TValue`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:120](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L120)

#### Inherited from

[`FormFieldProps`](FormFieldProps.md).[`value`](FormFieldProps.md#value)

***

### placeHolder?

> `optional` **placeHolder?**: [`ConditionalStringValue`](../type-aliases/ConditionalStringValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:125](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L125)

#### Inherited from

[`FormFieldProps`](FormFieldProps.md).[`placeHolder`](FormFieldProps.md#placeholder)

***

### required?

> `optional` **required?**: [`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:126](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L126)

#### Inherited from

[`FormFieldProps`](FormFieldProps.md).[`required`](FormFieldProps.md#required)

***

### validations?

> `optional` **validations?**: [`Validation`](Validation.md)[]

Defined in: [listgrid/components/fields/abstract/FormField.tsx:127](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L127)

#### Inherited from

[`FormFieldProps`](FormFieldProps.md).[`validations`](FormFieldProps.md#validations)

***

### displayFunc?

> `optional` **displayFunc?**: (`entityForm`, `field`, `renderType?`) => `Promise`\<`TValue`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:134](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L134)

display value 를 변조할 수 있다.

#### Parameters

##### entityForm

[`EntityForm`](../classes/EntityForm.md)\<`TForm`\>

##### field

[`EntityField`](EntityField.md)

##### renderType?

[`RenderType`](../type-aliases/RenderType.md)

#### Returns

`Promise`\<`TValue`\>

#### Inherited from

[`FormFieldProps`](FormFieldProps.md).[`displayFunc`](FormFieldProps.md#displayfunc)

***

### overrideRender?

> `optional` **overrideRender?**: (`params`) => `Promise`\<`ReactNode`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:139](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L139)

#### Parameters

##### params

[`FieldRenderParameters`](FieldRenderParameters.md)\<`TForm`, `TValue`\>

#### Returns

`Promise`\<`ReactNode`\>

#### Inherited from

[`FormFieldProps`](FormFieldProps.md).[`overrideRender`](FormFieldProps.md#overriderender)

***

### order

> **order**: `number`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:142](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L142)

#### Inherited from

[`FormFieldProps`](FormFieldProps.md).[`order`](FormFieldProps.md#order)

***

### name

> **name**: `string`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:143](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L143)

#### Inherited from

[`FormFieldProps`](FormFieldProps.md).[`name`](FormFieldProps.md#name)

***

### label?

> `optional` **label?**: [`LabelType`](../type-aliases/LabelType.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:144](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L144)

#### Inherited from

[`FormFieldProps`](FormFieldProps.md).[`label`](FormFieldProps.md#label)

***

### tooltip?

> `optional` **tooltip?**: [`ConditionalReactNodeValue`](../type-aliases/ConditionalReactNodeValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:145](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L145)

#### Inherited from

[`FormFieldProps`](FormFieldProps.md).[`tooltip`](FormFieldProps.md#tooltip)

***

### helpText?

> `optional` **helpText?**: [`ConditionalReactNodeValue`](../type-aliases/ConditionalReactNodeValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:146](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L146)

#### Inherited from

[`FormFieldProps`](FormFieldProps.md).[`helpText`](FormFieldProps.md#helptext)

***

### hidden?

> `optional` **hidden?**: [`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:147](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L147)

#### Inherited from

[`FormFieldProps`](FormFieldProps.md).[`hidden`](FormFieldProps.md#hidden)

***

### readonly?

> `optional` **readonly?**: [`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:148](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L148)

#### Inherited from

[`FormFieldProps`](FormFieldProps.md).[`readonly`](FormFieldProps.md#readonly)

***

### attributes?

> `optional` **attributes?**: `Map`\<`string`, `unknown`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:149](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L149)

#### Inherited from

[`FormFieldProps`](FormFieldProps.md).[`attributes`](FormFieldProps.md#attributes)

***

### hideLabel?

> `optional` **hideLabel?**: `boolean`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:150](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L150)

#### Inherited from

[`FormFieldProps`](FormFieldProps.md).[`hideLabel`](FormFieldProps.md#hidelabel)

***

### requiredPermissions?

> `optional` **requiredPermissions?**: `string`[]

Defined in: [listgrid/components/fields/abstract/FormField.tsx:151](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L151)

#### Inherited from

[`FormFieldProps`](FormFieldProps.md).[`requiredPermissions`](FormFieldProps.md#requiredpermissions)

***

### layout?

> `optional` **layout?**: [`FieldLayoutType`](../type-aliases/FieldLayoutType.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:152](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L152)

#### Inherited from

[`FormFieldProps`](FormFieldProps.md).[`layout`](FormFieldProps.md#layout)

***

### lineBreak?

> `optional` **lineBreak?**: `boolean`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:153](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L153)

#### Inherited from

[`FormFieldProps`](FormFieldProps.md).[`lineBreak`](FormFieldProps.md#linebreak)

***

### cardIcon?

> `optional` **cardIcon?**: [`CardIconType`](../type-aliases/CardIconType.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:154](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L154)

#### Inherited from

[`FormFieldProps`](FormFieldProps.md).[`cardIcon`](FormFieldProps.md#cardicon)

***

### viewPreset?

> `optional` **viewPreset?**: [`ViewPreset`](../type-aliases/ViewPreset.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:156](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L156)

#### Inherited from

[`FormFieldProps`](FormFieldProps.md).[`viewPreset`](FormFieldProps.md#viewpreset)

***

### form?

> `optional` **form?**: `object`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:159](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L159)

#### tabId

> **tabId**: `string`

#### fieldGroupId

> **fieldGroupId**: `string`

#### Inherited from

[`FormFieldProps`](FormFieldProps.md).[`form`](FormFieldProps.md#form)

***

### saveValue?

> `optional` **saveValue?**: (`entityForm`, `field`, `renderType?`) => `Promise`\<`TValue`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:161](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L161)

#### Parameters

##### entityForm

[`EntityForm`](../classes/EntityForm.md)\<`TForm`\>

##### field

[`EntityField`](EntityField.md)

##### renderType?

[`RenderType`](../type-aliases/RenderType.md)

#### Returns

`Promise`\<`TValue`\>

#### Inherited from

[`FormFieldProps`](FormFieldProps.md).[`saveValue`](FormFieldProps.md#savevalue)

***

### maskedValueFunc?

> `optional` **maskedValueFunc?**: (`entityForm`, `value`) => `Promise`\<`string`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:166](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L166)

#### Parameters

##### entityForm

[`EntityForm`](../classes/EntityForm.md)\<`TForm`\>

##### value

`TValue`

#### Returns

`Promise`\<`string`\>

#### Inherited from

[`FormFieldProps`](FormFieldProps.md).[`maskedValueFunc`](FormFieldProps.md#maskedvaluefunc)

***

### exceptOnSave?

> `optional` **exceptOnSave?**: `boolean`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:167](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L167)

#### Inherited from

[`FormFieldProps`](FormFieldProps.md).[`exceptOnSave`](FormFieldProps.md#exceptonsave)

***

### listConfig?

> `optional` **listConfig?**: [`IListConfig`](IListConfig.md)

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:113](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/ListableFormField.tsx#L113)

***

### showList?

> `optional` **showList?**: `boolean`

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:116](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/ListableFormField.tsx#L116)

***

### overrideRenderListItem?

> `optional` **overrideRenderListItem?**: (`props`) => `Promise`\<[`ViewListResult`](ViewListResult.md)\>

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:118](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/ListableFormField.tsx#L118)

#### Parameters

##### props

[`ViewListProps`](ViewListProps.md)

#### Returns

`Promise`\<[`ViewListResult`](ViewListResult.md)\>

## Methods

### overrideRenderListFilter()?

> `optional` **overrideRenderListFilter**(`params`): `Promise`\<`ReactNode`\>

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:120](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/ListableFormField.tsx#L120)

#### Parameters

##### params

[`FilterRenderParameters`](FilterRenderParameters.md)\<`TForm`, `TValue`\>

#### Returns

`Promise`\<`ReactNode`\>
