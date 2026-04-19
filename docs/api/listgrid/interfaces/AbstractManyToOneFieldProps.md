[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / AbstractManyToOneFieldProps

# Interface: AbstractManyToOneFieldProps\<TValue, TForm\>

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:62](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L62)

## Extends

- [`ListableFormFieldProps`](ListableFormFieldProps.md)\<`TValue`, `TForm`\>

## Type Parameters

### TValue

`TValue` = `any`

### TForm

`TForm` *extends* `object` = `any`

## Properties

### config

> **config**: [`ManyToOneConfig`](ManyToOneConfig.md)

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:66](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L66)

***

### useCardView?

> `optional` **useCardView?**: `boolean`

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:68](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L68)

카드뷰 사용 여부

***

### cardViewConfig?

> `optional` **cardViewConfig?**: [`CardViewConfig`](CardViewConfig.md)

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:70](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L70)

카드뷰 설정

***

### useSelectBoxView?

> `optional` **useSelectBoxView?**: `boolean`

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:72](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L72)

셀렉트박스뷰 사용 여부

***

### selectBoxViewConfig?

> `optional` **selectBoxViewConfig?**: [`SelectBoxViewConfig`](SelectBoxViewConfig.md)

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:74](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L74)

셀렉트박스뷰 설정

***

### value?

> `optional` **value?**: [`FieldValue`](FieldValue.md)\<`TValue`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:120](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L120)

#### Inherited from

