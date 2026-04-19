[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / MultiSelectFieldProps

# Interface: MultiSelectFieldProps

Defined in: [listgrid/components/fields/MultiSelectField.tsx:24](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/MultiSelectField.tsx#L24)

## Extends

- [`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md)

## Properties

### enableImmediateChange?

> `optional` **enableImmediateChange?**: `boolean`

Defined in: [listgrid/components/fields/MultiSelectField.tsx:29](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/MultiSelectField.tsx#L29)

즉시 변경 기능 활성화 여부.
true로 설정하면 옵션 선택 즉시 API를 호출하여 상태를 변경합니다.

***

### reason?

> `optional` **reason?**: [`StatusChangeReason`](StatusChangeReason.md)[]

Defined in: [listgrid/components/fields/MultiSelectField.tsx:35](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/MultiSelectField.tsx#L35)

상태 변경 시 사유 입력 설정.
특정 상태로 변경 시 사유 입력을 요구할 수 있습니다.

***

### validateStatusChange?

> `optional` **validateStatusChange?**: [`StatusChangeValidation`](StatusChangeValidation.md)

Defined in: [listgrid/components/fields/MultiSelectField.tsx:41](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/MultiSelectField.tsx#L41)

상태 변경 시 검증 로직 설정.
상태 변경 전에 추가적인 검증을 수행할 수 있습니다.

***

### value?

> `optional` **value?**: [`FieldValue`](FieldValue.md)\<`any`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:120](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L120)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`value`](MultipleOptionalFieldProps.md#value)

***

### placeHolder?

> `optional` **placeHolder?**: [`ConditionalStringValue`](../type-aliases/ConditionalStringValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:125](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L125)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`placeHolder`](MultipleOptionalFieldProps.md#placeholder)

***

### required?

> `optional` **required?**: [`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:126](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L126)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`required`](MultipleOptionalFieldProps.md#required)

***

### validations?

> `optional` **validations?**: [`Validation`](Validation.md)[]

Defined in: [listgrid/components/fields/abstract/FormField.tsx:127](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L127)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`validations`](MultipleOptionalFieldProps.md#validations)

***

### displayFunc?

> `optional` **displayFunc?**: (`entityForm`, `field`, `renderType?`) => `Promise`\<`any`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:134](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L134)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:139](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L139)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:142](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L142)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`order`](MultipleOptionalFieldProps.md#order)

***

### name

> **name**: `string`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:143](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L143)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`name`](MultipleOptionalFieldProps.md#name)

***

### label?

> `optional` **label?**: [`LabelType`](../type-aliases/LabelType.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:144](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L144)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`label`](MultipleOptionalFieldProps.md#label)

***

### tooltip?

> `optional` **tooltip?**: [`ConditionalReactNodeValue`](../type-aliases/ConditionalReactNodeValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:145](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L145)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`tooltip`](MultipleOptionalFieldProps.md#tooltip)

***

### helpText?

> `optional` **helpText?**: [`ConditionalReactNodeValue`](../type-aliases/ConditionalReactNodeValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:146](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L146)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`helpText`](MultipleOptionalFieldProps.md#helptext)

***

### hidden?

> `optional` **hidden?**: [`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:147](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L147)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`hidden`](MultipleOptionalFieldProps.md#hidden)

***

### readonly?

> `optional` **readonly?**: [`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:148](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L148)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`readonly`](MultipleOptionalFieldProps.md#readonly)

***

### attributes?

> `optional` **attributes?**: `Map`\<`string`, `unknown`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:149](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L149)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`attributes`](MultipleOptionalFieldProps.md#attributes)

***

### hideLabel?

> `optional` **hideLabel?**: `boolean`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:150](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L150)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`hideLabel`](MultipleOptionalFieldProps.md#hidelabel)

***

### requiredPermissions?

> `optional` **requiredPermissions?**: `string`[]

Defined in: [listgrid/components/fields/abstract/FormField.tsx:151](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L151)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`requiredPermissions`](MultipleOptionalFieldProps.md#requiredpermissions)

***

### layout?

> `optional` **layout?**: [`FieldLayoutType`](../type-aliases/FieldLayoutType.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:152](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L152)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`layout`](MultipleOptionalFieldProps.md#layout)

***

### lineBreak?

> `optional` **lineBreak?**: `boolean`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:153](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L153)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`lineBreak`](MultipleOptionalFieldProps.md#linebreak)

***

### cardIcon?

> `optional` **cardIcon?**: [`CardIconType`](../type-aliases/CardIconType.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:154](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L154)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`cardIcon`](MultipleOptionalFieldProps.md#cardicon)

***

### viewPreset?

> `optional` **viewPreset?**: [`ViewPreset`](../type-aliases/ViewPreset.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:156](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L156)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`viewPreset`](MultipleOptionalFieldProps.md#viewpreset)

***

### form?

> `optional` **form?**: `object`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:159](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L159)

