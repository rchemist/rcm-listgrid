[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / MultiSelectFieldProps

# Interface: MultiSelectFieldProps

Defined in: [listgrid/components/fields/MultiSelectField.tsx:17](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/MultiSelectField.tsx#L17)

## Extends

- [`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md)

## Properties

### enableImmediateChange?

> `optional` **enableImmediateChange?**: `boolean`

Defined in: [listgrid/components/fields/MultiSelectField.tsx:22](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/MultiSelectField.tsx#L22)

즉시 변경 기능 활성화 여부.
true로 설정하면 옵션 선택 즉시 API를 호출하여 상태를 변경합니다.

***

### reason?

> `optional` **reason?**: [`StatusChangeReason`](StatusChangeReason.md)[]

Defined in: [listgrid/components/fields/MultiSelectField.tsx:28](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/MultiSelectField.tsx#L28)

상태 변경 시 사유 입력 설정.
특정 상태로 변경 시 사유 입력을 요구할 수 있습니다.

***

### validateStatusChange?

> `optional` **validateStatusChange?**: [`StatusChangeValidation`](StatusChangeValidation.md)

Defined in: [listgrid/components/fields/MultiSelectField.tsx:34](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/MultiSelectField.tsx#L34)

상태 변경 시 검증 로직 설정.
상태 변경 전에 추가적인 검증을 수행할 수 있습니다.

***

### value?

> `optional` **value?**: [`FieldValue`](FieldValue.md)\<`any`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:113](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L113)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`value`](MultipleOptionalFieldProps.md#value)

***

### placeHolder?

> `optional` **placeHolder?**: [`ConditionalStringValue`](../type-aliases/ConditionalStringValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:118](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L118)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`placeHolder`](MultipleOptionalFieldProps.md#placeholder)

***

### required?

> `optional` **required?**: [`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:119](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L119)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`required`](MultipleOptionalFieldProps.md#required)

***

### validations?

> `optional` **validations?**: [`Validation`](Validation.md)[]

Defined in: [listgrid/components/fields/abstract/FormField.tsx:120](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L120)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`validations`](MultipleOptionalFieldProps.md#validations)

***

### displayFunc?

> `optional` **displayFunc?**: (`entityForm`, `field`, `renderType?`) => `Promise`\<`any`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:127](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L127)

display value 를 변조할 수 있다.

#### Parameters

##### entityForm

[`EntityForm`](../classes/EntityForm.md)\<`any`\>

##### field

[`EntityField`](EntityField.md)

##### renderType?

[`RenderType`](../type-aliases/RenderType.md)

#### Returns

`Promise`\<`any`\>

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`displayFunc`](MultipleOptionalFieldProps.md#displayfunc)

***

### overrideRender?

> `optional` **overrideRender?**: (`params`) => `Promise`\<`ReactNode`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:132](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L132)

#### Parameters

##### params

[`FieldRenderParameters`](FieldRenderParameters.md)\<`any`, `any`\>

#### Returns

`Promise`\<`ReactNode`\>

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`overrideRender`](MultipleOptionalFieldProps.md#overriderender)

***

### order

> **order**: `number`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:135](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L135)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`order`](MultipleOptionalFieldProps.md#order)

***

### name

> **name**: `string`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:136](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L136)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`name`](MultipleOptionalFieldProps.md#name)

***

### label?

> `optional` **label?**: [`LabelType`](../type-aliases/LabelType.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:137](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L137)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`label`](MultipleOptionalFieldProps.md#label)

***

### tooltip?

> `optional` **tooltip?**: [`ConditionalReactNodeValue`](../type-aliases/ConditionalReactNodeValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:138](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L138)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`tooltip`](MultipleOptionalFieldProps.md#tooltip)

***

### helpText?

> `optional` **helpText?**: [`ConditionalReactNodeValue`](../type-aliases/ConditionalReactNodeValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:139](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L139)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`helpText`](MultipleOptionalFieldProps.md#helptext)

***

### hidden?

> `optional` **hidden?**: [`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:140](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L140)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`hidden`](MultipleOptionalFieldProps.md#hidden)

***

### readonly?

> `optional` **readonly?**: [`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:141](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L141)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`readonly`](MultipleOptionalFieldProps.md#readonly)

***

### attributes?

> `optional` **attributes?**: `Map`\<`string`, `unknown`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:142](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L142)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`attributes`](MultipleOptionalFieldProps.md#attributes)

***

### hideLabel?

> `optional` **hideLabel?**: `boolean`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:143](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L143)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`hideLabel`](MultipleOptionalFieldProps.md#hidelabel)

***

### requiredPermissions?

> `optional` **requiredPermissions?**: `string`[]

Defined in: [listgrid/components/fields/abstract/FormField.tsx:144](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L144)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`requiredPermissions`](MultipleOptionalFieldProps.md#requiredpermissions)

***

### layout?

> `optional` **layout?**: [`FieldLayoutType`](../type-aliases/FieldLayoutType.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:145](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L145)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`layout`](MultipleOptionalFieldProps.md#layout)

***

### lineBreak?

> `optional` **lineBreak?**: `boolean`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:146](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L146)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`lineBreak`](MultipleOptionalFieldProps.md#linebreak)

***

### cardIcon?

> `optional` **cardIcon?**: [`CardIconType`](../type-aliases/CardIconType.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:147](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L147)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`cardIcon`](MultipleOptionalFieldProps.md#cardicon)

***

### viewPreset?

> `optional` **viewPreset?**: [`ViewPreset`](../type-aliases/ViewPreset.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:149](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L149)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`viewPreset`](MultipleOptionalFieldProps.md#viewpreset)

***

### form?

> `optional` **form?**: `object`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:152](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L152)