[`ListableFormFieldProps`](ListableFormFieldProps.md).[`value`](ListableFormFieldProps.md#value)

***

### placeHolder?

> `optional` **placeHolder?**: [`ConditionalStringValue`](../type-aliases/ConditionalStringValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:125](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L125)

#### Inherited from

[`ListableFormFieldProps`](ListableFormFieldProps.md).[`placeHolder`](ListableFormFieldProps.md#placeholder)

***

### required?

> `optional` **required?**: [`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:126](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L126)

#### Inherited from

[`ListableFormFieldProps`](ListableFormFieldProps.md).[`required`](ListableFormFieldProps.md#required)

***

### validations?

> `optional` **validations?**: [`Validation`](Validation.md)[]

Defined in: [listgrid/components/fields/abstract/FormField.tsx:127](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L127)

#### Inherited from

[`ListableFormFieldProps`](ListableFormFieldProps.md).[`validations`](ListableFormFieldProps.md#validations)

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

[`ListableFormFieldProps`](ListableFormFieldProps.md).[`displayFunc`](ListableFormFieldProps.md#displayfunc)

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

[`ListableFormFieldProps`](ListableFormFieldProps.md).[`overrideRender`](ListableFormFieldProps.md#overriderender)

***

### order

> **order**: `number`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:142](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L142)

#### Inherited from

[`ListableFormFieldProps`](ListableFormFieldProps.md).[`order`](ListableFormFieldProps.md#order)

***

### name

> **name**: `string`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:143](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L143)

#### Inherited from

[`ListableFormFieldProps`](ListableFormFieldProps.md).[`name`](ListableFormFieldProps.md#name)

***

### label?

> `optional` **label?**: [`LabelType`](../type-aliases/LabelType.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:144](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L144)

#### Inherited from

[`ListableFormFieldProps`](ListableFormFieldProps.md).[`label`](ListableFormFieldProps.md#label)

***

### tooltip?

> `optional` **tooltip?**: [`ConditionalReactNodeValue`](../type-aliases/ConditionalReactNodeValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:145](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L145)

#### Inherited from

[`ListableFormFieldProps`](ListableFormFieldProps.md).[`tooltip`](ListableFormFieldProps.md#tooltip)

***

### helpText?

> `optional` **helpText?**: [`ConditionalReactNodeValue`](../type-aliases/ConditionalReactNodeValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:146](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L146)

#### Inherited from

[`ListableFormFieldProps`](ListableFormFieldProps.md).[`helpText`](ListableFormFieldProps.md#helptext)

***

### hidden?

> `optional` **hidden?**: [`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:147](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L147)

#### Inherited from

[`ListableFormFieldProps`](ListableFormFieldProps.md).[`hidden`](ListableFormFieldProps.md#hidden)

***

### readonly?

> `optional` **readonly?**: [`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:148](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L148)

#### Inherited from

[`ListableFormFieldProps`](ListableFormFieldProps.md).[`readonly`](ListableFormFieldProps.md#readonly)

***

### attributes?

> `optional` **attributes?**: `Map`\<`string`, `unknown`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:149](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L149)

#### Inherited from

[`ListableFormFieldProps`](ListableFormFieldProps.md).[`attributes`](ListableFormFieldProps.md#attributes)

***

### hideLabel?

> `optional` **hideLabel?**: `boolean`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:150](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L150)

#### Inherited from

[`ListableFormFieldProps`](ListableFormFieldProps.md).[`hideLabel`](ListableFormFieldProps.md#hidelabel)

***

### requiredPermissions?

> `optional` **requiredPermissions?**: `string`[]

Defined in: [listgrid/components/fields/abstract/FormField.tsx:151](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L151)

#### Inherited from

[`ListableFormFieldProps`](ListableFormFieldProps.md).[`requiredPermissions`](ListableFormFieldProps.md#requiredpermissions)

***

### layout?

> `optional` **layout?**: [`FieldLayoutType`](../type-aliases/FieldLayoutType.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:152](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L152)

#### Inherited from

[`ListableFormFieldProps`](ListableFormFieldProps.md).[`layout`](ListableFormFieldProps.md#layout)

***

### lineBreak?

> `optional` **lineBreak?**: `boolean`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:153](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L153)

#### Inherited from

[`ListableFormFieldProps`](ListableFormFieldProps.md).[`lineBreak`](ListableFormFieldProps.md#linebreak)

***

### cardIcon?

> `optional` **cardIcon?**: [`CardIconType`](../type-aliases/CardIconType.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:154](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L154)

#### Inherited from

[`ListableFormFieldProps`](ListableFormFieldProps.md).[`cardIcon`](ListableFormFieldProps.md#cardicon)

***

### viewPreset?

> `optional` **viewPreset?**: [`ViewPreset`](../type-aliases/ViewPreset.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:156](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L156)

#### Inherited from

[`ListableFormFieldProps`](ListableFormFieldProps.md).[`viewPreset`](ListableFormFieldProps.md#viewpreset)

***

### form?

> `optional` **form?**: `object`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:159](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L159)

#### tabId

> **tabId**: `string`

#### fieldGroupId

> **fieldGroupId**: `string`

#### Inherited from

[`ListableFormFieldProps`](ListableFormFieldProps.md).[`form`](ListableFormFieldProps.md#form)

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

[`ListableFormFieldProps`](ListableFormFieldProps.md).[`saveValue`](ListableFormFieldProps.md#savevalue)

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

[`ListableFormFieldProps`](ListableFormFieldProps.md).[`maskedValueFunc`](ListableFormFieldProps.md#maskedvaluefunc)

***

### exceptOnSave?

> `optional` **exceptOnSave?**: `boolean`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:167](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L167)

#### Inherited from

[`ListableFormFieldProps`](ListableFormFieldProps.md).[`exceptOnSave`](ListableFormFieldProps.md#exceptonsave)

***

### listConfig?

> `optional` **listConfig?**: [`IListConfig`](IListConfig.md)

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:113](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/ListableFormField.tsx#L113)

#### Inherited from

[`ListableFormFieldProps`](ListableFormFieldProps.md).[`listConfig`](ListableFormFieldProps.md#listconfig)

***

### showList?

> `optional` **showList?**: `boolean`

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:116](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/ListableFormField.tsx#L116)

#### Inherited from

[`ListableFormFieldProps`](ListableFormFieldProps.md).[`showList`](ListableFormFieldProps.md#showlist)

***

### overrideRenderListItem?

> `optional` **overrideRenderListItem?**: (`props`) => `Promise`\<[`ViewListResult`](ViewListResult.md)\>

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:118](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/ListableFormField.tsx#L118)

#### Parameters

##### props

[`ViewListProps`](ViewListProps.md)

#### Returns

`Promise`\<[`ViewListResult`](ViewListResult.md)\>

#### Inherited from

[`ListableFormFieldProps`](ListableFormFieldProps.md).[`overrideRenderListItem`](ListableFormFieldProps.md#overriderenderlistitem)

## Methods

### overrideRenderListFilter()?

> `optional` **overrideRenderListFilter**(`params`): `Promise`\<`ReactNode`\>

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:120](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/ListableFormField.tsx#L120)

#### Parameters

##### params

[`FilterRenderParameters`](FilterRenderParameters.md)\<`TForm`, `TValue`\>

#### Returns

`Promise`\<`ReactNode`\>

#### Inherited from

[`ListableFormFieldProps`](ListableFormFieldProps.md).[`overrideRenderListFilter`](ListableFormFieldProps.md#overriderenderlistfilter)
