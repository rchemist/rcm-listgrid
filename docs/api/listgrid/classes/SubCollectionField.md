[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / SubCollectionField

# Class: SubCollectionField

Defined in: [listgrid/config/SubCollectionField.tsx:34](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L34)

## Extended by

- [`CardSubCollectionField`](CardSubCollectionField.md)
- [`TableSubCollectionField`](TableSubCollectionField.md)
- [`InlineSubCollectionField`](InlineSubCollectionField.md)

## Implements

- [`EntityItem`](../interfaces/EntityItem.md)

## Constructors

### Constructor

> **new SubCollectionField**(`props`): `SubCollectionField`

Defined in: [listgrid/config/SubCollectionField.tsx:56](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L56)

#### Parameters

##### props

###### entityForm

[`EntityForm`](EntityForm.md)

###### relation

`SubCollectionRelation`

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

###### dynamicUrl?

(`parentEntityForm`) => `string`

###### viewListOptions?

[`ViewListGridOptionProps`](../interfaces/ViewListGridOptionProps.md)

#### Returns

`SubCollectionField`

## Properties

### order

> **order**: `number`

Defined in: [listgrid/config/SubCollectionField.tsx:35](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L35)

#### Implementation of

[`EntityItem`](../interfaces/EntityItem.md).[`order`](../interfaces/EntityItem.md#order)

***

### name

> **name**: `string`

Defined in: [listgrid/config/SubCollectionField.tsx:36](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L36)

#### Implementation of

[`EntityItem`](../interfaces/EntityItem.md).[`name`](../interfaces/EntityItem.md#name)

***

### label?

> `optional` **label?**: [`LabelType`](../type-aliases/LabelType.md)

Defined in: [listgrid/config/SubCollectionField.tsx:37](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L37)

#### Implementation of

[`EntityItem`](../interfaces/EntityItem.md).[`label`](../interfaces/EntityItem.md#label)

***

### helpText?

> `optional` **helpText?**: [`ConditionalReactNodeValue`](../type-aliases/ConditionalReactNodeValue.md)

Defined in: [listgrid/config/SubCollectionField.tsx:38](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L38)

#### Implementation of

[`EntityItem`](../interfaces/EntityItem.md).[`helpText`](../interfaces/EntityItem.md#helptext)

***

### hidden?

> `optional` **hidden?**: [`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

Defined in: [listgrid/config/SubCollectionField.tsx:39](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L39)

#### Implementation of

[`EntityItem`](../interfaces/EntityItem.md).[`hidden`](../interfaces/EntityItem.md#hidden)

***

### readonly?

> `optional` **readonly?**: [`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

Defined in: [listgrid/config/SubCollectionField.tsx:40](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L40)

#### Implementation of

[`EntityItem`](../interfaces/EntityItem.md).[`readonly`](../interfaces/EntityItem.md#readonly)

***

### dynamicUrl?

> `optional` **dynamicUrl?**: (`parentEntityForm`) => `string`

Defined in: [listgrid/config/SubCollectionField.tsx:41](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L41)

#### Parameters

##### parentEntityForm

[`EntityForm`](EntityForm.md)

#### Returns

`string`

***

### form?

> `optional` **form?**: `object`

Defined in: [listgrid/config/SubCollectionField.tsx:44](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L44)

#### tabId

> **tabId**: `string`

#### fieldGroupId

> **fieldGroupId**: `string`

#### Implementation of

[`EntityItem`](../interfaces/EntityItem.md).[`form`](../interfaces/EntityItem.md#form)

***

### entityForm

> **entityForm**: [`EntityForm`](EntityForm.md)

Defined in: [listgrid/config/SubCollectionField.tsx:46](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L46)

***

### hideLabel?

> `optional` **hideLabel?**: `boolean`

Defined in: [listgrid/config/SubCollectionField.tsx:47](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L47)

#### Implementation of

[`EntityItem`](../interfaces/EntityItem.md).[`hideLabel`](../interfaces/EntityItem.md#hidelabel)

***

### relation

> **relation**: `SubCollectionRelation`

Defined in: [listgrid/config/SubCollectionField.tsx:49](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L49)

***

### listViewFields?

> `optional` **listViewFields?**: `string`[]

Defined in: [listgrid/config/SubCollectionField.tsx:52](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L52)

***

### viewListOptions?

> `optional` **viewListOptions?**: [`ViewListGridOptionProps`](../interfaces/ViewListGridOptionProps.md)

Defined in: [listgrid/config/SubCollectionField.tsx:54](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L54)

## Methods

### withTooltip()

> **withTooltip**(`tooltip?`): `this`

Defined in: [listgrid/config/SubCollectionField.tsx:80](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L80)

필드 전체에 툴팁을 씌울 수 있다.

#### Parameters

##### tooltip?

[`ConditionalReactNodeValue`](../type-aliases/ConditionalReactNodeValue.md)

#### Returns

`this`

#### Implementation of

[`EntityItem`](../interfaces/EntityItem.md).[`withTooltip`](../interfaces/EntityItem.md#withtooltip)

***

### clone()

> **clone**(): `SubCollectionField`

Defined in: [listgrid/config/SubCollectionField.tsx:85](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L85)

#### Returns

`SubCollectionField`

#### Implementation of

[`EntityItem`](../interfaces/EntityItem.md).[`clone`](../interfaces/EntityItem.md#clone)

***

### getTabId()

> **getTabId**(): `string`

Defined in: [listgrid/config/SubCollectionField.tsx:105](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L105)

#### Returns

`string`

#### Implementation of

[`EntityItem`](../interfaces/EntityItem.md).[`getTabId`](../interfaces/EntityItem.md#gettabid)

***

### getFieldGroupId()

> **getFieldGroupId**(): `string`

Defined in: [listgrid/config/SubCollectionField.tsx:109](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L109)

#### Returns

`string`

#### Implementation of

[`EntityItem`](../interfaces/EntityItem.md).[`getFieldGroupId`](../interfaces/EntityItem.md#getfieldgroupid)

***

### withTabId()

> **withTabId**(`tabId`): `this`

Defined in: [listgrid/config/SubCollectionField.tsx:113](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L113)

필드가 표시될 tab의 id 를 지정합니다.
보통 이 메소드는 EntityForm#addFields 에서 처리되므로 별도로 사용할 필요가 없습니다.

#### Parameters

##### tabId

`string`

#### Returns

`this`

#### Implementation of

[`EntityItem`](../interfaces/EntityItem.md).[`withTabId`](../interfaces/EntityItem.md#withtabid)

***

### withFieldGroupId()

> **withFieldGroupId**(`fieldGroupId`): `this`

Defined in: [listgrid/config/SubCollectionField.tsx:122](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L122)

필드가 표시될 fieldGroup 의 id 를 지정합니다.
보통 이 메소드는 EntityForm#addFields 에서 처리되므로 별도로 사용할 필요가 없습니다.

#### Parameters

##### fieldGroupId

`string`

#### Returns

`this`

#### Implementation of

[`EntityItem`](../interfaces/EntityItem.md).[`withFieldGroupId`](../interfaces/EntityItem.md#withfieldgroupid)

***

### withHelpText()

> **withHelpText**(`helpText?`): `this`

Defined in: [listgrid/config/SubCollectionField.tsx:131](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L131)

필드 입력폼 하단에 출력될 helpText 를 지정할 수 있습니다.

#### Parameters

##### helpText?

[`ConditionalReactNodeValue`](../type-aliases/ConditionalReactNodeValue.md)

#### Returns

`this`

#### Implementation of

[`EntityItem`](../interfaces/EntityItem.md).[`withHelpText`](../interfaces/EntityItem.md#withhelptext)

***

### withHidden()

> **withHidden**(`hidden?`): `this`

Defined in: [listgrid/config/SubCollectionField.tsx:136](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L136)

필드의 visible 옵션을 설정할 수 있습니다.

#### Parameters

##### hidden?

`boolean` \| [`OptionalBoolean`](../interfaces/OptionalBoolean.md)

#### Returns

`this`

#### Implementation of

[`EntityItem`](../interfaces/EntityItem.md).[`withHidden`](../interfaces/EntityItem.md#withhidden)

***

### withLabel()

> **withLabel**(`label?`): `this`

Defined in: [listgrid/config/SubCollectionField.tsx:141](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L141)

필드 입력폼의 라벨에 표시될 내용을 설정할 수 있습니다.

#### Parameters

##### label?

[`LabelType`](../type-aliases/LabelType.md)

#### Returns

`this`

#### Implementation of

[`EntityItem`](../interfaces/EntityItem.md).[`withLabel`](../interfaces/EntityItem.md#withlabel)

***

### withReadOnly()

> **withReadOnly**(`readOnly?`): `this`

Defined in: [listgrid/config/SubCollectionField.tsx:146](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L146)

필드가 readonly 인지 여부를 설정할 수 있습니다.

#### Parameters

##### readOnly?

`boolean` \| [`OptionalBoolean`](../interfaces/OptionalBoolean.md)

#### Returns

`this`

#### Implementation of

[`EntityItem`](../interfaces/EntityItem.md).[`withReadOnly`](../interfaces/EntityItem.md#withreadonly)

***

### withHideLabel()

> **withHideLabel**(`hideLabel?`): `this`

Defined in: [listgrid/config/SubCollectionField.tsx:151](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L151)

이 필드의 hideLabel 을 지정한다.

#### Parameters

##### hideLabel?

`boolean`

#### Returns

`this`

#### Implementation of

[`EntityItem`](../interfaces/EntityItem.md).[`withHideLabel`](../interfaces/EntityItem.md#withhidelabel)

***

### withOrder()

> **withOrder**(`order`): `this`

Defined in: [listgrid/config/SubCollectionField.tsx:156](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L156)

필드의 표시 순서를 설정합니다.

#### Parameters

##### order

`number`

#### Returns

`this`

#### Implementation of

[`EntityItem`](../interfaces/EntityItem.md).[`withOrder`](../interfaces/EntityItem.md#withorder)

***

### withViewListGridOptionProps()

> **withViewListGridOptionProps**(`props`): `this`

Defined in: [listgrid/config/SubCollectionField.tsx:161](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L161)

#### Parameters

##### props

[`ViewListGridOptionProps`](../interfaces/ViewListGridOptionProps.md)

#### Returns

`this`

***

### getViewListGridOptionProps()

> **getViewListGridOptionProps**(): [`ViewListGridOptionProps`](../interfaces/ViewListGridOptionProps.md)

Defined in: [listgrid/config/SubCollectionField.tsx:166](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L166)

#### Returns

[`ViewListGridOptionProps`](../interfaces/ViewListGridOptionProps.md)

***

### getOrder()

> **getOrder**(): `number`

Defined in: [listgrid/config/SubCollectionField.tsx:170](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L170)

#### Returns

`number`

#### Implementation of

[`EntityItem`](../interfaces/EntityItem.md).[`getOrder`](../interfaces/EntityItem.md#getorder)

***

### getName()

> **getName**(): `string`

Defined in: [listgrid/config/SubCollectionField.tsx:174](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L174)

#### Returns

`string`

#### Implementation of

[`EntityItem`](../interfaces/EntityItem.md).[`getName`](../interfaces/EntityItem.md#getname)

***

### getLabel()

> **getLabel**(): [`LabelType`](../type-aliases/LabelType.md)

Defined in: [listgrid/config/SubCollectionField.tsx:178](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L178)

#### Returns

[`LabelType`](../type-aliases/LabelType.md)

#### Implementation of

[`EntityItem`](../interfaces/EntityItem.md).[`getLabel`](../interfaces/EntityItem.md#getlabel)

***

### getHelpText()

> **getHelpText**(`props`): `Promise`\<`ReactNode`\>

Defined in: [listgrid/config/SubCollectionField.tsx:185](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L185)

#### Parameters

##### props

[`FieldInfoParameters`](../interfaces/FieldInfoParameters.md)

#### Returns

`Promise`\<`ReactNode`\>

#### Implementation of

[`EntityItem`](../interfaces/EntityItem.md).[`getHelpText`](../interfaces/EntityItem.md#gethelptext)

***

### isHidden()

> **isHidden**(`props`): `Promise`\<`boolean`\>

Defined in: [listgrid/config/SubCollectionField.tsx:189](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L189)

#### Parameters

##### props

[`FieldInfoParameters`](../interfaces/FieldInfoParameters.md)

#### Returns

`Promise`\<`boolean`\>

#### Implementation of

[`EntityItem`](../interfaces/EntityItem.md).[`isHidden`](../interfaces/EntityItem.md#ishidden)

***

### isReadonly()

> **isReadonly**(`props`): `Promise`\<`boolean`\>

Defined in: [listgrid/config/SubCollectionField.tsx:193](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L193)

#### Parameters

##### props

[`FieldInfoParameters`](../interfaces/FieldInfoParameters.md)

#### Returns

`Promise`\<`boolean`\>

#### Implementation of

[`EntityItem`](../interfaces/EntityItem.md).[`isReadonly`](../interfaces/EntityItem.md#isreadonly)

***

### withForm()

> **withForm**(`form`): `this`

Defined in: [listgrid/config/SubCollectionField.tsx:197](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L197)

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

#### Implementation of

[`EntityItem`](../interfaces/EntityItem.md).[`withForm`](../interfaces/EntityItem.md#withform)

***

### withViewPreset()

> **withViewPreset**(`type`): `this`

Defined in: [listgrid/config/SubCollectionField.tsx:202](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L202)

Entity 의 상태(신규/수정)에 따라 readonly, hidden 을 ViewPreset 으로 지정해 사용할 수 있습니다.

#### Parameters

##### type

[`ViewPreset`](../type-aliases/ViewPreset.md)

#### Returns

`this`

#### Implementation of

[`EntityItem`](../interfaces/EntityItem.md).[`withViewPreset`](../interfaces/EntityItem.md#withviewpreset)

***

### withListViewFields()

> **withListViewFields**(...`listViewFields`): `this`

Defined in: [listgrid/config/SubCollectionField.tsx:208](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L208)

#### Parameters

##### listViewFields

...`string`[]

#### Returns

`this`

***

### withDynamicUrl()

> **withDynamicUrl**(`props`): `this`

Defined in: [listgrid/config/SubCollectionField.tsx:213](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L213)

#### Parameters

##### props

(`parentEntityForm`) => `string`

#### Returns

`this`

***

### getListGrid()

> **getListGrid**(`parentEntityForm`): [`ListGrid`](ListGrid.md)

Defined in: [listgrid/config/SubCollectionField.tsx:218](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L218)

#### Parameters

##### parentEntityForm

[`EntityForm`](EntityForm.md)

#### Returns

[`ListGrid`](ListGrid.md)

***

### render()

> **render**(`__namedParameters`): `Promise`\<`ReactNode`\>

Defined in: [listgrid/config/SubCollectionField.tsx:235](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L235)

#### Parameters

##### \_\_namedParameters

###### entityForm

[`EntityForm`](EntityForm.md)

###### session?

[`Session`](../interfaces/Session.md)

#### Returns

`Promise`\<`ReactNode`\>
