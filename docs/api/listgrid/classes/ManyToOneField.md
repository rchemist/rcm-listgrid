[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ManyToOneField

# Class: ManyToOneField

Defined in: [listgrid/components/fields/ManyToOneField.tsx:36](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/ManyToOneField.tsx#L36)

Abstract base class for ManyToOne relationship fields
This class provides common functionality for ManyToOneField and UserField

## Extends

- [`AbstractManyToOneField`](AbstractManyToOneField.md)\<`ManyToOneField`\>

## Constructors

### Constructor

> **new ManyToOneField**(`name`, `order`, `manyToOne`): `ManyToOneField`

Defined in: [listgrid/components/fields/ManyToOneField.tsx:37](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/ManyToOneField.tsx#L37)

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

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:86](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L86)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`config`](AbstractManyToOneField.md#config)

***

### useCardView?

> `optional` **useCardView?**: `boolean`

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:89](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L89)

카드뷰 사용 여부

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`useCardView`](AbstractManyToOneField.md#usecardview)

***

### cardViewConfig?

> `optional` **cardViewConfig?**: [`CardViewConfig`](../interfaces/CardViewConfig.md)

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:92](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L92)

카드뷰 설정

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`cardViewConfig`](AbstractManyToOneField.md#cardviewconfig)

***

### useSelectBoxView?

> `optional` **useSelectBoxView?**: `boolean`

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:95](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L95)

셀렉트박스뷰 사용 여부

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`useSelectBoxView`](AbstractManyToOneField.md#useselectboxview)

***

### selectBoxViewConfig?

> `optional` **selectBoxViewConfig?**: [`SelectBoxViewConfig`](../interfaces/SelectBoxViewConfig.md)

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:98](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L98)

