[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / InlineSubCollectionField

# Class: InlineSubCollectionField

Defined in: [listgrid/config/InlineSubCollectionField.tsx:134](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L134)

InlineSubCollectionField configuration
Extends SubCollectionField to display items in a simple list table format
without detail view - only shows list with optional row actions

## Extends

- [`SubCollectionField`](SubCollectionField.md)

## Constructors

### Constructor

> **new InlineSubCollectionField**(`props`): `InlineSubCollectionField`

Defined in: [listgrid/config/InlineSubCollectionField.tsx:154](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L154)

#### Parameters

##### props

###### entityForm

[`EntityForm`](EntityForm.md)

###### relation

[`InlineSubCollectionRelation`](../interfaces/InlineSubCollectionRelation.md)

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

###### listFields?

(`string` \| [`InlineListFieldConfig`](../interfaces/InlineListFieldConfig.md))[]

###### rowActionColumns?

[`InlineRowActionColumn`](../interfaces/InlineRowActionColumn.md)[]

Row action columns - supports multiple action columns

###### pagination?

[`InlinePaginationOptions`](../interfaces/InlinePaginationOptions.md)

###### globalListConfig?

[`InlineGlobalListConfig`](../interfaces/InlineGlobalListConfig.md)

###### fetchOptions?

[`InlineSubCollectionFetchOptions`](../interfaces/InlineSubCollectionFetchOptions.md)

###### hideTitle?

`boolean`

#### Returns

`InlineSubCollectionField`

#### Overrides

[`SubCollectionField`](SubCollectionField.md).[`constructor`](SubCollectionField.md#constructor)

## Properties

### tooltip?

> `optional` **tooltip?**: [`ConditionalReactNodeValue`](../type-aliases/ConditionalReactNodeValue.md)

Defined in: [listgrid/config/InlineSubCollectionField.tsx:136](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L136)

***

### fetchOptions?

> `optional` **fetchOptions?**: [`InlineSubCollectionFetchOptions`](../interfaces/InlineSubCollectionFetchOptions.md)

Defined in: [listgrid/config/InlineSubCollectionField.tsx:137](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L137)

***

### inlineListFields?

> `optional` **inlineListFields?**: (`string` \| [`InlineListFieldConfig`](../interfaces/InlineListFieldConfig.md))[]

Defined in: [listgrid/config/InlineSubCollectionField.tsx:140](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L140)

List fields to display - can be field names or detailed config

***

### inlineRowActionColumns?

> `optional` **inlineRowActionColumns?**: [`InlineRowActionColumn`](../interfaces/InlineRowActionColumn.md)[]

Defined in: [listgrid/config/InlineSubCollectionField.tsx:143](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L143)

Row action columns - supports multiple action columns

***

### inlinePagination?

> `optional` **inlinePagination?**: [`InlinePaginationOptions`](../interfaces/InlinePaginationOptions.md)

Defined in: [listgrid/config/InlineSubCollectionField.tsx:146](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L146)

Pagination options

***

### inlineGlobalListConfig?

> `optional` **inlineGlobalListConfig?**: [`InlineGlobalListConfig`](../interfaces/InlineGlobalListConfig.md)

Defined in: [listgrid/config/InlineSubCollectionField.tsx:149](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L149)

Global ListConfig applied to all fields

***

### hideTitle?

> `optional` **hideTitle?**: `boolean`

Defined in: [listgrid/config/InlineSubCollectionField.tsx:152](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L152)

Hide title

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

Defined in: [listgrid/config/InlineSubCollectionField.tsx:205](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L205)

Override withTooltip to support tooltips

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

Defined in: [listgrid/config/InlineSubCollectionField.tsx:210](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L210)

#### Parameters

##### props

[`FieldInfoParameters`](../interfaces/FieldInfoParameters.md)

#### Returns

`Promise`\<`ReactNode`\>

***

### withListFields()

> **withListFields**(...`fields`): `this`

Defined in: [listgrid/config/InlineSubCollectionField.tsx:217](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L217)

Set list fields to display

#### Parameters

##### fields

...(`string` \| [`InlineListFieldConfig`](../interfaces/InlineListFieldConfig.md))[]

#### Returns

`this`

***

### withRowActionColumns()

> **withRowActionColumns**(...`columns`): `this`

Defined in: [listgrid/config/InlineSubCollectionField.tsx:225](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L225)

Set row action columns - supports multiple action columns

#### Parameters

##### columns

...[`InlineRowActionColumn`](../interfaces/InlineRowActionColumn.md)[]

#### Returns

`this`

***

### withPagination()

> **withPagination**(`options`): `this`

Defined in: [listgrid/config/InlineSubCollectionField.tsx:233](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L233)

Set pagination options

#### Parameters

##### options

[`InlinePaginationOptions`](../interfaces/InlinePaginationOptions.md)

#### Returns

`this`

***

### withGlobalListConfig()

> **withGlobalListConfig**(`config`): `this`

Defined in: [listgrid/config/InlineSubCollectionField.tsx:241](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L241)

Set global ListConfig

#### Parameters

##### config

[`InlineGlobalListConfig`](../interfaces/InlineGlobalListConfig.md)

#### Returns

`this`

***

### withFetchOptions()

> **withFetchOptions**(`options`): `this`

Defined in: [listgrid/config/InlineSubCollectionField.tsx:249](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L249)

Set fetch options

#### Parameters

##### options

[`InlineSubCollectionFetchOptions`](../interfaces/InlineSubCollectionFetchOptions.md)

#### Returns

`this`

***

### withHideTitle()

> **withHideTitle**(`hide?`): `this`

Defined in: [listgrid/config/InlineSubCollectionField.tsx:257](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L257)

Hide title

#### Parameters

##### hide?

`boolean`

#### Returns

`this`

***

### clone()

> **clone**(): `InlineSubCollectionField`

Defined in: [listgrid/config/InlineSubCollectionField.tsx:265](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L265)

Override clone to include inline-specific properties

#### Returns

`InlineSubCollectionField`

#### Overrides

[`SubCollectionField`](SubCollectionField.md).[`clone`](SubCollectionField.md#clone)

***

### buildSearchForm()

> **buildSearchForm**(`parentEntityForm`): `Promise`\<[`SearchForm`](SearchForm.md)\>

Defined in: [listgrid/config/InlineSubCollectionField.tsx:296](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L296)

Build the SearchForm for fetching data

#### Parameters

##### parentEntityForm

[`EntityForm`](EntityForm.md)

#### Returns

`Promise`\<[`SearchForm`](SearchForm.md)\>

***

### render()

> **render**(`__namedParameters`): `Promise`\<`ReactNode`\>

Defined in: [listgrid/config/InlineSubCollectionField.tsx:337](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L337)

Override render to display inline list table

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
