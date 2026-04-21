[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / DatetimeField

# Class: DatetimeField

Defined in: [listgrid/components/fields/DatetimeField.tsx:22](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/DatetimeField.tsx#L22)

## Extends

- [`AbstractDateField`](AbstractDateField.md)\<`DatetimeField`\>

## Constructors

### Constructor

> **new DatetimeField**(`name`, `order`, `limit?`, `range?`): `DatetimeField`

Defined in: [listgrid/components/fields/DatetimeField.tsx:23](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/DatetimeField.tsx#L23)

#### Parameters

##### name

`string`

##### order

`number`

##### limit?

[`MinMaxStringLimit`](../type-aliases/MinMaxStringLimit.md)

##### range?

`boolean`

#### Returns

`DatetimeField`

#### Overrides

`AbstractDateField<DatetimeField>.constructor`

## Properties

### limit?

> `optional` **limit?**: [`MinMaxStringLimit`](../type-aliases/MinMaxStringLimit.md)

Defined in: [listgrid/components/fields/abstract/AbstractDateField.tsx:18](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/AbstractDateField.tsx#L18)

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`limit`](AbstractDateField.md#limit)

***

### range?

> `optional` **range?**: `boolean`

Defined in: [listgrid/components/fields/abstract/AbstractDateField.tsx:19](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/AbstractDateField.tsx#L19)

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`range`](AbstractDateField.md#range)

***

### order

> **order**: `number`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:168](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L168)

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`order`](AbstractDateField.md#order)

***

### name

> **name**: `string`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:169](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L169)

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`name`](AbstractDateField.md#name)

***

### type

> **type**: [`FieldType`](../type-aliases/FieldType.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:170](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L170)

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`type`](AbstractDateField.md#type)

***

### exceptOnSave?

> `optional` **exceptOnSave?**: `boolean`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:171](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L171)

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`exceptOnSave`](AbstractDateField.md#exceptonsave)

***

### value?

> `optional` **value?**: [`FieldValue`](../interfaces/FieldValue.md)\<`any`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:179](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L179)

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`value`](AbstractDateField.md#value)

***

### tooltip?

> `optional` **tooltip?**: [`ConditionalReactNodeValue`](../type-aliases/ConditionalReactNodeValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:180](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L180)

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`tooltip`](AbstractDateField.md#tooltip)

***

### helpText?

> `optional` **helpText?**: [`ConditionalReactNodeValue`](../type-aliases/ConditionalReactNodeValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:181](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L181)

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`helpText`](AbstractDateField.md#helptext)

***

### placeHolder?

> `optional` **placeHolder?**: [`ConditionalStringValue`](../type-aliases/ConditionalStringValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:182](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L182)

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`placeHolder`](AbstractDateField.md#placeholder)

***

### hidden?

> `optional` **hidden?**: [`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:183](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L183)

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`hidden`](AbstractDateField.md#hidden)

***

### label

> **label**: [`LabelType`](../type-aliases/LabelType.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:184](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L184)

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`label`](AbstractDateField.md#label)

***

### readonly?

> `optional` **readonly?**: [`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:185](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L185)

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`readonly`](AbstractDateField.md#readonly)

***

### required?

> `optional` **required?**: [`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:186](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L186)

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`required`](AbstractDateField.md#required)

***

### hideLabel?

> `optional` **hideLabel?**: `boolean`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:187](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L187)

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`hideLabel`](AbstractDateField.md#hidelabel)

***

### attributes?

> `optional` **attributes?**: `Map`\<`string`, `unknown`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:188](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L188)

ViewField 할 때 사용할 수 있다.
필드를 커스텀으로 표시하게 하는데 필요한 여러 정보를 자유롭게 사용할 수 있다.
이 정보는 저장 용도로는 사용되지 않는다.

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`attributes`](AbstractDateField.md#attributes)

***

### requiredPermissions?

> `optional` **requiredPermissions?**: `string`[]

Defined in: [listgrid/components/fields/abstract/FormField.tsx:189](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L189)

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`requiredPermissions`](AbstractDateField.md#requiredpermissions)

***

### cardIcon?

> `optional` **cardIcon?**: [`CardIconType`](../type-aliases/CardIconType.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:190](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L190)

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`cardIcon`](AbstractDateField.md#cardicon)

***

### layout?

> `optional` **layout?**: [`FieldLayoutType`](../type-aliases/FieldLayoutType.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:191](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L191)

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`layout`](AbstractDateField.md#layout)

***

### lineBreak?

> `optional` **lineBreak?**: `boolean`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:192](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L192)

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`lineBreak`](AbstractDateField.md#linebreak)

***

### form?

> `optional` **form?**: `object`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:194](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L194)

#### tabId

> **tabId**: `string`

#### fieldGroupId

> **fieldGroupId**: `string`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`form`](AbstractDateField.md#form)

***

### validations?

> `optional` **validations?**: [`Validation`](../interfaces/Validation.md)[]

Defined in: [listgrid/components/fields/abstract/FormField.tsx:196](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L196)

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`validations`](AbstractDateField.md#validations)

***

### overrideRender?

> `optional` **overrideRender?**: (`params`) => `Promise`\<`ReactNode`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:197](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L197)

view 를 오버라이드 해 사용자정의 렌더링을 처리하는 경우 이 값을 설정한다.
ReactNode 나 null 을 반환하면 기존 view 를 완전히 대체하게 되고, undefined 를 반환하면 기존 View 를 사용하게 된다.

#### Parameters

##### params

[`FieldRenderParameters`](../interfaces/FieldRenderParameters.md)\<`any`, `any`\>

#### Returns

`Promise`\<`ReactNode`\>

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`overrideRender`](AbstractDateField.md#overriderender)

***

### saveValue?

> `optional` **saveValue?**: (`entityForm`, `field`, `renderType?`) => `Promise`\<`any`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:200](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L200)

EntityForm 을 저장할 때 생성하는 formData 에 제공할 값을 override 할 수 있다.

#### Parameters

##### entityForm

[`EntityForm`](EntityForm.md)\<`any`\>

##### field

[`EntityField`](../interfaces/EntityField.md)

##### renderType?

[`RenderType`](../type-aliases/RenderType.md)

#### Returns

`Promise`\<`any`\>

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`saveValue`](AbstractDateField.md#savevalue)

***

### displayFunc?

> `optional` **displayFunc?**: (`entityForm`, `field`, `renderType?`) => `Promise`\<`any`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:205](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L205)

display value 를 변조할 수 있다.

#### Parameters

##### entityForm

[`EntityForm`](EntityForm.md)\<`any`\>

##### field

[`EntityField`](../interfaces/EntityField.md)

##### renderType?

[`RenderType`](../type-aliases/RenderType.md)

#### Returns

`Promise`\<`any`\>

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`displayFunc`](AbstractDateField.md#displayfunc)

***

### maskedValueFunc?

> `optional` **maskedValueFunc?**: (`entityForm`, `value`) => `Promise`\<`string`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:210](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L210)

#### Parameters

##### entityForm

[`EntityForm`](EntityForm.md)\<`any`\>

##### value

`any`

#### Returns

`Promise`\<`string`\>

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`maskedValueFunc`](AbstractDateField.md#maskedvaluefunc)

***

### listConfig?

> `optional` **listConfig?**: [`IListConfig`](../interfaces/IListConfig.md)

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:123](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/ListableFormField.tsx#L123)

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`listConfig`](AbstractDateField.md#listconfig)

***

### overrideRenderListItem?

> `optional` **overrideRenderListItem?**: (`props`) => `Promise`\<[`ViewListResult`](../interfaces/ViewListResult.md)\>

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:125](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/ListableFormField.tsx#L125)

#### Parameters

##### props

[`ViewListProps`](../interfaces/ViewListProps.md)

#### Returns

`Promise`\<[`ViewListResult`](../interfaces/ViewListResult.md)\>

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`overrideRenderListItem`](AbstractDateField.md#overriderenderlistitem)

## Methods

### getCurrentValue()

> **getCurrentValue**(`renderType?`): `Promise`\<`string` \| `string`[] \| `undefined`\>

Defined in: [listgrid/components/fields/DatetimeField.tsx:27](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/DatetimeField.tsx#L27)

#### Parameters

##### renderType?

[`RenderType`](../type-aliases/RenderType.md)

#### Returns

`Promise`\<`string` \| `string`[] \| `undefined`\>

#### Overrides

[`AbstractDateField`](AbstractDateField.md).[`getCurrentValue`](AbstractDateField.md#getcurrentvalue)

***

### create()

> `static` **create**(`props`): `DatetimeField`

Defined in: [listgrid/components/fields/DatetimeField.tsx:125](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/DatetimeField.tsx#L125)

#### Parameters

##### props

`DatetimeFieldProps`

#### Returns

`DatetimeField`

***

### withRange()

> **withRange**(`range?`): `this`

Defined in: [listgrid/components/fields/abstract/AbstractDateField.tsx:37](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/AbstractDateField.tsx#L37)

range 가 true 면, 시작 시각 ~ 종료 시각 두 가지를 입력받게 됩니다.

#### Parameters

##### range?

`boolean`

#### Returns

`this`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`withRange`](AbstractDateField.md#withrange)

***

### withLimit()

> **withLimit**(`limit?`): `this`

Defined in: [listgrid/components/fields/abstract/AbstractDateField.tsx:47](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/AbstractDateField.tsx#L47)

최소, 최대값 설정

#### Parameters

##### limit?

[`MinMaxStringLimit`](../type-aliases/MinMaxStringLimit.md)

#### Returns

`this`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`withLimit`](AbstractDateField.md#withlimit)

***

### withMin()

> **withMin**(`min?`): `this`

Defined in: [listgrid/components/fields/abstract/AbstractDateField.tsx:57](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/AbstractDateField.tsx#L57)

최소값 설정

#### Parameters

##### min?

`string`

#### Returns

`this`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`withMin`](AbstractDateField.md#withmin)

***

### withMax()

> **withMax**(`max?`): `this`

Defined in: [listgrid/components/fields/abstract/AbstractDateField.tsx:69](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/AbstractDateField.tsx#L69)

최대값 설정

#### Parameters

##### max?

`string`

#### Returns

`this`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`withMax`](AbstractDateField.md#withmax)

***

### viewValue()

> **viewValue**(`props`): `Promise`\<[`ViewRenderResult`](../interfaces/ViewRenderResult.md)\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:306](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L306)

View 모드에서 필드 값을 렌더링하는 공개 메소드
CardSubCollectionField 등에서 호출하여 사용

#### Parameters

##### props

[`ViewRenderProps`](../interfaces/ViewRenderProps.md)\<`any`\>

View 렌더링에 필요한 파라미터

#### Returns

`Promise`\<[`ViewRenderResult`](../interfaces/ViewRenderResult.md)\>

렌더링 결과

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`viewValue`](AbstractDateField.md#viewvalue)

***

### clone()

> **clone**(`includeValue?`): `DatetimeField`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:314](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L314)

공통 clone 로직 - 모든 필드에서 사용
StateTracker 로직 포함

#### Parameters

##### includeValue?

`boolean`

#### Returns

`DatetimeField`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`clone`](AbstractDateField.md#clone)

***

### getTabId()

> **getTabId**(): `string`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:357](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L357)

#### Returns

`string`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`getTabId`](AbstractDateField.md#gettabid)

***

### getFieldGroupId()

> **getFieldGroupId**(): `string`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:361](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L361)

#### Returns

`string`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`getFieldGroupId`](AbstractDateField.md#getfieldgroupid)

***

### withTabId()

> **withTabId**(`tabId`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:365](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L365)

필드가 표시될 tab의 id 를 지정합니다.
보통 이 메소드는 EntityForm#addFields 에서 처리되므로 별도로 사용할 필요가 없습니다.

#### Parameters

##### tabId

`string`

#### Returns

`this`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`withTabId`](AbstractDateField.md#withtabid)

***

### withFieldGroupId()

> **withFieldGroupId**(`fieldGroupId`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:374](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L374)

필드가 표시될 fieldGroup 의 id 를 지정합니다.
보통 이 메소드는 EntityForm#addFields 에서 처리되므로 별도로 사용할 필요가 없습니다.

#### Parameters

##### fieldGroupId

`string`

#### Returns

`this`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`withFieldGroupId`](AbstractDateField.md#withfieldgroupid)

***

### getDisplayValue()

> **getDisplayValue**(`entityForm`, `renderType?`): `Promise`\<`any`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:383](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L383)

#### Parameters

##### entityForm

[`EntityForm`](EntityForm.md)\<`any`\>

##### renderType?

[`RenderType`](../type-aliases/RenderType.md)

#### Returns

`Promise`\<`any`\>

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`getDisplayValue`](AbstractDateField.md#getdisplayvalue)

***

### withDisplayFunc()

> **withDisplayFunc**(`fn`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:404](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L404)

#### Parameters

##### fn

(`entityForm`, `field`, `renderType?`) => `Promise`\<`any`\>

#### Returns

`this`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`withDisplayFunc`](AbstractDateField.md#withdisplayfunc)

***

### withMaskedValue()

> **withMaskedValue**(`fn`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:420](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L420)

Set a masking function for readonly display.
When the field is readonly and has a value, the maskedValueFunc is called
to produce a masked display string. The original value is never modified.

#### Parameters

##### fn

(`entityForm`, `value`) => `Promise`\<`string`\>

#### Returns

`this`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`withMaskedValue`](AbstractDateField.md#withmaskedvalue)

***

### withAddOnly()

> **withAddOnly**(): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:425](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L425)

#### Returns

`this`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`withAddOnly`](AbstractDateField.md#withaddonly)

***

### withModifyOnly()

> **withModifyOnly**(): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:429](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L429)

#### Returns

`this`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`withModifyOnly`](AbstractDateField.md#withmodifyonly)

***

### withViewHidden()

> **withViewHidden**(): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:433](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L433)

#### Returns

`this`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`withViewHidden`](AbstractDateField.md#withviewhidden)

***

### withListOnly()

> **withListOnly**(): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:437](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L437)

#### Returns

`this`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`withListOnly`](AbstractDateField.md#withlistonly)

***

### withViewPreset()

> **withViewPreset**(`type?`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:441](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L441)

Entity 의 상태(신규/수정)에 따라 readonly, hidden 을 ViewPreset 으로 지정해 사용할 수 있습니다.

#### Parameters

##### type?

[`ViewPreset`](../type-aliases/ViewPreset.md)

#### Returns

`this`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`withViewPreset`](AbstractDateField.md#withviewpreset)

***

### withHideLabel()

> **withHideLabel**(`hideLabel?`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:449](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L449)

이 필드의 hideLabel 을 지정한다.

#### Parameters

##### hideLabel?

`boolean`

#### Returns

`this`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`withHideLabel`](AbstractDateField.md#withhidelabel)

***

### withCardIcon()

> **withCardIcon**(`icon?`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:467](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L467)

Card View 모드에서 표시할 커스텀 아이콘을 설정합니다.
Tabler Icons 등의 아이콘 컴포넌트를 전달할 수 있습니다.

#### Parameters

##### icon?

[`CardIconType`](../type-aliases/CardIconType.md)

#### Returns

`this`

#### Example

```typescript
import { IconUser, IconMail } from '@tabler/icons-react';

TextField.create({ name: 'email', order: 1 })
  .withCardIcon(IconMail)
  .withLabel('이메일');
```

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`withCardIcon`](AbstractDateField.md#withcardicon)

***

### withLayout()

> **withLayout**(`layout`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:473](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L473)

#### Parameters

##### layout

[`FieldLayoutType`](../type-aliases/FieldLayoutType.md)

#### Returns

`this`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`withLayout`](AbstractDateField.md#withlayout)

***

### withLineBreak()

> **withLineBreak**(`lineBreak?`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:478](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L478)

#### Parameters

##### lineBreak?

`boolean`

#### Returns

`this`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`withLineBreak`](AbstractDateField.md#withlinebreak)

***

### view()

> **view**(`params`): `Promise`\<`ReactNode`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:483](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L483)

#### Parameters

##### params

[`FieldRenderParameters`](../interfaces/FieldRenderParameters.md)\<`any`, `any`\>

#### Returns

`Promise`\<`ReactNode`\>

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`view`](AbstractDateField.md#view)

***

### render()

> **render**(`params`): `Promise`\<`ReactNode`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:500](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L500)

공통 render 로직 - 모든 필드에서 사용
StateTracker, Performance tracking, Error handling 포함

#### Parameters

##### params

[`FieldRenderParameters`](../interfaces/FieldRenderParameters.md)\<`any`, `any`\>

#### Returns

`Promise`\<`ReactNode`\>

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`render`](AbstractDateField.md#render)

***

### withOverrideRender()

> **withOverrideRender**(`fn`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:517](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L517)

이 필드를 View 화면에서 렌더링하는 로직을 override 할 수 있습니다.

#### Parameters

##### fn

(`params`) => `Promise`\<`ReactNode`\>

#### Returns

`this`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`withOverrideRender`](AbstractDateField.md#withoverriderender)

***

### withOrder()

> **withOrder**(`order`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:526](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L526)

필드의 표시 순서를 설정합니다.

#### Parameters

##### order

`number`

#### Returns

`this`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`withOrder`](AbstractDateField.md#withorder)

***

### isBlank()

> **isBlank**(`renderType?`): `Promise`\<`boolean`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:531](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L531)

#### Parameters

##### renderType?

[`RenderType`](../type-aliases/RenderType.md) = `'create'`

#### Returns

`Promise`\<`boolean`\>

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`isBlank`](AbstractDateField.md#isblank)

***

### isDirty()

> **isDirty**(): `boolean`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:542](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L542)

#### Returns

`boolean`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`isDirty`](AbstractDateField.md#isdirty)

***

### withTooltip()

> **withTooltip**(`tooltip?`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:608](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L608)

필드 전체에 툴팁을 씌울 수 있다.

#### Parameters

##### tooltip?

[`ConditionalReactNodeValue`](../type-aliases/ConditionalReactNodeValue.md)

#### Returns

`this`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`withTooltip`](AbstractDateField.md#withtooltip)

***

### withHelpText()

> **withHelpText**(`helpText?`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:614](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L614)

필드 입력폼 하단에 출력될 helpText 를 지정할 수 있습니다.

#### Parameters

##### helpText?

[`ConditionalReactNodeValue`](../type-aliases/ConditionalReactNodeValue.md)

#### Returns

`this`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`withHelpText`](AbstractDateField.md#withhelptext)

***

### withPlaceHolder()

> **withPlaceHolder**(`placeHolder?`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:620](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L620)

#### Parameters

##### placeHolder?

[`ConditionalStringValue`](../type-aliases/ConditionalStringValue.md)

#### Returns

`this`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`withPlaceHolder`](AbstractDateField.md#withplaceholder)

***

### withHidden()

> **withHidden**(`hidden?`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:626](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L626)

필드의 visible 옵션을 설정할 수 있습니다.

#### Parameters

##### hidden?

[`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

#### Returns

`this`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`withHidden`](AbstractDateField.md#withhidden)

***

### withLabel()

> **withLabel**(`label?`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:632](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L632)

필드 입력폼의 라벨에 표시될 내용을 설정할 수 있습니다.

#### Parameters

##### label?

[`LabelType`](../type-aliases/LabelType.md)

#### Returns

`this`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`withLabel`](AbstractDateField.md#withlabel)

***

### withReadOnly()

> **withReadOnly**(`readOnly?`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:637](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L637)

필드가 readonly 인지 여부를 설정할 수 있습니다.

#### Parameters

##### readOnly?

[`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

#### Returns

`this`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`withReadOnly`](AbstractDateField.md#withreadonly)

***

### withRequired()

> **withRequired**(`required?`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:642](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L642)

#### Parameters

##### required?

[`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

#### Returns

`this`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`withRequired`](AbstractDateField.md#withrequired)

***

### withValue()

> **withValue**(`value`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:647](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L647)

#### Parameters

##### value

`any`

#### Returns

`this`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`withValue`](AbstractDateField.md#withvalue)

***

### getOrder()

> **getOrder**(): `number`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:671](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L671)

#### Returns

`number`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`getOrder`](AbstractDateField.md#getorder)

***

### getName()

> **getName**(): `string`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:675](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L675)

#### Returns

`string`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`getName`](AbstractDateField.md#getname)

***

### getLabel()

> **getLabel**(): [`LabelType`](../type-aliases/LabelType.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:679](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L679)

#### Returns

[`LabelType`](../type-aliases/LabelType.md)

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`getLabel`](AbstractDateField.md#getlabel)

***

### withAttributes()

> **withAttributes**(`attributes`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:686](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L686)

#### Parameters

##### attributes

`Map`\<`string`, `unknown`\>

#### Returns

`this`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`withAttributes`](AbstractDateField.md#withattributes)

***

### viewLabel()

> **viewLabel**(`t`): `ReactNode`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:691](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L691)

