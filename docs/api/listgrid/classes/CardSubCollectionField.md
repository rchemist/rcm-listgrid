[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / CardSubCollectionField

# Class: CardSubCollectionField

Defined in: [listgrid/config/CardSubCollectionField.tsx:111](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/CardSubCollectionField.tsx#L111)

CardSubCollectionField configuration
Extends SubCollectionField to display items in a card grid format

## Extends

- [`SubCollectionField`](SubCollectionField.md)

## Constructors

### Constructor

> **new CardSubCollectionField**(`props`): `CardSubCollectionField`

Defined in: [listgrid/config/CardSubCollectionField.tsx:119](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/CardSubCollectionField.tsx#L119)

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

###### cardConfig?

[`CardConfig`](../interfaces/CardConfig.md)

###### fetchOptions?

[`CardSubCollectionFetchOptions`](../interfaces/CardSubCollectionFetchOptions.md)

#### Returns

`CardSubCollectionField`

#### Overrides

[`SubCollectionField`](SubCollectionField.md).[`constructor`](SubCollectionField.md#constructor)

## Properties

### tooltip?

> `optional` **tooltip?**: [`ConditionalReactNodeValue`](../type-aliases/ConditionalReactNodeValue.md)

Defined in: [listgrid/config/CardSubCollectionField.tsx:113](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/CardSubCollectionField.tsx#L113)

***

### fetchUrl

> **fetchUrl**: `string`

Defined in: [listgrid/config/CardSubCollectionField.tsx:114](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/CardSubCollectionField.tsx#L114)

***

### fetchUrlFunction?

> `optional` **fetchUrlFunction?**: (`parentEntityForm`) => `string`

Defined in: [listgrid/config/CardSubCollectionField.tsx:115](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/CardSubCollectionField.tsx#L115)

#### Parameters

##### parentEntityForm

[`EntityForm`](EntityForm.md)

#### Returns

`string`

***

### cardConfig?

> `optional` **cardConfig?**: [`CardConfig`](../interfaces/CardConfig.md)

Defined in: [listgrid/config/CardSubCollectionField.tsx:116](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/CardSubCollectionField.tsx#L116)

***

### fetchOptions?

> `optional` **fetchOptions?**: [`CardSubCollectionFetchOptions`](../interfaces/CardSubCollectionFetchOptions.md)

Defined in: [listgrid/config/CardSubCollectionField.tsx:117](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/CardSubCollectionField.tsx#L117)

***

### order

> **order**: `number`

Defined in: [listgrid/config/SubCollectionField.tsx:35](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L35)

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`order`](SubCollectionField.md#order)

***

### name

> **name**: `string`

Defined in: [listgrid/config/SubCollectionField.tsx:36](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L36)

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`name`](SubCollectionField.md#name)

***

### label?

> `optional` **label?**: [`LabelType`](../type-aliases/LabelType.md)

Defined in: [listgrid/config/SubCollectionField.tsx:37](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L37)

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`label`](SubCollectionField.md#label)

***

### helpText?

> `optional` **helpText?**: [`ConditionalReactNodeValue`](../type-aliases/ConditionalReactNodeValue.md)

Defined in: [listgrid/config/SubCollectionField.tsx:38](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L38)

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`helpText`](SubCollectionField.md#helptext)

***

### hidden?

> `optional` **hidden?**: [`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

Defined in: [listgrid/config/SubCollectionField.tsx:39](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L39)

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`hidden`](SubCollectionField.md#hidden)

***

### readonly?

> `optional` **readonly?**: [`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

Defined in: [listgrid/config/SubCollectionField.tsx:40](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L40)

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`readonly`](SubCollectionField.md#readonly)

***

### dynamicUrl?

> `optional` **dynamicUrl?**: (`parentEntityForm`) => `string`

Defined in: [listgrid/config/SubCollectionField.tsx:41](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L41)

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

Defined in: [listgrid/config/SubCollectionField.tsx:44](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L44)

#### tabId

> **tabId**: `string`

#### fieldGroupId

> **fieldGroupId**: `string`

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`form`](SubCollectionField.md#form)

***

### entityForm

> **entityForm**: [`EntityForm`](EntityForm.md)

Defined in: [listgrid/config/SubCollectionField.tsx:46](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L46)

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`entityForm`](SubCollectionField.md#entityform)

***

### hideLabel?

> `optional` **hideLabel?**: `boolean`

Defined in: [listgrid/config/SubCollectionField.tsx:47](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L47)

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`hideLabel`](SubCollectionField.md#hidelabel)

***

### relation

> **relation**: `SubCollectionRelation`

Defined in: [listgrid/config/SubCollectionField.tsx:49](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L49)

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`relation`](SubCollectionField.md#relation)

***

### listViewFields?

> `optional` **listViewFields?**: `string`[]

Defined in: [listgrid/config/SubCollectionField.tsx:52](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L52)

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`listViewFields`](SubCollectionField.md#listviewfields)

***

### viewListOptions?

> `optional` **viewListOptions?**: [`ViewListGridOptionProps`](../interfaces/ViewListGridOptionProps.md)

Defined in: [listgrid/config/SubCollectionField.tsx:54](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L54)

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`viewListOptions`](SubCollectionField.md#viewlistoptions)

## Methods

### withTooltip()

> **withTooltip**(`tooltip?`): `this`

Defined in: [listgrid/config/CardSubCollectionField.tsx:174](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/CardSubCollectionField.tsx#L174)

Override withTooltip to support tooltips (parent class doesn't support it)

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

Defined in: [listgrid/config/CardSubCollectionField.tsx:179](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/CardSubCollectionField.tsx#L179)

#### Parameters

##### props

[`FieldInfoParameters`](../interfaces/FieldInfoParameters.md)

#### Returns

`Promise`\<`ReactNode`\>

***

### clone()

> **clone**(): `CardSubCollectionField`

Defined in: [listgrid/config/CardSubCollectionField.tsx:186](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/CardSubCollectionField.tsx#L186)

Override clone to include card-specific properties

#### Returns

`CardSubCollectionField`

#### Overrides

[`SubCollectionField`](SubCollectionField.md).[`clone`](SubCollectionField.md#clone)

***

### withFetchOptions()

> **withFetchOptions**(`fetchOptions`): `this`

Defined in: [listgrid/config/CardSubCollectionField.tsx:208](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/CardSubCollectionField.tsx#L208)

#### Parameters

##### fetchOptions

[`CardSubCollectionFetchOptions`](../interfaces/CardSubCollectionFetchOptions.md)

#### Returns

`this`

***

### withCardConfig()

> **withCardConfig**(`cardConfig`): `this`

Defined in: [listgrid/config/CardSubCollectionField.tsx:214](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/CardSubCollectionField.tsx#L214)

#### Parameters

##### cardConfig

[`CardConfig`](../interfaces/CardConfig.md)

#### Returns

`this`

***

### buildSearchForm()

> **buildSearchForm**(`parentEntityForm`): `Promise`\<[`SearchForm`](SearchForm.md)\>

Defined in: [listgrid/config/CardSubCollectionField.tsx:223](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/CardSubCollectionField.tsx#L223)

Build the SearchForm for fetching data
Note: getMappedByFilter() and getMappedByValue() are inherited from SubCollectionField

#### Parameters

##### parentEntityForm

[`EntityForm`](EntityForm.md)

#### Returns

`Promise`\<[`SearchForm`](SearchForm.md)\>

***

### render()

> **render**(`__namedParameters`): `Promise`\<`ReactNode`\>

Defined in: [listgrid/config/CardSubCollectionField.tsx:264](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/CardSubCollectionField.tsx#L264)

Override render to display card grid instead of list grid

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

***

### getTabId()

> **getTabId**(): `string`

Defined in: [listgrid/config/SubCollectionField.tsx:105](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L105)

#### Returns

`string`

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`getTabId`](SubCollectionField.md#gettabid)

***

### getFieldGroupId()

> **getFieldGroupId**(): `string`

Defined in: [listgrid/config/SubCollectionField.tsx:109](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L109)

#### Returns

`string`

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`getFieldGroupId`](SubCollectionField.md#getfieldgroupid)

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

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`withTabId`](SubCollectionField.md#withtabid)

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

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`withFieldGroupId`](SubCollectionField.md#withfieldgroupid)

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

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`withHelpText`](SubCollectionField.md#withhelptext)

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

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`withHidden`](SubCollectionField.md#withhidden)

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

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`withLabel`](SubCollectionField.md#withlabel)

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

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`withReadOnly`](SubCollectionField.md#withreadonly)

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

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`withHideLabel`](SubCollectionField.md#withhidelabel)

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

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`withOrder`](SubCollectionField.md#withorder)

***

### withViewListGridOptionProps()

> **withViewListGridOptionProps**(`props`): `this`

Defined in: [listgrid/config/SubCollectionField.tsx:161](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L161)

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

Defined in: [listgrid/config/SubCollectionField.tsx:166](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L166)

#### Returns

[`ViewListGridOptionProps`](../interfaces/ViewListGridOptionProps.md)

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`getViewListGridOptionProps`](SubCollectionField.md#getviewlistgridoptionprops)

***

### getOrder()

> **getOrder**(): `number`

Defined in: [listgrid/config/SubCollectionField.tsx:170](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L170)

#### Returns

`number`

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`getOrder`](SubCollectionField.md#getorder)

***

### getName()

> **getName**(): `string`

Defined in: [listgrid/config/SubCollectionField.tsx:174](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L174)

#### Returns

`string`

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`getName`](SubCollectionField.md#getname)

***

### getLabel()

> **getLabel**(): [`LabelType`](../type-aliases/LabelType.md)

Defined in: [listgrid/config/SubCollectionField.tsx:178](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L178)

#### Returns

[`LabelType`](../type-aliases/LabelType.md)

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`getLabel`](SubCollectionField.md#getlabel)

***

### getHelpText()

> **getHelpText**(`props`): `Promise`\<`ReactNode`\>

Defined in: [listgrid/config/SubCollectionField.tsx:185](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L185)

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

Defined in: [listgrid/config/SubCollectionField.tsx:189](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L189)

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

Defined in: [listgrid/config/SubCollectionField.tsx:193](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L193)

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

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`withForm`](SubCollectionField.md#withform)

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

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`withViewPreset`](SubCollectionField.md#withviewpreset)

***

### withListViewFields()

> **withListViewFields**(...`listViewFields`): `this`

Defined in: [listgrid/config/SubCollectionField.tsx:208](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L208)

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

Defined in: [listgrid/config/SubCollectionField.tsx:213](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L213)

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

Defined in: [listgrid/config/SubCollectionField.tsx:218](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/SubCollectionField.tsx#L218)

#### Parameters

##### parentEntityForm

[`EntityForm`](EntityForm.md)

#### Returns

[`ListGrid`](ListGrid.md)

#### Inherited from

[`SubCollectionField`](SubCollectionField.md).[`getListGrid`](SubCollectionField.md#getlistgrid)
