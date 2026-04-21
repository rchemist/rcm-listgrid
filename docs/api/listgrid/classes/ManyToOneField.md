[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ManyToOneField

# Class: ManyToOneField

Defined in: [listgrid/components/fields/ManyToOneField.tsx:29](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/ManyToOneField.tsx#L29)

Abstract base class for ManyToOne relationship fields
This class provides common functionality for ManyToOneField and UserField

## Extends

- [`AbstractManyToOneField`](AbstractManyToOneField.md)\<`ManyToOneField`\>

## Constructors

### Constructor

> **new ManyToOneField**(`name`, `order`, `manyToOne`): `ManyToOneField`

Defined in: [listgrid/components/fields/ManyToOneField.tsx:30](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/ManyToOneField.tsx#L30)

#### Parameters

##### name

`string`

##### order

`number`

##### manyToOne

[`ManyToOneConfig`](../interfaces/ManyToOneConfig.md)

#### Returns

`ManyToOneField`

#### Overrides

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`constructor`](AbstractManyToOneField.md#constructor)

## Properties

### config

> **config**: [`ManyToOneConfig`](../interfaces/ManyToOneConfig.md)

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:79](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L79)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`config`](AbstractManyToOneField.md#config)

***

### useCardView?

> `optional` **useCardView?**: `boolean`

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:82](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L82)

카드뷰 사용 여부

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`useCardView`](AbstractManyToOneField.md#usecardview)

***

### cardViewConfig?

> `optional` **cardViewConfig?**: [`CardViewConfig`](../interfaces/CardViewConfig.md)

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:85](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L85)

카드뷰 설정

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`cardViewConfig`](AbstractManyToOneField.md#cardviewconfig)

***

### useSelectBoxView?

> `optional` **useSelectBoxView?**: `boolean`

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:88](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L88)

셀렉트박스뷰 사용 여부

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`useSelectBoxView`](AbstractManyToOneField.md#useselectboxview)

***

### selectBoxViewConfig?

> `optional` **selectBoxViewConfig?**: [`SelectBoxViewConfig`](../interfaces/SelectBoxViewConfig.md)

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:91](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L91)