#### Parameters

##### t

`any`

#### Returns

`ReactNode`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`viewLabel`](AbstractDateField.md#viewlabel)

***

### getTooltip()

> **getTooltip**(`props`): `Promise`\<`ReactNode`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:702](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L702)

#### Parameters

##### props

[`FieldInfoParameters`](../interfaces/FieldInfoParameters.md)\<`any`\>

#### Returns

`Promise`\<`ReactNode`\>

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`getTooltip`](AbstractDateField.md#gettooltip)

***

### getHelpText()

> **getHelpText**(`props`): `Promise`\<`ReactNode`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:706](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L706)

#### Parameters

##### props

[`FieldInfoParameters`](../interfaces/FieldInfoParameters.md)\<`any`\>

#### Returns

`Promise`\<`ReactNode`\>

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`getHelpText`](AbstractDateField.md#gethelptext)

***

### getPlaceHolder()

> **getPlaceHolder**(`props`): `Promise`\<`string`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:710](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L710)

#### Parameters

##### props

[`FieldInfoParameters`](../interfaces/FieldInfoParameters.md)\<`any`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`getPlaceHolder`](AbstractDateField.md#getplaceholder)

***

### isRequired()

> **isRequired**(`props`): `Promise`\<`boolean`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:714](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L714)

#### Parameters