#### tabId

> **tabId**: `string`

#### fieldGroupId

> **fieldGroupId**: `string`

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`form`](MultipleOptionalFieldProps.md#form)

***

### saveValue?

> `optional` **saveValue?**: (`entityForm`, `field`, `renderType?`) => `Promise`\<`any`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:161](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L161)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:166](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L166)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:167](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L167)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`exceptOnSave`](MultipleOptionalFieldProps.md#exceptonsave)

***

### listConfig?

> `optional` **listConfig?**: [`IListConfig`](IListConfig.md)

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:113](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/ListableFormField.tsx#L113)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`listConfig`](MultipleOptionalFieldProps.md#listconfig)

***

### showList?

> `optional` **showList?**: `boolean`

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:116](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/ListableFormField.tsx#L116)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`showList`](MultipleOptionalFieldProps.md#showlist)

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

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`overrideRenderListItem`](MultipleOptionalFieldProps.md#overriderenderlistitem)

***

### combo?

> `optional` **combo?**: [`ComboProps`](ComboProps.md)

Defined in: [listgrid/components/fields/abstract/OptionalField.tsx:55](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/OptionalField.tsx#L55)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`combo`](MultipleOptionalFieldProps.md#combo)

***

### options?

> `optional` **options?**: [`SelectOption`](SelectOption.md)[]

Defined in: [listgrid/components/fields/abstract/OptionalField.tsx:56](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/OptionalField.tsx#L56)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`options`](MultipleOptionalFieldProps.md#options)

***

### preservedOptions?

> `optional` **preservedOptions?**: [`SelectOption`](SelectOption.md)[]

Defined in: [listgrid/components/fields/abstract/OptionalField.tsx:57](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/OptionalField.tsx#L57)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`preservedOptions`](MultipleOptionalFieldProps.md#preservedoptions)

***

### chipConfig?

> `optional` **chipConfig?**: [`ChipConfig`](ChipConfig.md)

Defined in: [listgrid/components/fields/abstract/OptionalField.tsx:58](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/OptionalField.tsx#L58)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`chipConfig`](MultipleOptionalFieldProps.md#chipconfig)

***

### singleFilter?

> `optional` **singleFilter?**: `boolean`

Defined in: [listgrid/components/fields/abstract/OptionalField.tsx:59](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/OptionalField.tsx#L59)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`singleFilter`](MultipleOptionalFieldProps.md#singlefilter)

***

### limit?

> `optional` **limit?**: [`MinMaxLimit`](../type-aliases/MinMaxLimit.md)

Defined in: [listgrid/components/fields/abstract/OptionalField.tsx:214](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/OptionalField.tsx#L214)

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`limit`](MultipleOptionalFieldProps.md#limit)

## Methods

### overrideRenderListFilter()?

> `optional` **overrideRenderListFilter**(`params`): `Promise`\<`ReactNode`\>

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:120](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/ListableFormField.tsx#L120)

#### Parameters

##### params

[`FilterRenderParameters`](FilterRenderParameters.md)\<`any`, `any`\>

#### Returns

`Promise`\<`ReactNode`\>

#### Inherited from

[`MultipleOptionalFieldProps`](MultipleOptionalFieldProps.md).[`overrideRenderListFilter`](MultipleOptionalFieldProps.md#overriderenderlistfilter)