셀렉트박스뷰 설정

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`selectBoxViewConfig`](AbstractManyToOneField.md#selectboxviewconfig)

***

### order

> **order**: `number`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:168](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L168)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`order`](AbstractManyToOneField.md#order)

***

### name

> **name**: `string`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:169](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L169)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`name`](AbstractManyToOneField.md#name)

***

### type

> **type**: [`FieldType`](../type-aliases/FieldType.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:170](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L170)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`type`](AbstractManyToOneField.md#type)

***

### exceptOnSave?

> `optional` **exceptOnSave?**: `boolean`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:171](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L171)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`exceptOnSave`](AbstractManyToOneField.md#exceptonsave)

***

### value?

> `optional` **value?**: [`FieldValue`](../interfaces/FieldValue.md)\<`any`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:179](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L179)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`value`](AbstractManyToOneField.md#value)

***

### tooltip?

> `optional` **tooltip?**: [`ConditionalReactNodeValue`](../type-aliases/ConditionalReactNodeValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:180](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L180)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`tooltip`](AbstractManyToOneField.md#tooltip)

***

### helpText?

> `optional` **helpText?**: [`ConditionalReactNodeValue`](../type-aliases/ConditionalReactNodeValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:181](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L181)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`helpText`](AbstractManyToOneField.md#helptext)

***

### placeHolder?

> `optional` **placeHolder?**: [`ConditionalStringValue`](../type-aliases/ConditionalStringValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:182](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L182)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`placeHolder`](AbstractManyToOneField.md#placeholder)

***

### hidden?

> `optional` **hidden?**: [`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:183](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L183)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`hidden`](AbstractManyToOneField.md#hidden)

***

### label

> **label**: [`LabelType`](../type-aliases/LabelType.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:184](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L184)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`label`](AbstractManyToOneField.md#label)

***

### readonly?

> `optional` **readonly?**: [`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:185](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L185)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`readonly`](AbstractManyToOneField.md#readonly)

***

### required?

> `optional` **required?**: [`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:186](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L186)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`required`](AbstractManyToOneField.md#required)

***

### hideLabel?

> `optional` **hideLabel?**: `boolean`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:187](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L187)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`hideLabel`](AbstractManyToOneField.md#hidelabel)

***

### attributes?

> `optional` **attributes?**: `Map`\<`string`, `unknown`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:188](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L188)

ViewField 할 때 사용할 수 있다.
필드를 커스텀으로 표시하게 하는데 필요한 여러 정보를 자유롭게 사용할 수 있다.
이 정보는 저장 용도로는 사용되지 않는다.

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`attributes`](AbstractManyToOneField.md#attributes)

***

### requiredPermissions?

> `optional` **requiredPermissions?**: `string`[]

Defined in: [listgrid/components/fields/abstract/FormField.tsx:189](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L189)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`requiredPermissions`](AbstractManyToOneField.md#requiredpermissions)

***

### cardIcon?

> `optional` **cardIcon?**: [`CardIconType`](../type-aliases/CardIconType.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:190](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L190)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`cardIcon`](AbstractManyToOneField.md#cardicon)

***

### layout?

> `optional` **layout?**: [`FieldLayoutType`](../type-aliases/FieldLayoutType.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:191](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L191)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`layout`](AbstractManyToOneField.md#layout)

***

### lineBreak?

> `optional` **lineBreak?**: `boolean`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:192](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L192)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`lineBreak`](AbstractManyToOneField.md#linebreak)

***

### form?

> `optional` **form?**: `object`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:194](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L194)

#### tabId

> **tabId**: `string`

#### fieldGroupId

> **fieldGroupId**: `string`

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`form`](AbstractManyToOneField.md#form)

***

### validations?

> `optional` **validations?**: [`Validation`](../interfaces/Validation.md)[]

Defined in: [listgrid/components/fields/abstract/FormField.tsx:196](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L196)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`validations`](AbstractManyToOneField.md#validations)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`overrideRender`](AbstractManyToOneField.md#overriderender)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`saveValue`](AbstractManyToOneField.md#savevalue)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`displayFunc`](AbstractManyToOneField.md#displayfunc)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`maskedValueFunc`](AbstractManyToOneField.md#maskedvaluefunc)

***

### listConfig?

> `optional` **listConfig?**: [`IListConfig`](../interfaces/IListConfig.md)

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:123](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/ListableFormField.tsx#L123)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`listConfig`](AbstractManyToOneField.md#listconfig)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`overrideRenderListItem`](AbstractManyToOneField.md#overriderenderlistitem)

## Methods

### useListField()

> **useListField**(`props?`): `this`

Defined in: [listgrid/components/fields/ManyToOneField.tsx:370](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/ManyToOneField.tsx#L370)

#### Parameters

##### props?

`number` \| [`UserListFieldProps`](../interfaces/UserListFieldProps.md)

#### Returns

`this`

#### Overrides

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`useListField`](AbstractManyToOneField.md#uselistfield)

***

### create()

> `static` **create**(`props`): `ManyToOneField`

Defined in: [listgrid/components/fields/ManyToOneField.tsx:390](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/ManyToOneField.tsx#L390)

#### Parameters

##### props

`ManyToOneFieldProps`

#### Returns

`ManyToOneField`

***

### withManyToOneConfig()

> **withManyToOneConfig**(`config`): `this`

Defined in: [listgrid/components/fields/ManyToOneField.tsx:394](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/ManyToOneField.tsx#L394)

#### Parameters

##### config

[`ManyToOneConfig`](../interfaces/ManyToOneConfig.md)

#### Returns

`this`

***

### withCardView()

> **withCardView**(`config?`): `this`

Defined in: [listgrid/components/fields/ManyToOneField.tsx:420](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/ManyToOneField.tsx#L420)

카드뷰 렌더링 활성화
EntityFormThemeProvider 없이도 CardManyToOneView로 렌더링 가능

#### Parameters

##### config?

[`CardViewConfig`](../interfaces/CardViewConfig.md)

#### Returns

`this`

#### Example

```tsx
ManyToOneField.create({
  name: 'syllabus',
  order: 1,
  config: { entityForm: SyllabusEntityForm() }
})
.withCardView({
  columns: 3,
  mobileColumns: 2,
  cardConfig: {
    titleField: 'name',
    descriptionField: (item) => `입학지원기간: ${formatDate(item.availableDate[0])}`,
  }
})
```

***

### withSelectBoxView()

> **withSelectBoxView**(`config?`): `this`

Defined in: [listgrid/components/fields/ManyToOneField.tsx:445](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/ManyToOneField.tsx#L445)

셀렉트박스뷰 렌더링 활성화
ManyToOne 필드를 드롭다운 SelectBox로 렌더링

#### Parameters

##### config?

[`SelectBoxViewConfig`](../interfaces/SelectBoxViewConfig.md)

#### Returns

`this`

#### Example

```tsx
ManyToOneField.create({
  name: 'country',
  order: 1,
  config: { entityForm: CountryEntityForm() }
})
.withSelectBoxView({
  labelField: 'name',
  placeholder: '국가를 선택하세요',
  isSearchable: true,
})
```

***

### getEntityForm()

> **getEntityForm**(): [`EntityForm`](EntityForm.md)\<`any`\>

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:101](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L101)

Get the EntityForm from the config

#### Returns

[`EntityForm`](EntityForm.md)\<`any`\>

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`getEntityForm`](AbstractManyToOneField.md#getentityform)

***

### hasConfig()

> **hasConfig**(): `boolean`

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:108](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L108)

Check if this field has a valid config

#### Returns

`boolean`

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`hasConfig`](AbstractManyToOneField.md#hasconfig)

***

### getIdFieldName()

> **getIdFieldName**(): `string`

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:115](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L115)

Get the field name for ID mapping

#### Returns

`string`

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`getIdFieldName`](AbstractManyToOneField.md#getidfieldname)

***

### getMappedIdName()

> **getMappedIdName**(`renderType?`): `Promise`\<\{ `id`: `any`; `name`: `any`; \} \| `undefined`\>

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:122](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L122)

Get mapped ID and name from the current value

#### Parameters

##### renderType?

[`RenderType`](../type-aliases/RenderType.md) = `'create'`

#### Returns

`Promise`\<\{ `id`: `any`; `name`: `any`; \} \| `undefined`\>

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`getMappedIdName`](AbstractManyToOneField.md#getmappedidname)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`viewValue`](AbstractManyToOneField.md#viewvalue)

***

### clone()

> **clone**(`includeValue?`): `ManyToOneField`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:314](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L314)

공통 clone 로직 - 모든 필드에서 사용
StateTracker 로직 포함

#### Parameters

##### includeValue?

`boolean`

#### Returns

`ManyToOneField`

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`clone`](AbstractManyToOneField.md#clone)

***

### getTabId()

> **getTabId**(): `string`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:357](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L357)

#### Returns

`string`

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`getTabId`](AbstractManyToOneField.md#gettabid)

***

### getFieldGroupId()

> **getFieldGroupId**(): `string`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:361](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L361)

#### Returns

`string`

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`getFieldGroupId`](AbstractManyToOneField.md#getfieldgroupid)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`withTabId`](AbstractManyToOneField.md#withtabid)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`withFieldGroupId`](AbstractManyToOneField.md#withfieldgroupid)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`getDisplayValue`](AbstractManyToOneField.md#getdisplayvalue)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`withDisplayFunc`](AbstractManyToOneField.md#withdisplayfunc)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`withMaskedValue`](AbstractManyToOneField.md#withmaskedvalue)

***

### withAddOnly()

> **withAddOnly**(): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:425](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L425)

#### Returns

`this`

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`withAddOnly`](AbstractManyToOneField.md#withaddonly)

***

### withModifyOnly()

> **withModifyOnly**(): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:429](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L429)

#### Returns

`this`

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`withModifyOnly`](AbstractManyToOneField.md#withmodifyonly)

***

### withViewHidden()

> **withViewHidden**(): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:433](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L433)

#### Returns

`this`

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`withViewHidden`](AbstractManyToOneField.md#withviewhidden)

***

### withListOnly()

> **withListOnly**(): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:437](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L437)

#### Returns

`this`

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`withListOnly`](AbstractManyToOneField.md#withlistonly)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`withViewPreset`](AbstractManyToOneField.md#withviewpreset)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`withHideLabel`](AbstractManyToOneField.md#withhidelabel)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`withCardIcon`](AbstractManyToOneField.md#withcardicon)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`withLayout`](AbstractManyToOneField.md#withlayout)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`withLineBreak`](AbstractManyToOneField.md#withlinebreak)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`view`](AbstractManyToOneField.md#view)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`render`](AbstractManyToOneField.md#render)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`withOverrideRender`](AbstractManyToOneField.md#withoverriderender)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`withOrder`](AbstractManyToOneField.md#withorder)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`isBlank`](AbstractManyToOneField.md#isblank)

***

### isDirty()

> **isDirty**(): `boolean`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:542](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L542)

#### Returns

`boolean`

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`isDirty`](AbstractManyToOneField.md#isdirty)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`withTooltip`](AbstractManyToOneField.md#withtooltip)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`withHelpText`](AbstractManyToOneField.md#withhelptext)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`withPlaceHolder`](AbstractManyToOneField.md#withplaceholder)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`withHidden`](AbstractManyToOneField.md#withhidden)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`withLabel`](AbstractManyToOneField.md#withlabel)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`withReadOnly`](AbstractManyToOneField.md#withreadonly)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`withRequired`](AbstractManyToOneField.md#withrequired)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`withValue`](AbstractManyToOneField.md#withvalue)

***

### getOrder()

> **getOrder**(): `number`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:671](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L671)

#### Returns

`number`

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`getOrder`](AbstractManyToOneField.md#getorder)

***

### getName()

> **getName**(): `string`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:675](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L675)

#### Returns

`string`

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`getName`](AbstractManyToOneField.md#getname)

***

### getLabel()

> **getLabel**(): [`LabelType`](../type-aliases/LabelType.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:679](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L679)

#### Returns

[`LabelType`](../type-aliases/LabelType.md)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`getLabel`](AbstractManyToOneField.md#getlabel)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`withAttributes`](AbstractManyToOneField.md#withattributes)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`viewLabel`](AbstractManyToOneField.md#viewlabel)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`getTooltip`](AbstractManyToOneField.md#gettooltip)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`getHelpText`](AbstractManyToOneField.md#gethelptext)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`getPlaceHolder`](AbstractManyToOneField.md#getplaceholder)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`isRequired`](AbstractManyToOneField.md#isrequired)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`isHidden`](AbstractManyToOneField.md#ishidden)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`isReadonly`](AbstractManyToOneField.md#isreadonly)

***

### getCurrentValue()

> **getCurrentValue**(`renderType?`): `Promise`\<`any`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:726](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L726)

#### Parameters

##### renderType?

[`RenderType`](../type-aliases/RenderType.md)

#### Returns

`Promise`\<`any`\>

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`getCurrentValue`](AbstractManyToOneField.md#getcurrentvalue)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`getSaveValue`](AbstractManyToOneField.md#getsavevalue)

***

### getFetchedValue()

> **getFetchedValue**(): `Promise`\<`any`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:750](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L750)

#### Returns

`Promise`\<`any`\>

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`getFetchedValue`](AbstractManyToOneField.md#getfetchedvalue)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`resetValue`](AbstractManyToOneField.md#resetvalue)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`withForm`](AbstractManyToOneField.md#withform)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`withValidations`](AbstractManyToOneField.md#withvalidations)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`validate`](AbstractManyToOneField.md#validate)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`withDefaultValue`](AbstractManyToOneField.md#withdefaultvalue)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`withRequiredPermissions`](AbstractManyToOneField.md#withrequiredpermissions)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`isPermitted`](AbstractManyToOneField.md#ispermitted)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`overrideRenderListFilter`](AbstractManyToOneField.md#overriderenderlistfilter)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`viewListItem`](AbstractManyToOneField.md#viewlistitem)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`viewListFilter`](AbstractManyToOneField.md#viewlistfilter)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`withListConfig`](AbstractManyToOneField.md#withlistconfig)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`withOverrideRenderListItem`](AbstractManyToOneField.md#withoverriderenderlistitem)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`withOverrideRenderListFilter`](AbstractManyToOneField.md#withoverriderenderlistfilter)

***

### isSupportList()

> **isSupportList**(): `boolean`

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:323](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/ListableFormField.tsx#L323)

#### Returns

`boolean`

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`isSupportList`](AbstractManyToOneField.md#issupportlist)

***

### getListConfig()

> **getListConfig**(): [`IListConfig`](../interfaces/IListConfig.md) \| `undefined`

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:327](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/ListableFormField.tsx#L327)

#### Returns

[`IListConfig`](../interfaces/IListConfig.md) \| `undefined`

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`getListConfig`](AbstractManyToOneField.md#getlistconfig)

***

### getListFieldAlignType()

> **getListFieldAlignType**(): `TextAlignType`

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:346](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/ListableFormField.tsx#L346)

#### Returns

`TextAlignType`

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`getListFieldAlignType`](AbstractManyToOneField.md#getlistfieldaligntype)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`withFilterable`](AbstractManyToOneField.md#withfilterable)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`withSaveValue`](AbstractManyToOneField.md#withsavevalue)

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

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`withSortable`](AbstractManyToOneField.md#withsortable)

***

### isFilterable()

> **isFilterable**(): `boolean`

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:409](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/ListableFormField.tsx#L409)

#### Returns

`boolean`

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`isFilterable`](AbstractManyToOneField.md#isfilterable)

***

### isSortable()

> **isSortable**(): `boolean`

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:421](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/ListableFormField.tsx#L421)

#### Returns

`boolean`

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`isSortable`](AbstractManyToOneField.md#issortable)