##### props

[`FieldInfoParameters`](../interfaces/FieldInfoParameters.md)\<`any`\>

#### Returns

`Promise`\<`boolean`\>

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`isRequired`](AbstractDateField.md#isrequired)

***

### isHidden()

> **isHidden**(`props`): `Promise`\<`boolean`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:718](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L718)

#### Parameters

##### props

[`FieldInfoParameters`](../interfaces/FieldInfoParameters.md)\<`any`\>

#### Returns

`Promise`\<`boolean`\>

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`isHidden`](AbstractDateField.md#ishidden)

***

### isReadonly()

> **isReadonly**(`props`): `Promise`\<`boolean`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:722](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L722)

#### Parameters

##### props

[`FieldInfoParameters`](../interfaces/FieldInfoParameters.md)\<`any`\>

#### Returns

`Promise`\<`boolean`\>

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`isReadonly`](AbstractDateField.md#isreadonly)

***

### getSaveValue()

> **getSaveValue**(`entityForm`, `renderType?`): `Promise`\<`any`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:739](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L739)

#### Parameters

##### entityForm

[`EntityForm`](EntityForm.md)\<`any`\>

##### renderType?

[`RenderType`](../type-aliases/RenderType.md)

#### Returns

`Promise`\<`any`\>

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`getSaveValue`](AbstractDateField.md#getsavevalue)

***

### getFetchedValue()

> **getFetchedValue**(): `Promise`\<`any`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:750](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L750)

