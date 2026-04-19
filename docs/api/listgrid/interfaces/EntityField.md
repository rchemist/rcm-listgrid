[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / EntityField

# Interface: EntityField

Defined in: [listgrid/config/EntityField.ts:16](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L16)

## Extends

- [`EntityItem`](EntityItem.md)

## Properties

### value?

> `optional` **value?**: [`FieldValue`](FieldValue.md)\<`any`\>

Defined in: [listgrid/config/EntityField.ts:17](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L17)

***

### type

> **type**: [`FieldType`](../type-aliases/FieldType.md)

Defined in: [listgrid/config/EntityField.ts:18](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L18)

***

### placeHolder?

> `optional` **placeHolder?**: [`ConditionalStringValue`](../type-aliases/ConditionalStringValue.md)

Defined in: [listgrid/config/EntityField.ts:20](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L20)

***

### required?

> `optional` **required?**: [`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

Defined in: [listgrid/config/EntityField.ts:21](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L21)

***

### validations?

> `optional` **validations?**: [`Validation`](Validation.md)[]

Defined in: [listgrid/config/EntityField.ts:22](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L22)

***

### exceptOnSave?

> `optional` **exceptOnSave?**: `boolean`

Defined in: [listgrid/config/EntityField.ts:23](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L23)

***

### requiredPermissions?

> `optional` **requiredPermissions?**: `string`[]

Defined in: [listgrid/config/EntityField.ts:24](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L24)

***

### attributes?

> `optional` **attributes?**: `Map`\<`string`, `unknown`\>

Defined in: [listgrid/config/EntityField.ts:31](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L31)

ViewField 할 때 사용할 수 있다.
필드를 커스텀으로 표시하게 하는데 필요한 여러 정보를 자유롭게 사용할 수 있다.
이 정보는 저장 용도로는 사용되지 않는다.

***

### validationState?

> `optional` **validationState?**: `object`

Defined in: [listgrid/config/EntityField.ts:37](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L37)

CheckButtonValidation의 검증 상태를 저장
탭 전환 시에도 상태를 유지하기 위함

#### validated

> **validated**: `boolean`

#### message?

> `optional` **message?**: `string`

***

### displayFunc?

> `optional` **displayFunc?**: (`entityForm`, `field`, `renderType?`) => `Promise`\<`any`\>

Defined in: [listgrid/config/EntityField.ts:47](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L47)

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

Defined in: [listgrid/config/EntityField.ts:58](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L58)

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

Defined in: [listgrid/config/EntityField.ts:65](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L65)

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

Defined in: [listgrid/config/EntityItem.ts:20](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L20)

#### Inherited from

[`EntityItem`](EntityItem.md).[`order`](EntityItem.md#order)

***

### name

> **name**: `string`

Defined in: [listgrid/config/EntityItem.ts:21](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L21)

#### Inherited from

[`EntityItem`](EntityItem.md).[`name`](EntityItem.md#name)

***

### label?

> `optional` **label?**: [`LabelType`](../type-aliases/LabelType.md)

Defined in: [listgrid/config/EntityItem.ts:22](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L22)

#### Inherited from

`EntityField`.[`label`](#label)

***

### helpText?

> `optional` **helpText?**: [`ConditionalReactNodeValue`](../type-aliases/ConditionalReactNodeValue.md)

Defined in: [listgrid/config/EntityItem.ts:23](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L23)

#### Inherited from

`EntityField`.[`helpText`](#helptext)

***

### hidden?

> `optional` **hidden?**: [`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

Defined in: [listgrid/config/EntityItem.ts:24](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L24)

#### Inherited from

`EntityField`.[`hidden`](#hidden)

***

### readonly?

> `optional` **readonly?**: [`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

Defined in: [listgrid/config/EntityItem.ts:25](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L25)

#### Inherited from

`EntityField`.[`readonly`](#readonly)

***

### hideLabel?

> `optional` **hideLabel?**: `boolean`

Defined in: [listgrid/config/EntityItem.ts:26](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L26)

#### Inherited from

`EntityField`.[`hideLabel`](#hidelabel)

***

### form?

> `optional` **form?**: `object`

Defined in: [listgrid/config/EntityItem.ts:29](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L29)

#### tabId

> **tabId**: `string`

#### fieldGroupId

> **fieldGroupId**: `string`

#### Inherited from

[`EntityItem`](EntityItem.md).[`form`](EntityItem.md#form)

## Methods

### view()

> **view**(`params`): `Promise`\<`ReactNode`\>

Defined in: [listgrid/config/EntityField.ts:67](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L67)

#### Parameters

##### params

[`FieldRenderParameters`](FieldRenderParameters.md)

#### Returns

`Promise`\<`ReactNode`\>

***

### isDirty()

> **isDirty**(): `boolean`

Defined in: [listgrid/config/EntityField.ts:69](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L69)

#### Returns

`boolean`

***

### isRequired()

> **isRequired**(`props`): `Promise`\<`boolean`\>

Defined in: [listgrid/config/EntityField.ts:71](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L71)

#### Parameters

##### props

[`FieldInfoParameters`](FieldInfoParameters.md)

#### Returns

`Promise`\<`boolean`\>

***

### isBlank()

> **isBlank**(`renderType?`): `Promise`\<`boolean`\>

Defined in: [listgrid/config/EntityField.ts:73](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L73)

#### Parameters

##### renderType?

[`RenderType`](../type-aliases/RenderType.md)

#### Returns

`Promise`\<`boolean`\>

***

### withDisplayFunc()

> **withDisplayFunc**(`fn`): `this`

Defined in: [listgrid/config/EntityField.ts:75](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L75)

#### Parameters

##### fn

(`entityForm`, `field`, `renderType?`) => `Promise`\<`any`\>

#### Returns

`this`

***

### withOverrideRender()

> **withOverrideRender**(`fn`): `this`

Defined in: [listgrid/config/EntityField.ts:79](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L79)

#### Parameters

##### fn

(`params`) => `Promise`\<`ReactNode`\>

#### Returns

`this`

***

### withPlaceHolder()

> **withPlaceHolder**(`placeHolder?`): `this`

Defined in: [listgrid/config/EntityField.ts:83](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L83)

#### Parameters

##### placeHolder?

[`ConditionalStringValue`](../type-aliases/ConditionalStringValue.md)

#### Returns

`this`

***

### withRequired()

> **withRequired**(`required?`): `this`

Defined in: [listgrid/config/EntityField.ts:85](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L85)

#### Parameters

##### required?

[`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

#### Returns

`this`

***

### withValue()

> **withValue**(`value`): `this`

Defined in: [listgrid/config/EntityField.ts:87](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L87)

#### Parameters

##### value

`any`

#### Returns

`this`

***

### getDisplayValue()

> **getDisplayValue**(`entityForm`, `renderType?`): `Promise`\<`any`\>

Defined in: [listgrid/config/EntityField.ts:89](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L89)

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

Defined in: [listgrid/config/EntityField.ts:91](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L91)

#### Parameters

##### props

[`FieldInfoParameters`](FieldInfoParameters.md)

#### Returns

`Promise`\<`string`\>

***

### getSaveValue()

> **getSaveValue**(`entityForm`, `renderType?`): `Promise`\<`any`\>

Defined in: [listgrid/config/EntityField.ts:93](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L93)

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

Defined in: [listgrid/config/EntityField.ts:95](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L95)

#### Parameters

##### renderType?

[`RenderType`](../type-aliases/RenderType.md)

#### Returns

`Promise`\<`any`\>

***

### resetValue()

> **resetValue**(`renderType?`): `void`

Defined in: [listgrid/config/EntityField.ts:97](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L97)

#### Parameters

##### renderType?

[`RenderType`](../type-aliases/RenderType.md)

#### Returns

`void`

***

### withValidations()

> **withValidations**(...`validation`): `this`

Defined in: [listgrid/config/EntityField.ts:99](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L99)

#### Parameters

##### validation

...[`Validation`](Validation.md)[]

#### Returns

`this`

***

### validate()

> **validate**(`entityForm`, `session?`): `Promise`\<[`ValidateResult`](../classes/ValidateResult.md) \| [`ValidateResult`](../classes/ValidateResult.md)[]\>

Defined in: [listgrid/config/EntityField.ts:101](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L101)

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

Defined in: [listgrid/config/EntityField.ts:103](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L103)

#### Parameters

##### value

`any`

#### Returns

`this`

***

### withAttributes()

> **withAttributes**(`attributes`): `this`

Defined in: [listgrid/config/EntityField.ts:105](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L105)

#### Parameters

##### attributes

`Map`\<`string`, `unknown`\>

#### Returns

`this`

***

### getFetchedValue()

> **getFetchedValue**(): `Promise`\<`any`\>

Defined in: [listgrid/config/EntityField.ts:107](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L107)

#### Returns

`Promise`\<`any`\>

***

### withRequiredPermissions()

> **withRequiredPermissions**(...`permissions`): `this`

Defined in: [listgrid/config/EntityField.ts:113](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L113)

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

Defined in: [listgrid/config/EntityField.ts:120](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L120)

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

Defined in: [listgrid/config/EntityField.ts:129](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L129)

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

Defined in: [listgrid/config/EntityItem.ts:32](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L32)

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

Defined in: [listgrid/config/EntityItem.ts:34](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L34)

#### Returns

`string`

#### Inherited from

[`EntityItem`](EntityItem.md).[`getTabId`](EntityItem.md#gettabid)

***

### getFieldGroupId()

> **getFieldGroupId**(): `string`

Defined in: [listgrid/config/EntityItem.ts:36](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L36)

#### Returns

`string`

#### Inherited from

[`EntityItem`](EntityItem.md).[`getFieldGroupId`](EntityItem.md#getfieldgroupid)

***

### withTabId()

> **withTabId**(`tabId`): `this`

Defined in: [listgrid/config/EntityItem.ts:43](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L43)

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

Defined in: [listgrid/config/EntityItem.ts:50](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L50)

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

Defined in: [listgrid/config/EntityItem.ts:56](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L56)

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

Defined in: [listgrid/config/EntityItem.ts:62](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L62)

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

Defined in: [listgrid/config/EntityItem.ts:68](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L68)

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

Defined in: [listgrid/config/EntityItem.ts:74](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L74)

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

Defined in: [listgrid/config/EntityItem.ts:80](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L80)

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

Defined in: [listgrid/config/EntityItem.ts:86](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L86)

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

Defined in: [listgrid/config/EntityItem.ts:92](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L92)

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

Defined in: [listgrid/config/EntityItem.ts:98](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L98)

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

Defined in: [listgrid/config/EntityItem.ts:100](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L100)

#### Returns

`number`

#### Inherited from

[`EntityItem`](EntityItem.md).[`getOrder`](EntityItem.md#getorder)

***

### getName()

> **getName**(): `string`

Defined in: [listgrid/config/EntityItem.ts:102](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L102)

#### Returns

`string`

#### Inherited from

[`EntityItem`](EntityItem.md).[`getName`](EntityItem.md#getname)

***

### getLabel()

> **getLabel**(): [`LabelType`](../type-aliases/LabelType.md)

Defined in: [listgrid/config/EntityItem.ts:104](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L104)

#### Returns

[`LabelType`](../type-aliases/LabelType.md)

#### Inherited from

[`EntityItem`](EntityItem.md).[`getLabel`](EntityItem.md#getlabel)

***

### getHelpText()

> **getHelpText**(`props`): `Promise`\<`ReactNode`\>

Defined in: [listgrid/config/EntityItem.ts:106](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L106)

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

Defined in: [listgrid/config/EntityItem.ts:108](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L108)

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

Defined in: [listgrid/config/EntityItem.ts:110](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L110)

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

Defined in: [listgrid/config/EntityItem.ts:117](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L117)

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