셀렉트박스뷰 설정

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`selectBoxViewConfig`](AbstractManyToOneField.md#selectboxviewconfig)

***

### order

> **order**: `number`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:175](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L175)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`order`](AbstractManyToOneField.md#order)

***

### name

> **name**: `string`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:176](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L176)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`name`](AbstractManyToOneField.md#name)

***

### type

> **type**: [`FieldType`](../type-aliases/FieldType.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:177](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L177)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`type`](AbstractManyToOneField.md#type)

***

### exceptOnSave?

> `optional` **exceptOnSave?**: `boolean`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:178](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L178)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`exceptOnSave`](AbstractManyToOneField.md#exceptonsave)

***

### value?

> `optional` **value?**: [`FieldValue`](../interfaces/FieldValue.md)\<`any`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:186](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L186)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`value`](AbstractManyToOneField.md#value)

***

### tooltip?

> `optional` **tooltip?**: [`ConditionalReactNodeValue`](../type-aliases/ConditionalReactNodeValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:187](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L187)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`tooltip`](AbstractManyToOneField.md#tooltip)

***

### helpText?

> `optional` **helpText?**: [`ConditionalReactNodeValue`](../type-aliases/ConditionalReactNodeValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:188](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L188)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`helpText`](AbstractManyToOneField.md#helptext)

***

### placeHolder?

> `optional` **placeHolder?**: [`ConditionalStringValue`](../type-aliases/ConditionalStringValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:189](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L189)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`placeHolder`](AbstractManyToOneField.md#placeholder)

***

### hidden?

> `optional` **hidden?**: [`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:190](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L190)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`hidden`](AbstractManyToOneField.md#hidden)

***

### label

> **label**: [`LabelType`](../type-aliases/LabelType.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:191](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L191)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`label`](AbstractManyToOneField.md#label)

***

### readonly?

> `optional` **readonly?**: [`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:192](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L192)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`readonly`](AbstractManyToOneField.md#readonly)

***

### required?

> `optional` **required?**: [`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:193](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L193)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`required`](AbstractManyToOneField.md#required)

***

### hideLabel?

> `optional` **hideLabel?**: `boolean`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:194](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L194)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`hideLabel`](AbstractManyToOneField.md#hidelabel)

***

### attributes?

> `optional` **attributes?**: `Map`\<`string`, `unknown`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:195](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L195)

ViewField 할 때 사용할 수 있다.
필드를 커스텀으로 표시하게 하는데 필요한 여러 정보를 자유롭게 사용할 수 있다.
이 정보는 저장 용도로는 사용되지 않는다.

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`attributes`](AbstractManyToOneField.md#attributes)

***

### requiredPermissions?

> `optional` **requiredPermissions?**: `string`[]

Defined in: [listgrid/components/fields/abstract/FormField.tsx:196](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L196)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`requiredPermissions`](AbstractManyToOneField.md#requiredpermissions)

***

### cardIcon?

> `optional` **cardIcon?**: [`CardIconType`](../type-aliases/CardIconType.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:197](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L197)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`cardIcon`](AbstractManyToOneField.md#cardicon)

***

### layout?

> `optional` **layout?**: [`FieldLayoutType`](../type-aliases/FieldLayoutType.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:198](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L198)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`layout`](AbstractManyToOneField.md#layout)

***

### lineBreak?

> `optional` **lineBreak?**: `boolean`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:199](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L199)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`lineBreak`](AbstractManyToOneField.md#linebreak)

***

### form?

> `optional` **form?**: `object`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:201](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L201)

#### tabId

> **tabId**: `string`

#### fieldGroupId

> **fieldGroupId**: `string`

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`form`](AbstractManyToOneField.md#form)

***

### validations?

> `optional` **validations?**: [`Validation`](../interfaces/Validation.md)[]

Defined in: [listgrid/components/fields/abstract/FormField.tsx:203](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L203)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`validations`](AbstractManyToOneField.md#validations)

***

### overrideRender?

> `optional` **overrideRender?**: (`params`) => `Promise`\<`ReactNode`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:204](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L204)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:207](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L207)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:212](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L212)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:217](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L217)

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

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:130](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/ListableFormField.tsx#L130)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`listConfig`](AbstractManyToOneField.md#listconfig)

***

### overrideRenderListItem?

> `optional` **overrideRenderListItem?**: (`props`) => `Promise`\<[`ViewListResult`](../interfaces/ViewListResult.md)\>

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:132](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/ListableFormField.tsx#L132)

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

Defined in: [listgrid/components/fields/ManyToOneField.tsx:377](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/ManyToOneField.tsx#L377)

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

Defined in: [listgrid/components/fields/ManyToOneField.tsx:397](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/ManyToOneField.tsx#L397)

#### Parameters

##### props

`ManyToOneFieldProps`

#### Returns

`ManyToOneField`

***

### withManyToOneConfig()

> **withManyToOneConfig**(`config`): `this`

Defined in: [listgrid/components/fields/ManyToOneField.tsx:401](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/ManyToOneField.tsx#L401)

#### Parameters

##### config

[`ManyToOneConfig`](../interfaces/ManyToOneConfig.md)

#### Returns

`this`

***

### withCardView()

> **withCardView**(`config?`): `this`

Defined in: [listgrid/components/fields/ManyToOneField.tsx:427](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/ManyToOneField.tsx#L427)

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

Defined in: [listgrid/components/fields/ManyToOneField.tsx:452](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/ManyToOneField.tsx#L452)

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

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:108](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L108)

Get the EntityForm from the config

#### Returns

[`EntityForm`](EntityForm.md)\<`any`\>

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`getEntityForm`](AbstractManyToOneField.md#getentityform)

***

### hasConfig()

> **hasConfig**(): `boolean`

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:115](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L115)

Check if this field has a valid config

#### Returns

`boolean`

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`hasConfig`](AbstractManyToOneField.md#hasconfig)

***

### getIdFieldName()

> **getIdFieldName**(): `string`

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:122](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L122)

Get the field name for ID mapping

#### Returns

`string`

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`getIdFieldName`](AbstractManyToOneField.md#getidfieldname)

***

### getMappedIdName()

> **getMappedIdName**(`renderType?`): `Promise`\<\{ `id`: `any`; `name`: `any`; \} \| `undefined`\>

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:129](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L129)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:313](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L313)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:321](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L321)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:364](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L364)

#### Returns

`string`

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`getTabId`](AbstractManyToOneField.md#gettabid)

***

### getFieldGroupId()

> **getFieldGroupId**(): `string`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:368](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L368)

#### Returns

`string`

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`getFieldGroupId`](AbstractManyToOneField.md#getfieldgroupid)

***

### withTabId()

> **withTabId**(`tabId`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:372](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L372)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:381](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L381)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:390](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L390)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:411](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L411)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:427](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L427)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:432](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L432)

#### Returns

`this`

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`withAddOnly`](AbstractManyToOneField.md#withaddonly)

***

### withModifyOnly()

> **withModifyOnly**(): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:436](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L436)

#### Returns

`this`

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`withModifyOnly`](AbstractManyToOneField.md#withmodifyonly)

***

### withViewHidden()

> **withViewHidden**(): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:440](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L440)

#### Returns

`this`

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`withViewHidden`](AbstractManyToOneField.md#withviewhidden)

***

### withListOnly()

> **withListOnly**(): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:444](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L444)

#### Returns

`this`

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`withListOnly`](AbstractManyToOneField.md#withlistonly)

***

### withViewPreset()

> **withViewPreset**(`type?`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:448](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L448)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:456](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L456)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:474](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L474)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:480](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L480)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:485](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L485)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:490](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L490)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:507](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L507)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:524](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L524)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:533](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L533)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:538](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L538)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:549](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L549)

#### Returns

`boolean`

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`isDirty`](AbstractManyToOneField.md#isdirty)

***

### withTooltip()

> **withTooltip**(`tooltip?`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:615](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L615)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:621](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L621)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:627](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L627)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:633](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L633)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:639](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L639)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:644](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L644)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:649](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L649)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:654](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L654)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:678](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L678)

#### Returns

`number`

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`getOrder`](AbstractManyToOneField.md#getorder)

***

### getName()

> **getName**(): `string`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:682](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L682)

#### Returns

`string`

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`getName`](AbstractManyToOneField.md#getname)

***

### getLabel()

> **getLabel**(): [`LabelType`](../type-aliases/LabelType.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:686](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L686)

#### Returns

[`LabelType`](../type-aliases/LabelType.md)

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`getLabel`](AbstractManyToOneField.md#getlabel)

***

### withAttributes()

> **withAttributes**(`attributes`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:693](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L693)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:698](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L698)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:709](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L709)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:713](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L713)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:717](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L717)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:721](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L721)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:725](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L725)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:729](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L729)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:733](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L733)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:746](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L746)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:757](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L757)

#### Returns

`Promise`\<`any`\>

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`getFetchedValue`](AbstractManyToOneField.md#getfetchedvalue)

***

### resetValue()

> **resetValue**(`renderType?`): `void`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:764](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L764)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:776](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L776)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:781](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L781)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:786](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L786)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:832](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L832)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:846](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L846)

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

Defined in: [listgrid/components/fields/abstract/FormField.tsx:860](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L860)

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

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:134](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/ListableFormField.tsx#L134)

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

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:161](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/ListableFormField.tsx#L161)

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

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:174](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/ListableFormField.tsx#L174)

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

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:297](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/ListableFormField.tsx#L297)

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

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:312](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/ListableFormField.tsx#L312)

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

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:320](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/ListableFormField.tsx#L320)

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

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:330](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/ListableFormField.tsx#L330)

#### Returns

`boolean`

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`isSupportList`](AbstractManyToOneField.md#issupportlist)

***

### getListConfig()

> **getListConfig**(): [`IListConfig`](../interfaces/IListConfig.md) \| `undefined`

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:334](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/ListableFormField.tsx#L334)

#### Returns

[`IListConfig`](../interfaces/IListConfig.md) \| `undefined`

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`getListConfig`](AbstractManyToOneField.md#getlistconfig)

***

### getListFieldAlignType()

> **getListFieldAlignType**(): `TextAlignType`

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:353](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/ListableFormField.tsx#L353)

#### Returns

`TextAlignType`

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`getListFieldAlignType`](AbstractManyToOneField.md#getlistfieldaligntype)

***

### withFilterable()

> **withFilterable**(`filterable?`): `this`

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:384](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/ListableFormField.tsx#L384)

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

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:393](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/ListableFormField.tsx#L393)

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

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:410](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/ListableFormField.tsx#L410)

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

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:416](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/ListableFormField.tsx#L416)

#### Returns

`boolean`

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`isFilterable`](AbstractManyToOneField.md#isfilterable)

***

### isSortable()

> **isSortable**(): `boolean`

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:428](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/ListableFormField.tsx#L428)

#### Returns

`boolean`

#### Inherited from

[`AbstractManyToOneField`](AbstractManyToOneField.md).[`isSortable`](AbstractManyToOneField.md#issortable)