#### Returns

`Promise`\<`any`\>

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`getFetchedValue`](AbstractDateField.md#getfetchedvalue)

***

### resetValue()

> **resetValue**(`renderType?`): `void`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:757](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L757)

#### Parameters

##### renderType?

[`RenderType`](../type-aliases/RenderType.md)

#### Returns

`void`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`resetValue`](AbstractDateField.md#resetvalue)

***

### withForm()

> **withForm**(`form`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:769](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L769)

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

[`AbstractDateField`](AbstractDateField.md).[`withForm`](AbstractDateField.md#withform)

***

### withValidations()

> **withValidations**(...`validation`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:774](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L774)

#### Parameters

##### validation

...([`Validation`](../interfaces/Validation.md) \| `undefined`)[]

#### Returns

`this`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`withValidations`](AbstractDateField.md#withvalidations)

***

### validate()

> **validate**(`entityForm`, `session?`): `Promise`\<[`ValidateResult`](ValidateResult.md) \| [`ValidateResult`](ValidateResult.md)[]\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:779](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L779)

#### Parameters

##### entityForm

[`EntityForm`](EntityForm.md)\<`any`\>

##### session?

[`Session`](../interfaces/Session.md)

#### Returns

`Promise`\<[`ValidateResult`](ValidateResult.md) \| [`ValidateResult`](ValidateResult.md)[]\>

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`validate`](AbstractDateField.md#validate)

***

### withDefaultValue()

> **withDefaultValue**(`value`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:825](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L825)

#### Parameters

##### value

`any`

#### Returns

`this`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`withDefaultValue`](AbstractDateField.md#withdefaultvalue)

***

### withRequiredPermissions()

> **withRequiredPermissions**(...`permissions`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:839](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L839)

이 필드를 보기 위해 필요한 권한을 설정합니다.
사용자가 지정된 권한 중 하나라도 가지고 있으면 필드가 표시됩니다.

#### Parameters

##### permissions

...`string`[]

#### Returns

`this`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`withRequiredPermissions`](AbstractDateField.md#withrequiredpermissions)

***

### isPermitted()

> **isPermitted**(`userPermissions?`): `boolean`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:853](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L853)