#### tabId

> **tabId**: `string`

#### fieldGroupId

> **fieldGroupId**: `string`

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`form`](MultipleOptionalFieldProps.md#form)

***

### saveValue?

> `optional` **saveValue?**: (`entityForm`, `field`, `renderType?`) => `Promise`\<`any`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:154](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L154)

#### Parameters

##### entityForm

[`EntityForm`](../classes/EntityForm.md)\<`any`\>

##### field

[`EntityField`](EntityField.md)

##### renderType?

[`RenderType`](../type-aliases/RenderType.md)

#### Returns

`Promise`\<`any`\>

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`saveValue`](MultipleOptionalFieldProps.md#savevalue)

***

### maskedValueFunc?

> `optional` **maskedValueFunc?**: (`entityForm`, `value`) => `Promise`\<`string`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:159](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L159)

#### Parameters

##### entityForm

[`EntityForm`](../classes/EntityForm.md)\<`any`\>

##### value

`any`

#### Returns

`Promise`\<`string`\>

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`maskedValueFunc`](MultipleOptionalFieldProps.md#maskedvaluefunc)

***

### exceptOnSave?

> `optional` **exceptOnSave?**: `boolean`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:160](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L160)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`exceptOnSave`](MultipleOptionalFieldProps.md#exceptonsave)

***

### listConfig?

> `optional` **listConfig?**: [`IListConfig`](IListConfig.md)

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:106](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/ListableFormField.tsx#L106)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`listConfig`](MultipleOptionalFieldProps.md#listconfig)

***

### showList?

> `optional` **showList?**: `boolean`

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:109](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/ListableFormField.tsx#L109)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`showList`](MultipleOptionalFieldProps.md#showlist)

***

### overrideRenderListItem?

> `optional` **overrideRenderListItem?**: (`props`) => `Promise`\<[`ViewListResult`](ViewListResult.md)\>

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:111](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/ListableFormField.tsx#L111)

#### Parameters

##### props

[`ViewListProps`](ViewListProps.md)

#### Returns

`Promise`\<[`ViewListResult`](ViewListResult.md)\>

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`overrideRenderListItem`](MultipleOptionalFieldProps.md#overriderenderlistitem)

***

### combo?

> `optional` **combo?**: [`ComboProps`](ComboProps.md)

Defined in: [listgrid/components/fields/abstract/OptionalField.tsx:48](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/OptionalField.tsx#L48)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`combo`](MultipleOptionalFieldProps.md#combo)

***

### options?

> `optional` **options?**: [`SelectOption`](SelectOption.md)[]

Defined in: [listgrid/components/fields/abstract/OptionalField.tsx:49](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/OptionalField.tsx#L49)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`options`](MultipleOptionalFieldProps.md#options)

***

### preservedOptions?

> `optional` **preservedOptions?**: [`SelectOption`](SelectOption.md)[]

Defined in: [listgrid/components/fields/abstract/OptionalField.tsx:50](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/OptionalField.tsx#L50)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`preservedOptions`](MultipleOptionalFieldProps.md#preservedoptions)

***

### chipConfig?

> `optional` **chipConfig?**: [`ChipConfig`](ChipConfig.md)

Defined in: [listgrid/components/fields/abstract/OptionalField.tsx:51](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/OptionalField.tsx#L51)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`chipConfig`](MultipleOptionalFieldProps.md#chipconfig)

***

### singleFilter?

> `optional` **singleFilter?**: `boolean`

Defined in: [listgrid/components/fields/abstract/OptionalField.tsx:52](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/OptionalField.tsx#L52)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`singleFilter`](MultipleOptionalFieldProps.md#singlefilter)

***

### limit?

> `optional` **limit?**: [`MinMaxLimit`](../type-aliases/MinMaxLimit.md)

Defined in: [listgrid/components/fields/abstract/OptionalField.tsx:207](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/OptionalField.tsx#L207)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`limit`](MultipleOptionalFieldProps.md#limit)

## Methods

### overrideRenderListFilter()?

> `optional` **overrideRenderListFilter**(`params`): `Promise`\<`ReactNode`\>

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:113](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/ListableFormField.tsx#L113)

#### Parameters

##### params

[`FilterRenderParameters`](FilterRenderParameters.md)\<`any`, `any`\>

#### Returns

`Promise`\<`ReactNode`\>

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`overrideRenderListFilter`](MultipleOptionalFieldProps.md#overriderenderlistfilter)
