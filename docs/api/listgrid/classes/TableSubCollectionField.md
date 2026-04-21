[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / TableSubCollectionField

# Class: TableSubCollectionField

Defined in: [listgrid/config/TableSubCollectionField.tsx:46](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/TableSubCollectionField.tsx#L46)

TableSubCollectionField configuration
Extends SubCollectionField to display items in a table format

## Extends

- [`SubCollectionField`](SubCollectionField.md)

## Constructors

### Constructor

> **new TableSubCollectionField**(`props`): `TableSubCollectionField`

Defined in: [listgrid/config/TableSubCollectionField.tsx:53](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/TableSubCollectionField.tsx#L53)

#### Parameters

##### props

###### entityForm

[`EntityForm`](EntityForm.md)

###### relation

[`CardSubCollectionRelation`](../interfaces/CardSubCollectionRelation.md)

###### order

`number`

###### name

`string`

###### label?

[`LabelType`](../type-aliases/LabelType.md)

###### helpText?

[`ConditionalReactNodeValue`](../type-aliases/ConditionalReactNodeValue.md)

###### hidden?

[`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

###### readonly?

[`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

###### fetchUrl?

`string` \| ((`parentEntityForm`) => `string`)

###### tableConfig?

[`TableConfig`](../interfaces/TableConfig.md)

###### fetchOptions?

[`CardSubCollectionFetchOptions`](../interfaces/CardSubCollectionFetchOptions.md)

#### Returns

`TableSubCollectionField`

#### Overrides

[`SubCollectionField`](SubCollectionField.md).[`constructor`](SubCollectionField.md#constructor)

## Properties

### order

> **order**: `number`

Defined in: [listgrid/config/SubCollectionField.tsx:28](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/SubCollectionField.tsx#L28)

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`order`](SubCollectionField.md#order)

***

### name

> **name**: `string`

Defined in: [listgrid/config/SubCollectionField.tsx:29](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/SubCollectionField.tsx#L29)

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`name`](SubCollectionField.md#name)

***

### label?

> `optional` **label?**: [`LabelType`](../type-aliases/LabelType.md)

Defined in: [listgrid/config/SubCollectionField.tsx:30](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/SubCollectionField.tsx#L30)

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`label`](SubCollectionField.md#label)

***

### helpText?

> `optional` **helpText?**: [`ConditionalReactNodeValue`](../type-aliases/ConditionalReactNodeValue.md)

Defined in: [listgrid/config/SubCollectionField.tsx:31](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/SubCollectionField.tsx#L31)

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`helpText`](SubCollectionField.md#helptext)

***

### hidden?

> `optional` **hidden?**: [`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

Defined in: [listgrid/config/SubCollectionField.tsx:32](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/SubCollectionField.tsx#L32)

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`hidden`](SubCollectionField.md#hidden)

***

### readonly?

> `optional` **readonly?**: [`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

Defined in: [listgrid/config/SubCollectionField.tsx:33](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/SubCollectionField.tsx#L33)

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`readonly`](SubCollectionField.md#readonly)

***

### dynamicUrl?

> `optional` **dynamicUrl?**: (`parentEntityForm`) => `string`

Defined in: [listgrid/config/SubCollectionField.tsx:34](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/SubCollectionField.tsx#L34)

#### Parameters

##### parentEntityForm

[`EntityForm`](EntityForm.md)

#### Returns

`string`

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`dynamicUrl`](SubCollectionField.md#dynamicurl)

***

### form?

> `optional` **form?**: `object`

Defined in: [listgrid/config/SubCollectionField.tsx:37](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/SubCollectionField.tsx#L37)

#### tabId

> **tabId**: `string`

#### fieldGroupId

> **fieldGroupId**: `string`

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`form`](SubCollectionField.md#form)

***

### entityForm

> **entityForm**: [`EntityForm`](EntityForm.md)

Defined in: [listgrid/config/SubCollectionField.tsx:39](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/SubCollectionField.tsx#L39)

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`entityForm`](SubCollectionField.md#entityform)

***

### hideLabel?

> `optional` **hideLabel?**: `boolean`

Defined in: [listgrid/config/SubCollectionField.tsx:40](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/SubCollectionField.tsx#L40)

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`hideLabel`](SubCollectionField.md#hidelabel)

***

### relation

> **relation**: `SubCollectionRelation`

Defined in: [listgrid/config/SubCollectionField.tsx:42](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/SubCollectionField.tsx#L42)

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`relation`](SubCollectionField.md#relation)

***

### listViewFields?

> `optional` **listViewFields?**: `string`[]

Defined in: [listgrid/config/SubCollectionField.tsx:45](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/SubCollectionField.tsx#L45)

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`listViewFields`](SubCollectionField.md#listviewfields)

***

### viewListOptions?

> `optional` **viewListOptions?**: [`ViewListGridOptionProps`](../interfaces/ViewListGridOptionProps.md)

Defined in: [listgrid/config/SubCollectionField.tsx:47](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/SubCollectionField.tsx#L47)

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`viewListOptions`](SubCollectionField.md#viewlistoptions)

***

### tooltip?

> `optional` **tooltip?**: [`ConditionalReactNodeValue`](../type-aliases/ConditionalReactNodeValue.md)

Defined in: [listgrid/config/TableSubCollectionField.tsx:47](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/TableSubCollectionField.tsx#L47)

***

### fetchUrl

> **fetchUrl**: `string`

Defined in: [listgrid/config/TableSubCollectionField.tsx:48](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/TableSubCollectionField.tsx#L48)

***

### fetchUrlFunction?

> `optional` **fetchUrlFunction?**: (`parentEntityForm`) => `string`

Defined in: [listgrid/config/TableSubCollectionField.tsx:49](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/TableSubCollectionField.tsx#L49)

#### Parameters

##### parentEntityForm

[`EntityForm`](EntityForm.md)

#### Returns

`string`

***

### tableConfig?

> `optional` **tableConfig?**: [`TableConfig`](../interfaces/TableConfig.md)

Defined in: [listgrid/config/TableSubCollectionField.tsx:50](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/TableSubCollectionField.tsx#L50)

***

### fetchOptions?

> `optional` **fetchOptions?**: [`CardSubCollectionFetchOptions`](../interfaces/CardSubCollectionFetchOptions.md)

Defined in: [listgrid/config/TableSubCollectionField.tsx:51](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/TableSubCollectionField.tsx#L51)

## Methods

### getTabId()

> **getTabId**(): `string`

Defined in: [listgrid/config/SubCollectionField.tsx:98](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/SubCollectionField.tsx#L98)

#### Returns

`string`

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`getTabId`](SubCollectionField.md#gettabid)

***

### getFieldGroupId()

> **getFieldGroupId**(): `string`

Defined in: [listgrid/config/SubCollectionField.tsx:102](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/SubCollectionField.tsx#L102)

#### Returns

`string`

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`getFieldGroupId`](SubCollectionField.md#getfieldgroupid)

***

### withTabId()

> **withTabId**(`tabId`): `this`

Defined in: [listgrid/config/SubCollectionField.tsx:106](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/SubCollectionField.tsx#L106)

필드가 표시될 tab의 id 를 지정합니다.
보통 이 메소드는 EntityForm#addFields 에서 처리되므로 별도로 사용할 필요가 없습니다.

#### Parameters

##### tabId

`string`

#### Returns

`this`

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`withTabId`](SubCollectionField.md#withtabid)

***

### withFieldGroupId()

> **withFieldGroupId**(`fieldGroupId`): `this`

Defined in: [listgrid/config/SubCollectionField.tsx:115](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/SubCollectionField.tsx#L115)

필드가 표시될 fieldGroup 의 id 를 지정합니다.
보통 이 메소드는 EntityForm#addFields 에서 처리되므로 별도로 사용할 필요가 없습니다.

#### Parameters

##### fieldGroupId

`string`

#### Returns

`this`

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`withFieldGroupId`](SubCollectionField.md#withfieldgroupid)

***

### withHelpText()

> **withHelpText**(`helpText?`): `this`

Defined in: [listgrid/config/SubCollectionField.tsx:124](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/SubCollectionField.tsx#L124)

필드 입력폼 하단에 출력될 helpText 를 지정할 수 있습니다.

#### Parameters

##### helpText?

[`ConditionalReactNodeValue`](../type-aliases/ConditionalReactNodeValue.md)

#### Returns

`this`

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`withHelpText`](SubCollectionField.md#withhelptext)

***

### withHidden()

> **withHidden**(`hidden?`): `this`

Defined in: [listgrid/config/SubCollectionField.tsx:129](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/SubCollectionField.tsx#L129)

필드의 visible 옵션을 설정할 수 있습니다.

#### Parameters

##### hidden?

`boolean` \| [`OptionalBoolean`](../interfaces/OptionalBoolean.md)

#### Returns

`this`

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`withHidden`](SubCollectionField.md#withhidden)

***

### withLabel()

> **withLabel**(`label?`): `this`

Defined in: [listgrid/config/SubCollectionField.tsx:134](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/SubCollectionField.tsx#L134)

필드 입력폼의 라벨에 표시될 내용을 설정할 수 있습니다.

#### Parameters

##### label?

[`LabelType`](../type-aliases/LabelType.md)

#### Returns

`this`

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`withLabel`](SubCollectionField.md#withlabel)

***

### withReadOnly()

> **withReadOnly**(`readOnly?`): `this`

Defined in: [listgrid/config/SubCollectionField.tsx:139](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/SubCollectionField.tsx#L139)

필드가 readonly 인지 여부를 설정할 수 있습니다.

#### Parameters

##### readOnly?

`boolean` \| [`OptionalBoolean`](../interfaces/OptionalBoolean.md)

#### Returns

`this`

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`withReadOnly`](SubCollectionField.md#withreadonly)

***

### withHideLabel()

> **withHideLabel**(`hideLabel?`): `this`

Defined in: [listgrid/config/SubCollectionField.tsx:144](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/SubCollectionField.tsx#L144)

이 필드의 hideLabel 을 지정한다.

#### Parameters

##### hideLabel?

`boolean`

#### Returns

`this`

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`withHideLabel`](SubCollectionField.md#withhidelabel)

***

### withOrder()

> **withOrder**(`order`): `this`

Defined in: [listgrid/config/SubCollectionField.tsx:149](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/SubCollectionField.tsx#L149)

필드의 표시 순서를 설정합니다.

#### Parameters

##### order

`number`

#### Returns

`this`

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`withOrder`](SubCollectionField.md#withorder)

***

### withViewListGridOptionProps()

> **withViewListGridOptionProps**(`props`): `this`

Defined in: [listgrid/config/SubCollectionField.tsx:154](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/SubCollectionField.tsx#L154)

#### Parameters

##### props

[`ViewListGridOptionProps`](../interfaces/ViewListGridOptionProps.md)

#### Returns

`this`

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`withViewListGridOptionProps`](SubCollectionField.md#withviewlistgridoptionprops)

***

### getViewListGridOptionProps()

> **getViewListGridOptionProps**(): [`ViewListGridOptionProps`](../interfaces/ViewListGridOptionProps.md)

Defined in: [listgrid/config/SubCollectionField.tsx:159](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/SubCollectionField.tsx#L159)

#### Returns

[`ViewListGridOptionProps`](../interfaces/ViewListGridOptionProps.md)

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`getViewListGridOptionProps`](SubCollectionField.md#getviewlistgridoptionprops)

***

### getOrder()

> **getOrder**(): `number`

Defined in: [listgrid/config/SubCollectionField.tsx:163](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/SubCollectionField.tsx#L163)

#### Returns

`number`

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`getOrder`](SubCollectionField.md#getorder)

***

### getName()

> **getName**(): `string`

Defined in: [listgrid/config/SubCollectionField.tsx:167](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/SubCollectionField.tsx#L167)

#### Returns

`string`

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`getName`](SubCollectionField.md#getname)

***

### getLabel()

> **getLabel**(): [`LabelType`](../type-aliases/LabelType.md)

Defined in: [listgrid/config/SubCollectionField.tsx:171](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/SubCollectionField.tsx#L171)

#### Returns

[`LabelType`](../type-aliases/LabelType.md)

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`getLabel`](SubCollectionField.md#getlabel)

***

### getHelpText()

> **getHelpText**(`props`): `Promise`\<`ReactNode`\>

Defined in: [listgrid/config/SubCollectionField.tsx:178](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/SubCollectionField.tsx#L178)

#### Parameters

##### props

[`FieldInfoParameters`](../interfaces/FieldInfoParameters.md)

#### Returns

`Promise`\<`ReactNode`\>

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`getHelpText`](SubCollectionField.md#gethelptext)

***

### isHidden()

> **isHidden**(`props`): `Promise`\<`boolean`\>

Defined in: [listgrid/config/SubCollectionField.tsx:182](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/SubCollectionField.tsx#L182)

#### Parameters

##### props

[`FieldInfoParameters`](../interfaces/FieldInfoParameters.md)

#### Returns

`Promise`\<`boolean`\>

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`isHidden`](SubCollectionField.md#ishidden)

***

### isReadonly()

> **isReadonly**(`props`): `Promise`\<`boolean`\>

Defined in: [listgrid/config/SubCollectionField.tsx:186](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/SubCollectionField.tsx#L186)

#### Parameters

##### props

[`FieldInfoParameters`](../interfaces/FieldInfoParameters.md)

#### Returns

`Promise`\<`boolean`\>

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`isReadonly`](SubCollectionField.md#isreadonly)

***

### withForm()

> **withForm**(`form`): `this`

Defined in: [listgrid/config/SubCollectionField.tsx:190](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/SubCollectionField.tsx#L190)

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

[`SubCollectionField`](SubCollectionField.md).[`withForm`](SubCollectionField.md#withform)

***

### withViewPreset()

> **withViewPreset**(`type`): `this`

Defined in: [listgrid/config/SubCollectionField.tsx:195](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/SubCollectionField.tsx#L195)

Entity 의 상태(신규/수정)에 따라 readonly, hidden 을 ViewPreset 으로 지정해 사용할 수 있습니다.

#### Parameters

##### type

[`ViewPreset`](../type-aliases/ViewPreset.md)

#### Returns

`this`

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`withViewPreset`](SubCollectionField.md#withviewpreset)

***

### withListViewFields()

> **withListViewFields**(...`listViewFields`): `this`

Defined in: [listgrid/config/SubCollectionField.tsx:201](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/SubCollectionField.tsx#L201)

#### Parameters

##### listViewFields

...`string`[]

#### Returns

`this`

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`withListViewFields`](SubCollectionField.md#withlistviewfields)

***

### withDynamicUrl()

> **withDynamicUrl**(`props`): `this`

Defined in: [listgrid/config/SubCollectionField.tsx:206](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/SubCollectionField.tsx#L206)

#### Parameters

##### props

(`parentEntityForm`) => `string`

#### Returns

`this`

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`withDynamicUrl`](SubCollectionField.md#withdynamicurl)

***

### getListGrid()

> **getListGrid**(`parentEntityForm`): [`ListGrid`](ListGrid.md)

Defined in: [listgrid/config/SubCollectionField.tsx:211](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/SubCollectionField.tsx#L211)

#### Parameters

##### parentEntityForm

[`EntityForm`](EntityForm.md)

#### Returns

[`ListGrid`](ListGrid.md)

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`getListGrid`](SubCollectionField.md#getlistgrid)

***

### withTooltip()

> **withTooltip**(`tooltip?`): `this`

Defined in: [listgrid/config/TableSubCollectionField.tsx:99](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/TableSubCollectionField.tsx#L99)

필드 전체에 툴팁을 씌울 수 있다.

#### Parameters

##### tooltip?

[`ConditionalReactNodeValue`](../type-aliases/ConditionalReactNodeValue.md)

#### Returns

`this`

#### Overrides

[`SubCollectionField`](SubCollectionField.md).[`withTooltip`](SubCollectionField.md#withtooltip)

***

### getTooltip()

> **getTooltip**(`props`): `Promise`\<`ReactNode`\>

Defined in: [listgrid/config/TableSubCollectionField.tsx:104](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/TableSubCollectionField.tsx#L104)

#### Parameters

##### props

[`FieldInfoParameters`](../interfaces/FieldInfoParameters.md)

#### Returns

`Promise`\<`ReactNode`\>

***

### clone()

> **clone**(): `TableSubCollectionField`

Defined in: [listgrid/config/TableSubCollectionField.tsx:108](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/TableSubCollectionField.tsx#L108)

#### Returns

`TableSubCollectionField`

#### Overrides

[`SubCollectionField`](SubCollectionField.md).[`clone`](SubCollectionField.md#clone)

***

### withFetchOptions()

> **withFetchOptions**(`fetchOptions`): `this`

Defined in: [listgrid/config/TableSubCollectionField.tsx:130](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/TableSubCollectionField.tsx#L130)

#### Parameters

##### fetchOptions

[`CardSubCollectionFetchOptions`](../interfaces/CardSubCollectionFetchOptions.md)

#### Returns

`this`

***

### withTableConfig()

> **withTableConfig**(`tableConfig`): `this`

Defined in: [listgrid/config/TableSubCollectionField.tsx:135](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/TableSubCollectionField.tsx#L135)

#### Parameters

##### tableConfig

[`TableConfig`](../interfaces/TableConfig.md)

#### Returns

`this`

***

### buildSearchForm()

> **buildSearchForm**(`parentEntityForm`): `Promise`\<[`SearchForm`](SearchForm.md)\>

Defined in: [listgrid/config/TableSubCollectionField.tsx:140](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/TableSubCollectionField.tsx#L140)

#### Parameters

##### parentEntityForm

[`EntityForm`](EntityForm.md)

#### Returns

`Promise`\<[`SearchForm`](SearchForm.md)\>

***

### render()

> **render**(`__namedParameters`): `Promise`\<`ReactNode`\>

Defined in: [listgrid/config/TableSubCollectionField.tsx:171](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/TableSubCollectionField.tsx#L171)

#### Parameters

##### \_\_namedParameters

###### entityForm

[`EntityForm`](EntityForm.md)

###### session?

[`Session`](../interfaces/Session.md)

#### Returns

`Promise`\<`ReactNode`\>

#### Overrides

[`SubCollectionField`](SubCollectionField.md).[`render`](SubCollectionField.md#render)