사용자가 이 필드를 볼 수 있는 권한이 있는지 확인합니다.
requiredPermissions가 없거나 비어있으면 true를 반환합니다.
사용자가 requiredPermissions 중 하나라도 가지고 있으면 true를 반환합니다.

#### Parameters

##### userPermissions?

`string`[]

#### Returns

`boolean`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`isPermitted`](AbstractDateField.md#ispermitted)

***

### overrideRenderListFilter()?

> `optional` **overrideRenderListFilter**(`params`): `Promise`\<`ReactNode`\>

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:127](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/ListableFormField.tsx#L127)

#### Parameters

##### params

[`FilterRenderParameters`](../interfaces/FilterRenderParameters.md)\<`any`, `any`\>

#### Returns

`Promise`\<`ReactNode`\>

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`overrideRenderListFilter`](AbstractDateField.md#overriderenderlistfilter)

***

### viewListItem()

> **viewListItem**(`props`): `Promise`\<[`ViewListResult`](../interfaces/ViewListResult.md)\>

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:154](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/ListableFormField.tsx#L154)

ListGrid 에서 List 를 출력할 때 각 항목을 출력하는 방식.
EntityForm 설정에서 overrideRenderList 를 이용해 오버라이드 할 수 있다.

#### Parameters

##### props

[`ViewListProps`](../interfaces/ViewListProps.md)

#### Returns

`Promise`\<[`ViewListResult`](../interfaces/ViewListResult.md)\>

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`viewListItem`](AbstractDateField.md#viewlistitem)

***

### viewListFilter()

> **viewListFilter**(`params`): `Promise`\<`ReactNode`\>

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:167](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/ListableFormField.tsx#L167)

목록의 통합 검색 표시
EntityForm 을 설정할 때 overrideRenderListFilter 를 통해 override 할 수도 있다.
설정된 오버라이드가 없으면 #renderListFilter 를 실행한다.

#### Parameters

##### params

[`FilterRenderParameters`](../interfaces/FilterRenderParameters.md)\<`any`, `any`\>

#### Returns

`Promise`\<`ReactNode`\>

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`viewListFilter`](AbstractDateField.md#viewlistfilter)

***

### useListField()

> **useListField**(`props?`): `this`

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:268](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/ListableFormField.tsx#L268)

#### Parameters

##### props?

`number` \| [`UserListFieldProps`](../interfaces/UserListFieldProps.md)

#### Returns

`this`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`useListField`](AbstractDateField.md#uselistfield)

***

### withListConfig()

> **withListConfig**(`list?`): `this`

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:290](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/ListableFormField.tsx#L290)

#### Parameters

##### list?

[`IListConfig`](../interfaces/IListConfig.md)

#### Returns

`this`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`withListConfig`](AbstractDateField.md#withlistconfig)

***

### withOverrideRenderListItem()

> **withOverrideRenderListItem**(`overrideRenderList?`): `this`

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:305](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/ListableFormField.tsx#L305)

#### Parameters

##### overrideRenderList?

(`props`) => `Promise`\<[`ViewListResult`](../interfaces/ViewListResult.md)\>

#### Returns

`this`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`withOverrideRenderListItem`](AbstractDateField.md#withoverriderenderlistitem)

***

### withOverrideRenderListFilter()

> **withOverrideRenderListFilter**(`overrideRenderFilter?`): `this`

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:313](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/ListableFormField.tsx#L313)

#### Parameters

##### overrideRenderFilter?

(`params`) => `Promise`\<`ReactNode`\>

#### Returns

`this`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`withOverrideRenderListFilter`](AbstractDateField.md#withoverriderenderlistfilter)

***

### isSupportList()

> **isSupportList**(): `boolean`

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:323](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/ListableFormField.tsx#L323)

#### Returns

`boolean`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`isSupportList`](AbstractDateField.md#issupportlist)

***

### getListConfig()

> **getListConfig**(): [`IListConfig`](../interfaces/IListConfig.md) \| `undefined`

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:327](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/ListableFormField.tsx#L327)

#### Returns

[`IListConfig`](../interfaces/IListConfig.md) \| `undefined`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`getListConfig`](AbstractDateField.md#getlistconfig)

***

### getListFieldAlignType()

> **getListFieldAlignType**(): `TextAlignType`

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:346](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/ListableFormField.tsx#L346)

#### Returns

`TextAlignType`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`getListFieldAlignType`](AbstractDateField.md#getlistfieldaligntype)

***

### withFilterable()

> **withFilterable**(`filterable?`): `this`

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:377](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/ListableFormField.tsx#L377)

목록 필터 사용 여부 설정.
설정이 없는 한 필터 사용은 true 이다.
하지만 필터 처리를 하지 말아야 하는 경우에는 이 값을 false 로 명시적으로 선언해야 한다.

#### Parameters

##### filterable?

`boolean`

#### Returns

`this`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`withFilterable`](AbstractDateField.md#withfilterable)

***

### withSaveValue()

> **withSaveValue**(`saveValue`): `this`

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:386](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/ListableFormField.tsx#L386)

EntityForm 이 저장될 때 서버로 전송할 값을 override 하는 메소드

#### Parameters

##### saveValue

(`entityForm`, `field`, `renderType?`) => `Promise`\<`any`\>

#### Returns

`this`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`withSaveValue`](AbstractDateField.md#withsavevalue)

***

### withSortable()

> **withSortable**(`sortable?`): `this`

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:403](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/ListableFormField.tsx#L403)

목록 정렬 사용 여부 설정
설정이 없는 한 정렬 사용은 true 이다.
하지만 정렬을 하지 말아야 하는 경우에는 이 값을 false 로 명시적으로 선언해야 한다.

#### Parameters

##### sortable?

`boolean`

#### Returns

`this`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`withSortable`](AbstractDateField.md#withsortable)

***

### isFilterable()

> **isFilterable**(): `boolean`

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:409](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/ListableFormField.tsx#L409)

#### Returns

`boolean`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`isFilterable`](AbstractDateField.md#isfilterable)

***

### isSortable()

> **isSortable**(): `boolean`

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:421](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/ListableFormField.tsx#L421)

#### Returns

`boolean`

#### Inherited from

[`AbstractDateField`](AbstractDateField.md).[`isSortable`](AbstractDateField.md#issortable)
