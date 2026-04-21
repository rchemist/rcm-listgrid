[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / EntityField

# Interface: EntityField

Defined in: [listgrid/config/EntityField.ts:9](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L9)

## Extends

- [`EntityItem`](EntityItem.md)

## Properties

### value?

> `optional` **value?**: [`FieldValue`](FieldValue.md)\<`any`\>

Defined in: [listgrid/config/EntityField.ts:10](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L10)

***

### type

> **type**: [`FieldType`](../type-aliases/FieldType.md)

Defined in: [listgrid/config/EntityField.ts:11](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L11)

***

### placeHolder?

> `optional` **placeHolder?**: [`ConditionalStringValue`](../type-aliases/ConditionalStringValue.md)

Defined in: [listgrid/config/EntityField.ts:13](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L13)

***

### required?

> `optional` **required?**: [`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

Defined in: [listgrid/config/EntityField.ts:14](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L14)

***

### validations?

> `optional` **validations?**: [`Validation`](Validation.md)[]

Defined in: [listgrid/config/EntityField.ts:15](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L15)

***

### exceptOnSave?

> `optional` **exceptOnSave?**: `boolean`

Defined in: [listgrid/config/EntityField.ts:16](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L16)

***

### requiredPermissions?

> `optional` **requiredPermissions?**: `string`[]

Defined in: [listgrid/config/EntityField.ts:17](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L17)

***

### attributes?

> `optional` **attributes?**: `Map`\<`string`, `unknown`\>

Defined in: [listgrid/config/EntityField.ts:24](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L24)

ViewField 할 때 사용할 수 있다.
필드를 커스텀으로 표시하게 하는데 필요한 여러 정보를 자유롭게 사용할 수 있다.
이 정보는 저장 용도로는 사용되지 않는다.

***

### validationState?

> `optional` **validationState?**: `object`

Defined in: [listgrid/config/EntityField.ts:30](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L30)

CheckButtonValidation의 검증 상태를 저장
탭 전환 시에도 상태를 유지하기 위함

#### validated

> **validated**: `boolean`

#### message?

> `optional` **message?**: `string`

***

### displayFunc?

> `optional` **displayFunc?**: (`entityForm`, `field`, `renderType?`) => `Promise`\<`any`\>

Defined in: [listgrid/config/EntityField.ts:40](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L40)

display value 를 변조할 수 있다.

#### Parameters

##### entityForm

[`EntityForm`](../classes/EntityForm.md)

##### field

`EntityField`

##### renderType?

[`RenderType`](../type-aliases/RenderType.md)

#### Returns

`Promise`\<`any`\>

***

### overrideRender?

> `optional` **overrideRender?**: (`params`) => `Promise`\<`ReactNode`\>

Defined in: [listgrid/config/EntityField.ts:51](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L51)

view 를 오버라이드 해 사용자정의 렌더링을 처리하는 경우 이 값을 설정한다.
ReactNode 나 null 을 반환하면 기존 view 를 완전히 대체하게 되고, undefined 를 반환하면 기존 View 를 사용하게 된다.

#### Parameters

##### params

[`FieldRenderParameters`](FieldRenderParameters.md)

#### Returns

`Promise`\<`ReactNode`\>

***

### saveValue?

> `optional` **saveValue?**: (`entityForm`, `field`, `renderType?`) => `Promise`\<`any`\>

Defined in: [listgrid/config/EntityField.ts:58](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L58)

EntityForm 을 저장할 때 생성하는 formData 에 제공할 값을 override 할 수 있다.

#### Parameters

##### entityForm

[`EntityForm`](../classes/EntityForm.md)

##### field

`EntityField`

##### renderType?

[`RenderType`](../type-aliases/RenderType.md)

#### Returns

`Promise`\<`any`\>

***

### order

> **order**: `number`

Defined in: [listgrid/config/EntityItem.ts:13](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityItem.ts#L13)

#### Inherited from

[`EntityItem`](EntityItem.md).[`order`](EntityItem.md#order)

***

### name

> **name**: `string`

Defined in: [listgrid/config/EntityItem.ts:14](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityItem.ts#L14)

#### Inherited from

[`EntityItem`](EntityItem.md).[`name`](EntityItem.md#name)

***

### label?

> `optional` **label?**: [`LabelType`](../type-aliases/LabelType.md)

Defined in: [listgrid/config/EntityItem.ts:15](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityItem.ts#L15)

#### Inherited from

`EntityField`.[`label`](#label)

***

### helpText?

> `optional` **helpText?**: [`ConditionalReactNodeValue`](../type-aliases/ConditionalReactNodeValue.md)

Defined in: [listgrid/config/EntityItem.ts:16](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityItem.ts#L16)

#### Inherited from

`EntityField`.[`helpText`](#helptext)

***

### hidden?

> `optional` **hidden?**: [`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

Defined in: [listgrid/config/EntityItem.ts:17](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityItem.ts#L17)

#### Inherited from

`EntityField`.[`hidden`](#hidden)

***

### readonly?

> `optional` **readonly?**: [`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

Defined in: [listgrid/config/EntityItem.ts:18](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityItem.ts#L18)

#### Inherited from

`EntityField`.[`readonly`](#readonly)

***

### hideLabel?

> `optional` **hideLabel?**: `boolean`

Defined in: [listgrid/config/EntityItem.ts:19](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityItem.ts#L19)

#### Inherited from

`EntityField`.[`hideLabel`](#hidelabel)

***

### form?

> `optional` **form?**: `object`

Defined in: [listgrid/config/EntityItem.ts:22](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityItem.ts#L22)

#### tabId

> **tabId**: `string`

#### fieldGroupId

> **fieldGroupId**: `string`

#### Inherited from

[`EntityItem`](EntityItem.md).[`form`](EntityItem.md#form)

## Methods

### view()

> **view**(`params`): `Promise`\<`ReactNode`\>

Defined in: [listgrid/config/EntityField.ts:60](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L60)

#### Parameters

##### params

[`FieldRenderParameters`](FieldRenderParameters.md)

#### Returns

`Promise`\<`ReactNode`\>

***

### isDirty()

> **isDirty**(): `boolean`

Defined in: [listgrid/config/EntityField.ts:62](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L62)

#### Returns

`boolean`

***

### isRequired()

> **isRequired**(`props`): `Promise`\<`boolean`\>

Defined in: [listgrid/config/EntityField.ts:64](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L64)

#### Parameters

##### props

[`FieldInfoParameters`](FieldInfoParameters.md)

#### Returns

`Promise`\<`boolean`\>

***

### isBlank()

> **isBlank**(`renderType?`): `Promise`\<`boolean`\>

Defined in: [listgrid/config/EntityField.ts:66](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L66)

#### Parameters

##### renderType?

[`RenderType`](../type-aliases/RenderType.md)

#### Returns

`Promise`\<`boolean`\>

***

### withDisplayFunc()

> **withDisplayFunc**(`fn`): `this`

Defined in: [listgrid/config/EntityField.ts:68](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L68)

#### Parameters

##### fn

(`entityForm`, `field`, `renderType?`) => `Promise`\<`any`\>

#### Returns

`this`

***

### withOverrideRender()

> **withOverrideRender**(`fn`): `this`

Defined in: [listgrid/config/EntityField.ts:72](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L72)

#### Parameters

##### fn

(`params`) => `Promise`\<`ReactNode`\>

#### Returns

`this`

***

### withPlaceHolder()

> **withPlaceHolder**(`placeHolder?`): `this`

Defined in: [listgrid/config/EntityField.ts:76](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L76)

#### Parameters

##### placeHolder?

[`ConditionalStringValue`](../type-aliases/ConditionalStringValue.md)

#### Returns

`this`

***

### withRequired()

> **withRequired**(`required?`): `this`

Defined in: [listgrid/config/EntityField.ts:78](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L78)

#### Parameters

##### required?

[`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

#### Returns

`this`

***

### withValue()

> **withValue**(`value`): `this`

Defined in: [listgrid/config/EntityField.ts:80](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L80)

#### Parameters

##### value

`any`

#### Returns

`this`

***

### getDisplayValue()

> **getDisplayValue**(`entityForm`, `renderType?`): `Promise`\<`any`\>

Defined in: [listgrid/config/EntityField.ts:82](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L82)

#### Parameters

##### entityForm

[`EntityForm`](../classes/EntityForm.md)

##### renderType?

[`RenderType`](../type-aliases/RenderType.md)

#### Returns

`Promise`\<`any`\>

***

### getPlaceHolder()

> **getPlaceHolder**(`props`): `Promise`\<`string`\>

Defined in: [listgrid/config/EntityField.ts:84](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L84)

#### Parameters

##### props

[`FieldInfoParameters`](FieldInfoParameters.md)

#### Returns

`Promise`\<`string`\>

***

### getSaveValue()

> **getSaveValue**(`entityForm`, `renderType?`): `Promise`\<`any`\>

Defined in: [listgrid/config/EntityField.ts:86](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L86)

#### Parameters

##### entityForm

[`EntityForm`](../classes/EntityForm.md)

##### renderType?

[`RenderType`](../type-aliases/RenderType.md)

#### Returns

`Promise`\<`any`\>

***

### getCurrentValue()

> **getCurrentValue**(`renderType?`): `Promise`\<`any`\>

Defined in: [listgrid/config/EntityField.ts:88](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L88)

#### Parameters

##### renderType?

[`RenderType`](../type-aliases/RenderType.md)

#### Returns

`Promise`\<`any`\>

***

### resetValue()

> **resetValue**(`renderType?`): `void`

Defined in: [listgrid/config/EntityField.ts:90](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L90)

#### Parameters

##### renderType?

[`RenderType`](../type-aliases/RenderType.md)

#### Returns

`void`

***

### withValidations()

> **withValidations**(...`validation`): `this`

Defined in: [listgrid/config/EntityField.ts:92](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L92)

#### Parameters

##### validation

...[`Validation`](Validation.md)[]

#### Returns

`this`

***

### validate()

> **validate**(`entityForm`, `session?`): `Promise`\<[`ValidateResult`](../classes/ValidateResult.md) \| [`ValidateResult`](../classes/ValidateResult.md)[]\>

Defined in: [listgrid/config/EntityField.ts:94](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L94)

#### Parameters

##### entityForm

[`EntityForm`](../classes/EntityForm.md)

##### session?

[`Session`](Session.md)

#### Returns

`Promise`\<[`ValidateResult`](../classes/ValidateResult.md) \| [`ValidateResult`](../classes/ValidateResult.md)[]\>

***

### withDefaultValue()

> **withDefaultValue**(`value`): `this`

Defined in: [listgrid/config/EntityField.ts:96](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L96)

#### Parameters

##### value

`any`

#### Returns

`this`

***

### withAttributes()

> **withAttributes**(`attributes`): `this`

Defined in: [listgrid/config/EntityField.ts:98](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L98)

#### Parameters

##### attributes

`Map`\<`string`, `unknown`\>

#### Returns

`this`

***

### getFetchedValue()

> **getFetchedValue**(): `Promise`\<`any`\>

Defined in: [listgrid/config/EntityField.ts:100](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L100)

#### Returns

`Promise`\<`any`\>

***

### withRequiredPermissions()

> **withRequiredPermissions**(...`permissions`): `this`

Defined in: [listgrid/config/EntityField.ts:106](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L106)

이 필드를 보기 위해 필요한 권한을 설정합니다.
사용자가 지정된 권한 중 하나라도 가지고 있으면 필드가 표시됩니다.

#### Parameters

##### permissions

...`string`[]

#### Returns

`this`

***

### isPermitted()

> **isPermitted**(`userPermissions?`): `boolean`

Defined in: [listgrid/config/EntityField.ts:113](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L113)

사용자가 이 필드를 볼 수 있는 권한이 있는지 확인합니다.
requiredPermissions가 없거나 비어있으면 true를 반환합니다.
사용자가 requiredPermissions 중 하나라도 가지고 있으면 true를 반환합니다.

#### Parameters

##### userPermissions?

`string`[]

#### Returns

`boolean`

***

### viewValue()

> **viewValue**(`props`): `Promise`\<[`ViewValueResult`](ViewValueResult.md)\>

Defined in: [listgrid/config/EntityField.ts:122](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L122)

View 모드에서 필드 값을 렌더링합니다.
각 필드 타입별로 적절한 포맷팅을 적용합니다.
(예: NumberField는 formatPrice, SelectField는 Badge 등)

#### Parameters

##### props

[`ViewValueProps`](ViewValueProps.md)

View 렌더링에 필요한 파라미터

#### Returns

`Promise`\<[`ViewValueResult`](ViewValueResult.md)\>

렌더링 결과

***

### clone()

> **clone**(`includeValue?`): `any`

Defined in: [listgrid/config/EntityItem.ts:25](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityItem.ts#L25)

#### Parameters

##### includeValue?

`boolean`

#### Returns

`any`

#### Inherited from

[`EntityItem`](EntityItem.md).[`clone`](EntityItem.md#clone)

***

### getTabId()

> **getTabId**(): `string`

Defined in: [listgrid/config/EntityItem.ts:27](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityItem.ts#L27)

#### Returns

`string`

#### Inherited from

[`EntityItem`](EntityItem.md).[`getTabId`](EntityItem.md#gettabid)

***

### getFieldGroupId()

> **getFieldGroupId**(): `string`

Defined in: [listgrid/config/EntityItem.ts:29](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityItem.ts#L29)

#### Returns

`string`

#### Inherited from

[`EntityItem`](EntityItem.md).[`getFieldGroupId`](EntityItem.md#getfieldgroupid)

***

### withTabId()

> **withTabId**(`tabId`): `this`

Defined in: [listgrid/config/EntityItem.ts:36](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityItem.ts#L36)

필드가 표시될 tab의 id 를 지정합니다.
보통 이 메소드는 EntityForm#addFields 에서 처리되므로 별도로 사용할 필요가 없습니다.

#### Parameters

##### tabId

`string`

#### Returns

`this`

#### Inherited from

[`EntityItem`](EntityItem.md).[`withTabId`](EntityItem.md#withtabid)

***

### withFieldGroupId()

> **withFieldGroupId**(`fieldGroupId`): `this`

Defined in: [listgrid/config/EntityItem.ts:43](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityItem.ts#L43)

필드가 표시될 fieldGroup 의 id 를 지정합니다.
보통 이 메소드는 EntityForm#addFields 에서 처리되므로 별도로 사용할 필요가 없습니다.

#### Parameters

##### fieldGroupId

`string`

#### Returns

`this`

#### Inherited from

[`EntityItem`](EntityItem.md).[`withFieldGroupId`](EntityItem.md#withfieldgroupid)

***

### withViewPreset()

> **withViewPreset**(`type`): `this`

Defined in: [listgrid/config/EntityItem.ts:49](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityItem.ts#L49)

Entity 의 상태(신규/수정)에 따라 readonly, hidden 을 ViewPreset 으로 지정해 사용할 수 있습니다.

#### Parameters

##### type

[`ViewPreset`](../type-aliases/ViewPreset.md)

#### Returns

`this`

#### Inherited from

[`EntityItem`](EntityItem.md).[`withViewPreset`](EntityItem.md#withviewpreset)

***

### withHelpText()

> **withHelpText**(`helpText?`): `this`

Defined in: [listgrid/config/EntityItem.ts:55](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityItem.ts#L55)

필드 입력폼 하단에 출력될 helpText 를 지정할 수 있습니다.

#### Parameters

##### helpText?

[`ConditionalReactNodeValue`](../type-aliases/ConditionalReactNodeValue.md)

#### Returns

`this`

#### Inherited from

[`EntityItem`](EntityItem.md).[`withHelpText`](EntityItem.md#withhelptext)

***

### withTooltip()

> **withTooltip**(`tooltip?`): `this`

Defined in: [listgrid/config/EntityItem.ts:61](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityItem.ts#L61)

필드 전체에 툴팁을 씌울 수 있다.

#### Parameters

##### tooltip?

[`ConditionalReactNodeValue`](../type-aliases/ConditionalReactNodeValue.md)

#### Returns

`this`

#### Inherited from

[`EntityItem`](EntityItem.md).[`withTooltip`](EntityItem.md#withtooltip)

***

### withHidden()

> **withHidden**(`hidden?`): `this`

Defined in: [listgrid/config/EntityItem.ts:67](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityItem.ts#L67)

필드의 visible 옵션을 설정할 수 있습니다.

#### Parameters

##### hidden?

[`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

#### Returns

`this`

#### Inherited from

[`EntityItem`](EntityItem.md).[`withHidden`](EntityItem.md#withhidden)

***

### withLabel()

> **withLabel**(`label?`): `this`

Defined in: [listgrid/config/EntityItem.ts:73](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityItem.ts#L73)

필드 입력폼의 라벨에 표시될 내용을 설정할 수 있습니다.

#### Parameters

##### label?

[`LabelType`](../type-aliases/LabelType.md)

#### Returns

`this`

#### Inherited from

[`EntityItem`](EntityItem.md).[`withLabel`](EntityItem.md#withlabel)

***

### withReadOnly()

> **withReadOnly**(`readOnly?`): `this`

Defined in: [listgrid/config/EntityItem.ts:79](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityItem.ts#L79)

필드가 readonly 인지 여부를 설정할 수 있습니다.

#### Parameters

##### readOnly?

[`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

#### Returns

`this`

#### Inherited from

[`EntityItem`](EntityItem.md).[`withReadOnly`](EntityItem.md#withreadonly)

***

### withHideLabel()

> **withHideLabel**(`hideLabel?`): `this`

Defined in: [listgrid/config/EntityItem.ts:85](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityItem.ts#L85)

이 필드의 hideLabel 을 지정한다.

#### Parameters

##### hideLabel?

`boolean`

#### Returns

`this`

#### Inherited from

[`EntityItem`](EntityItem.md).[`withHideLabel`](EntityItem.md#withhidelabel)

***

### withOrder()

> **withOrder**(`order`): `this`

Defined in: [listgrid/config/EntityItem.ts:91](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityItem.ts#L91)

필드의 표시 순서를 설정합니다.

#### Parameters

##### order

`number`

#### Returns

`this`

#### Inherited from

[`EntityItem`](EntityItem.md).[`withOrder`](EntityItem.md#withorder)

***

### getOrder()

> **getOrder**(): `number`

Defined in: [listgrid/config/EntityItem.ts:93](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityItem.ts#L93)

#### Returns

`number`

#### Inherited from

[`EntityItem`](EntityItem.md).[`getOrder`](EntityItem.md#getorder)

***

### getName()

> **getName**(): `string`

Defined in: [listgrid/config/EntityItem.ts:95](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityItem.ts#L95)

#### Returns

`string`

#### Inherited from

[`EntityItem`](EntityItem.md).[`getName`](EntityItem.md#getname)

***

### getLabel()

> **getLabel**(): [`LabelType`](../type-aliases/LabelType.md)

Defined in: [listgrid/config/EntityItem.ts:97](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityItem.ts#L97)

#### Returns

[`LabelType`](../type-aliases/LabelType.md)

#### Inherited from

[`EntityItem`](EntityItem.md).[`getLabel`](EntityItem.md#getlabel)

***

### getHelpText()

> **getHelpText**(`props`): `Promise`\<`ReactNode`\>

Defined in: [listgrid/config/EntityItem.ts:99](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityItem.ts#L99)

#### Parameters

##### props

[`FieldInfoParameters`](FieldInfoParameters.md)

#### Returns

`Promise`\<`ReactNode`\>

#### Inherited from

[`EntityItem`](EntityItem.md).[`getHelpText`](EntityItem.md#gethelptext)

***

### isHidden()

> **isHidden**(`props`): `Promise`\<`boolean`\>

Defined in: [listgrid/config/EntityItem.ts:101](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityItem.ts#L101)

#### Parameters

##### props

[`FieldInfoParameters`](FieldInfoParameters.md)

#### Returns

`Promise`\<`boolean`\>

#### Inherited from

[`EntityItem`](EntityItem.md).[`isHidden`](EntityItem.md#ishidden)

***

### isReadonly()

> **isReadonly**(`props`): `Promise`\<`boolean`\>

Defined in: [listgrid/config/EntityItem.ts:103](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityItem.ts#L103)

#### Parameters

##### props

[`FieldInfoParameters`](FieldInfoParameters.md)

#### Returns

`Promise`\<`boolean`\>

#### Inherited from

[`EntityItem`](EntityItem.md).[`isReadonly`](EntityItem.md#isreadonly)

***

### withForm()

> **withForm**(`form`): `this`

Defined in: [listgrid/config/EntityItem.ts:110](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityItem.ts#L110)

필드가 표시될 tabId 와 fieldGroupId 를 설정합니다.
withTabId, withFieldGroupId 를 한번에 지정하는 것과 같습니다.

#### Parameters

##### form

###### tabId

`string`

###### fieldGroupId

`string`

#### Returns

`this`

#### Inherited from

[`EntityItem`](EntityItem.md).[`withForm`](EntityItem.md#withform)
