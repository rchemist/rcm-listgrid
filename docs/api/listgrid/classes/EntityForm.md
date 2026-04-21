[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / EntityForm

# Class: EntityForm\<T\>

Defined in: [listgrid/config/EntityForm.tsx:31](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityForm.tsx#L31)

## Extends

- `EntityFormExtensions`\<`T`\>

## Type Parameters

### T

`T` *extends* `object` = `any`

## Constructors

### Constructor

> **new EntityForm**\<`T`\>(`name`, `url`): `EntityForm`\<`T`\>

Defined in: [listgrid/config/EntityForm.tsx:32](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityForm.tsx#L32)

#### Parameters

##### name

`string`

##### url

`string`

#### Returns

`EntityForm`\<`T`\>

#### Overrides

`EntityFormExtensions<T>.constructor`

## Properties

### version

> **version**: `string`

Defined in: [listgrid/config/form/EntityFormBase.tsx:42](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L42)

#### Inherited from

`EntityFormExtensions.version`

***

### revisionEntityName?

> `optional` **revisionEntityName?**: `string`

Defined in: [listgrid/config/form/EntityFormBase.tsx:43](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L43)

#### Inherited from

`EntityFormExtensions.revisionEntityName`

***

### parentId?

> `optional` **parentId?**: `string`

Defined in: [listgrid/config/form/EntityFormBase.tsx:44](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L44)

#### Inherited from

`EntityFormExtensions.parentId`

***

### id?

> `optional` **id?**: `string`

Defined in: [listgrid/config/form/EntityFormBase.tsx:45](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L45)

#### Inherited from

`EntityFormExtensions.id`

***

### name

> **name**: `string`

Defined in: [listgrid/config/form/EntityFormBase.tsx:46](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L46)

#### Inherited from

`EntityFormExtensions.name`

***

### title?

> `optional` **title?**: `object`

Defined in: [listgrid/config/form/EntityFormBase.tsx:47](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L47)

#### title?

> `optional` **title?**: `string`

#### field?

> `optional` **field?**: `string`

#### view?

> `optional` **view?**: (`entityForm`) => `Promise`\<`ReactNode`\>

##### Parameters

###### entityForm

`EntityForm`\<`T`\>

##### Returns

`Promise`\<`ReactNode`\>

#### Inherited from

`EntityFormExtensions.title`

***

### url

> **url**: `string`

Defined in: [listgrid/config/form/EntityFormBase.tsx:55](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L55)

#### Inherited from

`EntityFormExtensions.url`

***

### menuUrl?

> `optional` **menuUrl?**: `string`

Defined in: [listgrid/config/form/EntityFormBase.tsx:57](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L57)

#### Inherited from

`EntityFormExtensions.menuUrl`

***

### readonly?

> `optional` **readonly?**: `boolean`

Defined in: [listgrid/config/form/EntityFormBase.tsx:58](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L58)

#### Inherited from

`EntityFormExtensions.readonly`

***

### session?

> `optional` **session?**: [`Session`](../interfaces/Session.md)

Defined in: [listgrid/config/form/EntityFormBase.tsx:60](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L60)

#### Inherited from

`EntityFormExtensions.session`

***

### createStep?

> `optional` **createStep?**: [`CreateStep`](../interfaces/CreateStep.md)[]

Defined in: [listgrid/config/form/EntityFormBase.tsx:62](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L62)

#### Inherited from

`EntityFormExtensions.createStep`

***

### manageEntityForm

> **manageEntityForm**: [`ManageEntityForm`](../interfaces/ManageEntityForm.md)

Defined in: [listgrid/config/form/EntityFormBase.tsx:63](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L63)

#### Inherited from

`EntityFormExtensions.manageEntityForm`

***

### tabs

> **tabs**: `Map`\<`string`, [`EntityTab`](EntityTab.md)\>

Defined in: [listgrid/config/form/EntityFormBase.tsx:66](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L66)

#### Inherited from

`EntityFormExtensions.tabs`

***

### fields

> **fields**: `Map`\<`string`, [`EntityField`](../interfaces/EntityField.md)\>

Defined in: [listgrid/config/form/EntityFormBase.tsx:68](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L68)

#### Inherited from

`EntityFormExtensions.fields`

***

### collections

> **collections**: `Map`\<`string`, [`SubCollectionField`](SubCollectionField.md)\>

Defined in: [listgrid/config/form/EntityFormBase.tsx:70](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L70)

#### Inherited from

`EntityFormExtensions.collections`

***

### errors?

> `optional` **errors?**: [`FieldError`](../interfaces/FieldError.md)[]

Defined in: [listgrid/config/form/EntityFormBase.tsx:73](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L73)

#### Inherited from

`EntityFormExtensions.errors`

***

### shouldReload?

> `optional` **shouldReload?**: `boolean`

Defined in: [listgrid/config/form/EntityFormBase.tsx:76](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L76)

#### Inherited from

`EntityFormExtensions.shouldReload`

***

### dataPreloaded?

> `optional` **dataPreloaded?**: `boolean`

Defined in: [listgrid/config/form/EntityFormBase.tsx:80](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L80)

#### Inherited from

`EntityFormExtensions.dataPreloaded`

***

### fetchedEntity?

> `optional` **fetchedEntity?**: `T`

Defined in: [listgrid/config/form/EntityFormBase.tsx:84](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L84)

#### Inherited from

`EntityFormExtensions.fetchedEntity`

***

### alertMessages

> **alertMessages**: [`AlertMessage`](../interfaces/AlertMessage.md)[] = `[]`

Defined in: [listgrid/config/form/EntityFormBase.tsx:87](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L87)

#### Inherited from

`EntityFormExtensions.alertMessages`

***

### fieldValidationStates

> **fieldValidationStates**: `Map`\<`string`, \{ `validated`: `boolean`; `message?`: `string`; `color?`: `string`; \}\>

Defined in: [listgrid/config/form/EntityFormBase.tsx:90](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L90)

#### Inherited from

`EntityFormExtensions.fieldValidationStates`

***

### appendAdvancedSearchFields?

> `optional` **appendAdvancedSearchFields?**: [`ListableFormField`](ListableFormField.md)\<`any`, `any`, `any`\>[]

Defined in: [listgrid/config/form/EntityFormBase.tsx:93](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L93)

#### Inherited from

`EntityFormExtensions.appendAdvancedSearchFields`

***

### clientExtensions

> **clientExtensions**: `Map`\<[`ExtensionPoint`](../enumerations/ExtensionPoint.md), [`ClientExtensionConfig`](../interfaces/ClientExtensionConfig.md)[]\>

Defined in: [listgrid/config/form/EntityFormBase.tsx:96](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L96)

#### Inherited from

`EntityFormExtensions.clientExtensions`

***

### excludeListFields?

> `optional` **excludeListFields?**: `string`[]

Defined in: [listgrid/config/form/EntityFormBase.tsx:99](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L99)

#### Inherited from

`EntityFormExtensions.excludeListFields`

***

### sessionRequired?

> `optional` **sessionRequired?**: `boolean`

Defined in: [listgrid/config/form/EntityFormBase.tsx:103](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L103)

#### Inherited from

`EntityFormExtensions.sessionRequired`

***

### cacheKeyFunc?

> `optional` **cacheKeyFunc?**: (`entityForm`) => `string`

Defined in: [listgrid/config/form/EntityFormBase.tsx:105](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L105)

#### Parameters

##### entityForm

`EntityForm`\<`T`\>

#### Returns

`string`

#### Inherited from

`EntityFormExtensions.cacheKeyFunc`

***

### onChanges?

> `optional` **onChanges?**: [`ModifyEntityFormFunc`](../type-aliases/ModifyEntityFormFunc.md)\<`T`\>[]

Defined in: [listgrid/config/form/EntityFormBase.tsx:109](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L109)

#### Inherited from

`EntityFormExtensions.onChanges`

***

### onFetchData?

> `optional` **onFetchData?**: [`ModifyFetchedEntityFormFunc`](../type-aliases/ModifyFetchedEntityFormFunc.md)\<`T`\>[]

Defined in: [listgrid/config/form/EntityFormBase.tsx:113](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L113)

#### Inherited from

`EntityFormExtensions.onFetchData`

***

### onInitialize?

> `optional` **onInitialize?**: [`OnInitializeFunc`](../type-aliases/OnInitializeFunc.md)\<`T`\>[]

Defined in: [listgrid/config/form/EntityFormBase.tsx:118](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L118)

#### Inherited from

`EntityFormExtensions.onInitialize`

***

### onFetchListData?

> `optional` **onFetchListData?**: [`PostFetchListData`](../type-aliases/PostFetchListData.md)[]

Defined in: [listgrid/config/form/EntityFormBase.tsx:120](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L120)

#### Inherited from

`EntityFormExtensions.onFetchListData`

***

### onSave?

> `optional` **onSave?**: (`entityForm`) => `Promise`\<[`EntityFormActionResult`](../interfaces/EntityFormActionResult.md)\>

Defined in: [listgrid/config/form/EntityFormBase.tsx:123](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L123)

#### Parameters

##### entityForm

`EntityForm`\<`T`\>

#### Returns

`Promise`\<[`EntityFormActionResult`](../interfaces/EntityFormActionResult.md)\>

#### Inherited from

`EntityFormExtensions.onSave`

***

### postSave?

> `optional` **postSave?**: (`result`) => `Promise`\<`void`\>

Defined in: [listgrid/config/form/EntityFormBase.tsx:128](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L128)

#### Parameters

##### result

[`EntityFormActionResult`](../interfaces/EntityFormActionResult.md)

#### Returns

`Promise`\<`void`\>

#### Inherited from

`EntityFormExtensions.postSave`

***

### postDelete?

> `optional` **postDelete?**: (`entityForm`, `idList?`) => `Promise`\<`void`\>

Defined in: [listgrid/config/form/EntityFormBase.tsx:132](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L132)

#### Parameters

##### entityForm

`EntityForm`\<`T`\>

##### idList?

`any`[]

#### Returns

`Promise`\<`void`\>

#### Inherited from

`EntityFormExtensions.postDelete`

***

### overrideSubmitData?

> `optional` **overrideSubmitData?**: (`entityForm`, `data`) => `Promise`\<\{ `data`: `any`; `modifiedFields?`: `string`[]; `removePrevious?`: `boolean`; `error?`: `boolean`; `errors?`: [`FieldError`](../interfaces/FieldError.md)[]; \}\>

Defined in: [listgrid/config/form/EntityFormBase.tsx:138](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L138)

#### Parameters

##### entityForm

`EntityForm`\<`T`\>

##### data

`any`

#### Returns

`Promise`\<\{ `data`: `any`; `modifiedFields?`: `string`[]; `removePrevious?`: `boolean`; `error?`: `boolean`; `errors?`: [`FieldError`](../interfaces/FieldError.md)[]; \}\>

#### Inherited from

`EntityFormExtensions.overrideSubmitData`

***

### overrideFetchData?

> `optional` **overrideFetchData?**: (`url`, `entityForm`) => `Promise`\<[`ResponseData`](ResponseData.md)\<`any`\>\>

Defined in: [listgrid/config/form/EntityFormBase.tsx:155](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L155)

Data 를 fetch 할 때 로직을 오버라이드 한다.
overrideFetchData 가 정의되어 있으면 메소드 fetchData 의 최상단에서 오버라이드 된다.

#### Parameters

##### url

`string`

##### entityForm

`EntityForm`\<`T`\>

#### Returns

`Promise`\<[`ResponseData`](ResponseData.md)\<`any`\>\>

#### Inherited from

`EntityFormExtensions.overrideFetchData`

***

### dataTransferConfig?

> `optional` **dataTransferConfig?**: [`DataTransferConfig`](DataTransferConfig.md)

Defined in: [listgrid/config/form/EntityFormBase.tsx:162](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L162)

data upload / download 설정

#### Inherited from

`EntityFormExtensions.dataTransferConfig`

***

### neverDelete?

> `optional` **neverDelete?**: `boolean`

Defined in: [listgrid/config/form/EntityFormBase.tsx:168](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L168)

삭제는 안 되고 active 값만 변경되는 경우
삭제 모달의 메시지가 변경된다.

#### Inherited from

`EntityFormExtensions.neverDelete`

***

### buttons?

> `optional` **buttons?**: (`entityForm`) => `Promise`\<[`EntityFormButtonType`](../type-aliases/EntityFormButtonType.md)[]\>[]

Defined in: [listgrid/config/form/EntityFormBase.tsx:174](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L174)

EntityForm 상태에 따른 동적 버튼 추가
EntityFormButton 또는 EntityFormReactNodeButton 타입을 반환

#### Parameters

##### entityForm

`EntityForm`\<`T`\>

#### Returns

`Promise`\<[`EntityFormButtonType`](../type-aliases/EntityFormButtonType.md)[]\>

#### Inherited from

`EntityFormExtensions.buttons`

***

### attributes?

> `optional` **attributes?**: `Map`\<`string`, `unknown`\>

Defined in: [listgrid/config/form/EntityFormBase.tsx:181](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L181)

ViewEntityForm 할 때 사용할 수 있다.
엔티티폼을 커스텀으로 표시하게 하는데 필요한 여러 정보를 자유롭게 사용할 수 있다.
이 정보는 저장 용도로는 사용되지 않는다.

#### Inherited from

`EntityFormExtensions.attributes`

***

### headerArea?

> `optional` **headerArea?**: (`entityForm`) => `Promise`\<`ReactNode`\>

Defined in: [listgrid/config/form/EntityFormBase.tsx:187](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L187)

ViewEntityForm에서 헤더 버튼과 Alert 영역 사이에 표시될 커스텀 영역
sticky 포지셔닝으로 스크롤 시 상단에 고정됨

#### Parameters

##### entityForm

`EntityForm`\<`T`\>

#### Returns

`Promise`\<`ReactNode`\>

#### Inherited from

`EntityFormExtensions.headerArea`

## Methods

### clone()

> **clone**(`includeValue?`): `EntityForm`\<`T`\>

Defined in: [listgrid/config/EntityForm.tsx:36](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityForm.tsx#L36)

#### Parameters

##### includeValue?

`boolean`

#### Returns

`EntityForm`\<`T`\>

#### Overrides

`EntityFormExtensions.clone`

***

### cloneWithEntityForm()

> **cloneWithEntityForm**(`entityForm`, `includeValue?`): `EntityForm`\<`T`\>

Defined in: [listgrid/config/EntityForm.tsx:41](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityForm.tsx#L41)

#### Parameters

##### entityForm

`EntityForm`\<`T`\>

##### includeValue?

`boolean`

#### Returns

`EntityForm`\<`T`\>

***

### executeOnChanges()

> **executeOnChanges**(`fieldName`): `Promise`\<`void`\>

Defined in: [listgrid/config/EntityForm.tsx:120](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityForm.tsx#L120)

#### Parameters

##### fieldName

`string`

#### Returns

`Promise`\<`void`\>

#### Overrides

`EntityFormExtensions.executeOnChanges`

***

### merge()

> **merge**(`origin`): `this`

Defined in: [listgrid/config/EntityForm.tsx:127](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityForm.tsx#L127)

#### Parameters

##### origin

`EntityForm`\<`T`\>

#### Returns

`this`

***

### setFetchedValue()

#### Call Signature

> **setFetchedValue**\<`K`\>(`fieldName`, `value`): `this`

Defined in: [listgrid/config/EntityForm.tsx:133](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityForm.tsx#L133)

##### Type Parameters

###### K

`K` *extends* `string`

##### Parameters

###### fieldName

`K`

###### value

`T`\[`K`\]

##### Returns

`this`

#### Call Signature

> **setFetchedValue**(`fieldName`, `value`): `this`

Defined in: [listgrid/config/EntityForm.tsx:134](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityForm.tsx#L134)

##### Parameters

###### fieldName

`string`

###### value

`any`

##### Returns

`this`

***

### withAppendAdvancedSearchFields()

> **withAppendAdvancedSearchFields**(...`fields`): `EntityForm`\<`T`\>

Defined in: [listgrid/config/EntityForm.tsx:152](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityForm.tsx#L152)

#### Parameters

##### fields

...[`ListableFormField`](ListableFormField.md)\<`any`, `any`, `any`\>[]

#### Returns

`EntityForm`\<`T`\>

***

### initialize()

> **initialize**(`props`): `Promise`\<[`EntityFormActionResult`](../interfaces/EntityFormActionResult.md)\>

Defined in: [listgrid/config/EntityForm.tsx:160](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityForm.tsx#L160)

ViewEntityForm 에서 최초 setEntityForm 을 할 때 initialize 를 호출해야 한다.

#### Parameters

##### props

###### session?

[`Session`](../interfaces/Session.md)

###### list?

`boolean`

#### Returns

`Promise`\<[`EntityFormActionResult`](../interfaces/EntityFormActionResult.md)\>

#### Overrides

`EntityFormExtensions.initialize`

***

### withHidden()

> **withHidden**(`props`, `hidden?`): `this`

Defined in: [listgrid/config/EntityForm.tsx:342](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityForm.tsx#L342)

필드, 필드그룹, 탭의 숨김 상태를 설정합니다.

이 메소드는 세 가지 타입의 숨김 처리를 통합하여 제공합니다:
- FIELD: 개별 필드나 컬렉션의 숨김 상태 설정
- GROUP: 특정 탭 내 필드그룹의 모든 필드를 일괄 숨김 처리
- TAB: 탭 전체와 그 하위 모든 필드를 일괄 숨김 처리

#### Parameters

##### props

`string` \| \{ `type`: `"FIELD"`; `hidden`: `boolean`; `fieldName`: `string`; \} \| \{ `type`: `"GROUP"`; `hidden`: `boolean`; `tabId`: `string`; `fieldGroupId`: `string`; \} \| \{ `type`: `"TAB"`; `hidden`: `boolean`; `tabId`: `string`; \}

숨김 설정 옵션 또는 필드명 (기존 호환성용)

`string`

***

###### Type Literal

\{ `type`: `"FIELD"`; `hidden`: `boolean`; `fieldName`: `string`; \}

숨김 설정 옵션 또는 필드명 (기존 호환성용)

###### type

`"FIELD"`

숨김 대상 타입 ('FIELD' | 'GROUP' | 'TAB')

###### hidden

`boolean`

숨김 여부 (true: 숨김, false: 표시)

###### fieldName

`string`

[FIELD 타입] 대상 필드 또는 컬렉션의 이름

***

###### Type Literal

\{ `type`: `"GROUP"`; `hidden`: `boolean`; `tabId`: `string`; `fieldGroupId`: `string`; \}

숨김 설정 옵션 또는 필드명 (기존 호환성용)

###### type

`"GROUP"`

숨김 대상 타입 ('FIELD' | 'GROUP' | 'TAB')

###### hidden

`boolean`

숨김 여부 (true: 숨김, false: 표시)

###### tabId

`string`

[GROUP/TAB 타입] 대상 탭 ID

###### fieldGroupId

`string`

[GROUP 타입] 대상 필드그룹 ID

***

###### Type Literal

\{ `type`: `"TAB"`; `hidden`: `boolean`; `tabId`: `string`; \}

숨김 설정 옵션 또는 필드명 (기존 호환성용)

###### type

`"TAB"`

숨김 대상 타입 ('FIELD' | 'GROUP' | 'TAB')

###### hidden

`boolean`

숨김 여부 (true: 숨김, false: 표시)

###### tabId

`string`

[GROUP/TAB 타입] 대상 탭 ID

##### hidden?

`boolean`

기존 API 호환성을 위한 숨김 여부 (props가 string일 때만 사용)

#### Returns

`this`

EntityForm 인스턴스 (메소드 체이닝 지원)

#### Examples

```ts
// 개별 필드 숨김
entityForm.withHidden({ type: 'FIELD', hidden: true, fieldName: 'email' });
```

```ts
// 필드그룹 전체 숨김
entityForm.withHidden({
  type: 'GROUP',
  hidden: true,
  tabId: 'education',
  fieldGroupId: 'university'
});
```

```ts
// 탭 전체 숨김
entityForm.withHidden({ type: 'TAB', hidden: true, tabId: 'advancedSettings' });
```

```ts
// 기존 API 호환성 (deprecated)
entityForm.withHidden('fieldName', true);
```

#### Since

1.0.0

***

### delete()

> **delete**(): `Promise`\<[`EntityFormActionResult`](../interfaces/EntityFormActionResult.md)\>

Defined in: [listgrid/config/EntityForm.tsx:426](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityForm.tsx#L426)

#### Returns

`Promise`\<[`EntityFormActionResult`](../interfaces/EntityFormActionResult.md)\>

***

### deleteAll()

> **deleteAll**(`idList`): `Promise`\<[`EntityFormActionResult`](../interfaces/EntityFormActionResult.md)\>

Defined in: [listgrid/config/EntityForm.tsx:440](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityForm.tsx#L440)

#### Parameters

##### idList

(`string` \| `number` \| `bigint` \| `null` \| `undefined`)[]

#### Returns

`Promise`\<[`EntityFormActionResult`](../interfaces/EntityFormActionResult.md)\>

***

### getFields()

> **getFields**(`type?`, `orderByView?`): [`EntityField`](../interfaces/EntityField.md)[]

Defined in: [listgrid/config/EntityForm.tsx:481](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityForm.tsx#L481)

#### Parameters

##### type?

[`FieldType`](../type-aliases/FieldType.md)

##### orderByView?

`boolean`

#### Returns

[`EntityField`](../interfaces/EntityField.md)[]

***

### withOverrideSubmitData()

> **withOverrideSubmitData**(`fn`): `this`

Defined in: [listgrid/config/EntityForm.tsx:504](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityForm.tsx#L504)

#### Parameters

##### fn

(`entityForm`, `data`) => `Promise`\<\{ `data`: `any`; `modifiedFields?`: `string`[]; `removePrevious?`: `boolean`; `error?`: `boolean`; `errors?`: [`FieldError`](../interfaces/FieldError.md)[]; \}\>

#### Returns

`this`

***

### setFetchedValues()

> **setFetchedValues**(`entity`): `Promise`\<`EntityForm`\<`T`\>\>

Defined in: [listgrid/config/EntityForm.tsx:520](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityForm.tsx#L520)

#### Parameters

##### entity

`any`

#### Returns

`Promise`\<`EntityForm`\<`T`\>\>

***

### fetchData()

> **fetchData**(`fetchUrl?`): `Promise`\<[`ResponseData`](ResponseData.md)\<`any`\>\>

Defined in: [listgrid/config/EntityForm.tsx:584](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityForm.tsx#L584)

#### Parameters

##### fetchUrl?

`string` = `...`

#### Returns

`Promise`\<[`ResponseData`](ResponseData.md)\<`any`\>\>

***

### internalSave()

> **internalSave**(`session?`, `skipValidation?`, `forceIncludeExceptOnSave?`): `Promise`\<[`EntityFormActionResult`](../interfaces/EntityFormActionResult.md)\>

Defined in: [listgrid/config/EntityForm.tsx:615](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityForm.tsx#L615)

#### Parameters

##### session?

[`Session`](../interfaces/Session.md)

##### skipValidation?

`boolean`

##### forceIncludeExceptOnSave?

`boolean`

#### Returns

`Promise`\<[`EntityFormActionResult`](../interfaces/EntityFormActionResult.md)\>

***

### save()

> **save**(`session?`, `skipValidation?`, `forceIncludeExceptOnSave?`): `Promise`\<[`EntityFormActionResult`](../interfaces/EntityFormActionResult.md)\>

Defined in: [listgrid/config/EntityForm.tsx:816](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityForm.tsx#L816)

#### Parameters

##### session?

[`Session`](../interfaces/Session.md)

##### skipValidation?

`boolean`

##### forceIncludeExceptOnSave?

`boolean`

#### Returns

`Promise`\<[`EntityFormActionResult`](../interfaces/EntityFormActionResult.md)\>

***

### getSubmitFormData()

> **getSubmitFormData**(`forceIncludeExceptOnSave?`): `Promise`\<[`SubmitFormData`](../interfaces/SubmitFormData.md)\>

Defined in: [listgrid/config/EntityForm.tsx:842](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityForm.tsx#L842)

#### Parameters

##### forceIncludeExceptOnSave?

`boolean`

#### Returns

`Promise`\<[`SubmitFormData`](../interfaces/SubmitFormData.md)\>

***

### validate()

> **validate**(`props?`): `Promise`\<[`FieldError`](../interfaces/FieldError.md)[]\>

Defined in: [listgrid/config/EntityForm.tsx:982](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityForm.tsx#L982)

#### Parameters

##### props?

###### fieldNames?

`string`[]

###### session?

[`Session`](../interfaces/Session.md)

#### Returns

`Promise`\<[`FieldError`](../interfaces/FieldError.md)[]\>

***

### withCheckDuplicate()

> **withCheckDuplicate**(`fieldName`, `checkDuplicate`): `this`

Defined in: [listgrid/config/EntityForm.tsx:1027](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityForm.tsx#L1027)

#### Parameters

##### fieldName

`string`

##### checkDuplicate

(`entityForm`, `value`) => `Promise`\<[`ValidateResult`](ValidateResult.md)\>

#### Returns

`this`

***

### withFieldToLayout()

> **withFieldToLayout**(`layout`): `EntityForm`\<`T`\>

Defined in: [listgrid/config/EntityForm.tsx:1040](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityForm.tsx#L1040)

#### Parameters

##### layout

`"full"` \| `"half"`

#### Returns

`EntityForm`\<`T`\>

***

### getListableFieldOrder()

> **getListableFieldOrder**(`field`): `number`

Defined in: [listgrid/config/form/EntityFormActions.tsx:39](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormActions.tsx#L39)

#### Parameters

##### field

[`ListableFormField`](ListableFormField.md)\<`any`\>

#### Returns

`number`

#### Inherited from

`EntityFormExtensions.getListableFieldOrder`

***

### clearAlertMessages()

> **clearAlertMessages**(`includePersistent?`): `this`

Defined in: [listgrid/config/form/EntityFormActions.tsx:63](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormActions.tsx#L63)

Alert 메시지를 제거합니다.

#### Parameters

##### includePersistent?

`boolean` = `false`

persistent 메시지도 제거할지 여부 (true면 persistent 메시지도 제거)

#### Returns

`this`

EntityForm 인스턴스

#### Inherited from

`EntityFormExtensions.clearAlertMessages`

***

### withAlertMessages()

> **withAlertMessages**(`messages`): `this`

Defined in: [listgrid/config/form/EntityFormActions.tsx:79](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormActions.tsx#L79)

Alert 메시지를 추가합니다.

#### Parameters

##### messages

[`AlertMessage`](../interfaces/AlertMessage.md)[]

추가할 Alert 메시지 배열

#### Returns

`this`

EntityForm 인스턴스

#### Inherited from

`EntityFormExtensions.withAlertMessages`

***

### removeAlertMessage()

> **removeAlertMessage**(`key`): `this`

Defined in: [listgrid/config/form/EntityFormActions.tsx:94](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormActions.tsx#L94)

특정 키의 Alert 메시지를 제거합니다.

#### Parameters

##### key

`string`

제거할 메시지의 키

#### Returns

`this`

EntityForm 인스턴스

#### Inherited from

`EntityFormExtensions.removeAlertMessage`

***

### withExcludeListFields()

> **withExcludeListFields**(...`excludeListFields`): `this`

Defined in: [listgrid/config/form/EntityFormActions.tsx:99](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormActions.tsx#L99)

#### Parameters

##### excludeListFields

...`string`[]

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withExcludeListFields`

***

### getAlertMessages()

> **getAlertMessages**(): [`AlertMessage`](../interfaces/AlertMessage.md)[]

Defined in: [listgrid/config/form/EntityFormActions.tsx:112](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormActions.tsx#L112)

현재 Alert 메시지들을 반환합니다.

#### Returns

[`AlertMessage`](../interfaces/AlertMessage.md)[]

Alert 메시지 배열

#### Inherited from

`EntityFormExtensions.getAlertMessages`

***

### clearAllMessages()

> **clearAllMessages**(`includePersistent?`): `this`

Defined in: [listgrid/config/form/EntityFormActions.tsx:121](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormActions.tsx#L121)

모든 메시지를 제거합니다. (현재는 Alert 메시지만 지원)

#### Parameters

##### includePersistent?

`boolean` = `false`

persistent 메시지도 제거할지 여부 (true면 persistent 메시지도 제거)

#### Returns

`this`

EntityForm 인스턴스

#### Inherited from

`EntityFormExtensions.clearAllMessages`

***

### withListConfig()

> **withListConfig**(`fieldName`, `config`): `this`

Defined in: [listgrid/config/form/EntityFormActions.tsx:130](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormActions.tsx#L130)

#### Parameters

##### fieldName

`string`

##### config

[`IListConfig`](../interfaces/IListConfig.md)

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withListConfig`

***

### withCreatedAtField()

> **withCreatedAtField**(): `this`

Defined in: [listgrid/config/form/EntityFormActions.tsx:138](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormActions.tsx#L138)

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withCreatedAtField`

***

### withCreatedAndUpdatedAtFields()

> **withCreatedAndUpdatedAtFields**(): `this`

Defined in: [listgrid/config/form/EntityFormActions.tsx:142](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormActions.tsx#L142)

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withCreatedAndUpdatedAtFields`

***

### addFields()

> **addFields**(`props`): `this`

Defined in: [listgrid/config/form/EntityFormActions.tsx:146](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormActions.tsx#L146)

#### Parameters

##### props

[`AddFieldItemProps`](../interfaces/AddFieldItemProps.md)

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.addFields`

***

### removeField()

> **removeField**(`fieldName`): `void`

Defined in: [listgrid/config/form/EntityFormActions.tsx:190](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormActions.tsx#L190)

#### Parameters

##### fieldName

`string`

#### Returns

`void`

#### Inherited from

`EntityFormExtensions.removeField`

***

### addCollections()

> **addCollections**(`props`): `this`

Defined in: [listgrid/config/form/EntityFormActions.tsx:198](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormActions.tsx#L198)

Field 와 Collection 모두 EntityItem 을 인수로 받기 때문에 둘 간의 차이는 없다.

#### Parameters

##### props

[`AddFieldItemProps`](../interfaces/AddFieldItemProps.md)

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.addCollections`

***

### useListFields()

> **useListFields**(...`fieldNames`): `this`

Defined in: [listgrid/config/form/EntityFormActions.tsx:202](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormActions.tsx#L202)

#### Parameters

##### fieldNames

...`string`[]

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.useListFields`

***

### getListFields()

> **getListFields**(): [`ListableFormField`](ListableFormField.md)\<`any`, `any`, `any`\>[]

Defined in: [listgrid/config/form/EntityFormActions.tsx:220](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormActions.tsx#L220)

ListGrid 를 그릴 때 getListField() 를 호출하면 자동으로 리스트 필드를 만든다.

#### Returns

[`ListableFormField`](ListableFormField.md)\<`any`, `any`, `any`\>[]

#### Inherited from

`EntityFormExtensions.getListFields`

***

### getFilterableFields()

> **getFilterableFields**(): [`ListableFormField`](ListableFormField.md)\<`any`, `any`, `any`\>[]

Defined in: [listgrid/config/form/EntityFormActions.tsx:257](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormActions.tsx#L257)

#### Returns

[`ListableFormField`](ListableFormField.md)\<`any`, `any`, `any`\>[]

#### Inherited from

`EntityFormExtensions.getFilterableFields`

***

### getViewOrder()

> **getViewOrder**(`tabId`, `fieldGroupId`, `fieldOrder`): `number`

Defined in: [listgrid/config/form/EntityFormActions.tsx:359](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormActions.tsx#L359)

#### Parameters

##### tabId

`string`

##### fieldGroupId

`string`

##### fieldOrder

`number`

#### Returns

`number`

#### Inherited from

`EntityFormExtensions.getViewOrder`

***

### withDataTransferConfig()

> **withDataTransferConfig**(`props`): `this`

Defined in: [listgrid/config/form/EntityFormActions.tsx:373](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormActions.tsx#L373)

#### Parameters

##### props

[`DataTransferConfigProps`](../interfaces/DataTransferConfigProps.md)

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withDataTransferConfig`

***

### getExportableFields()

> **getExportableFields**(): `Promise`\<[`DataField`](DataField.md)[] \| `undefined`\>

Defined in: [listgrid/config/form/EntityFormActions.tsx:429](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormActions.tsx#L429)

#### Returns

`Promise`\<[`DataField`](DataField.md)[] \| `undefined`\>

#### Inherited from

`EntityFormExtensions.getExportableFields`

***

### getImportableFields()

> **getImportableFields**(): `Promise`\<[`DataField`](DataField.md)[] \| `undefined`\>

Defined in: [listgrid/config/form/EntityFormActions.tsx:444](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormActions.tsx#L444)

#### Returns

`Promise`\<[`DataField`](DataField.md)[] \| `undefined`\>

#### Inherited from

`EntityFormExtensions.getImportableFields`

***

### getDataTransferConfig()

> **getDataTransferConfig**(): `Promise`\<[`DataTransferConfig`](DataTransferConfig.md) \| `undefined`\>

Defined in: [listgrid/config/form/EntityFormActions.tsx:490](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormActions.tsx#L490)

#### Returns

`Promise`\<[`DataTransferConfig`](DataTransferConfig.md) \| `undefined`\>

#### Inherited from

`EntityFormExtensions.getDataTransferConfig`

***

### withFilterable()

> **withFilterable**(`fieldName`, `filterable?`): `this`

Defined in: [listgrid/config/form/EntityFormActions.tsx:502](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormActions.tsx#L502)

#### Parameters

##### fieldName

`string`

##### filterable?

`boolean` = `true`

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withFilterable`

***

### withNeverDelete()

> **withNeverDelete**(`neverDelete?`): `this`

Defined in: [listgrid/config/form/EntityFormActions.tsx:510](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormActions.tsx#L510)

#### Parameters

##### neverDelete?

`boolean` = `true`

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withNeverDelete`

***

### withStatusCreatedAndUpdatedAtField()

> **withStatusCreatedAndUpdatedAtField**(): `this`

Defined in: [listgrid/config/form/EntityFormActions.tsx:535](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormActions.tsx#L535)

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withStatusCreatedAndUpdatedAtField`

***

### withStatusCreatedAtField()

> **withStatusCreatedAtField**(): `this`

Defined in: [listgrid/config/form/EntityFormActions.tsx:540](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormActions.tsx#L540)

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withStatusCreatedAtField`

***

### getCreateStep()

> **getCreateStep**(): [`CreateStep`](../interfaces/CreateStep.md)[] \| `undefined`

Defined in: [listgrid/config/form/EntityFormActions.tsx:545](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormActions.tsx#L545)

#### Returns

[`CreateStep`](../interfaces/CreateStep.md)[] \| `undefined`

#### Inherited from

`EntityFormExtensions.getCreateStep`

***

### setCreateStep()

> **setCreateStep**(`createStep?`): `void`

Defined in: [listgrid/config/form/EntityFormActions.tsx:559](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormActions.tsx#L559)

#### Parameters

##### createStep?

[`CreateStep`](../interfaces/CreateStep.md)[]

#### Returns

`void`

#### Inherited from

`EntityFormExtensions.setCreateStep`

***

### withCreateStep()

> **withCreateStep**(`createStep?`): `this`

Defined in: [listgrid/config/form/EntityFormActions.tsx:566](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormActions.tsx#L566)

#### Parameters

##### createStep?

[`CreateStep`](../interfaces/CreateStep.md)[]

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withCreateStep`

***

### reload()

> **reload**(): `Promise`\<`void`\>

Defined in: [listgrid/config/form/EntityFormBase.tsx:189](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L189)

#### Returns

`Promise`\<`void`\>

#### Inherited from

`EntityFormExtensions.reload`

***

### withMenuUrl()

> **withMenuUrl**(`menuUrl?`): `this`

Defined in: [listgrid/config/form/EntityFormBase.tsx:200](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L200)

#### Parameters

##### menuUrl?

`string`

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withMenuUrl`

***

### withUrl()

> **withUrl**(`url`): `this`

Defined in: [listgrid/config/form/EntityFormBase.tsx:205](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L205)

#### Parameters

##### url

`string`

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withUrl`

***

### withTitle()

> **withTitle**(`title?`): `this`

Defined in: [listgrid/config/form/EntityFormBase.tsx:210](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L210)

#### Parameters

##### title?

`string` \| \{ `title?`: `string`; `field?`: `string`; `view?`: (`entityForm`) => `Promise`\<`ReactNode`\>; \}

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withTitle`

***

### withParentId()

> **withParentId**(`parentId?`): `this`

Defined in: [listgrid/config/form/EntityFormBase.tsx:229](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L229)

#### Parameters

##### parentId?

`string`

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withParentId`

***

### withId()

> **withId**(`id?`): `this`

Defined in: [listgrid/config/form/EntityFormBase.tsx:234](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L234)

#### Parameters

##### id?

`string`

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withId`

***

### getId()

> **getId**(): `string` \| `undefined`

Defined in: [listgrid/config/form/EntityFormBase.tsx:239](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L239)

#### Returns

`string` \| `undefined`

#### Inherited from

`EntityFormExtensions.getId`

***

### getRenderType()

> **getRenderType**(): [`RenderType`](../type-aliases/RenderType.md)

Defined in: [listgrid/config/form/EntityFormBase.tsx:243](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L243)

#### Returns

[`RenderType`](../type-aliases/RenderType.md)

#### Inherited from

`EntityFormExtensions.getRenderType`

***

### isAbleFetch()

> **isAbleFetch**(): `boolean`

Defined in: [listgrid/config/form/EntityFormBase.tsx:250](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L250)

ID 와 URL 이 모두 존재해야만 FETCH 가 가능하다.

#### Returns

`boolean`

#### Inherited from

`EntityFormExtensions.isAbleFetch`

***

### getUrl()

> **getUrl**(): `string`

Defined in: [listgrid/config/form/EntityFormBase.tsx:254](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L254)

#### Returns

`string`

#### Inherited from

`EntityFormExtensions.getUrl`

***

### getFetchUrl()

> **getFetchUrl**(): `string`

Defined in: [listgrid/config/form/EntityFormBase.tsx:263](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L263)

#### Returns

`string`

#### Inherited from

`EntityFormExtensions.getFetchUrl`

***

### isSessionRequired()

> **isSessionRequired**(): `boolean`

Defined in: [listgrid/config/form/EntityFormBase.tsx:270](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L270)

#### Returns

`boolean`

#### Inherited from

`EntityFormExtensions.isSessionRequired`

***

### withPostSave()

> **withPostSave**(`postSave`): `this`

Defined in: [listgrid/config/form/EntityFormBase.tsx:274](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L274)

#### Parameters

##### postSave

(`result`) => `Promise`\<`void`\>

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withPostSave`

***

### withPostDelete()

> **withPostDelete**(`postDelete`): `this`

Defined in: [listgrid/config/form/EntityFormBase.tsx:279](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L279)

#### Parameters

##### postDelete

(`entityForm`, `idList?`) => `Promise`\<`void`\>

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withPostDelete`

***

### getTitle()

> **getTitle**(`append?`, `appendPostfix?`): `Promise`\<`string`\>

Defined in: [listgrid/config/form/EntityFormBase.tsx:284](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L284)

#### Parameters

##### append?

`string`

##### appendPostfix?

`boolean`

#### Returns

`Promise`\<`string`\>

#### Inherited from

`EntityFormExtensions.getTitle`

***

### hasField()

> **hasField**(`name`): `boolean`

Defined in: [listgrid/config/form/EntityFormBase.tsx:308](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L308)

#### Parameters

##### name

`string`

#### Returns

`boolean`

#### Inherited from

`EntityFormExtensions.hasField`

***

### getField()

#### Call Signature

> **getField**\<`K`\>(`name`): [`EntityField`](../interfaces/EntityField.md) \| `undefined`

Defined in: [listgrid/config/form/EntityFormBase.tsx:312](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L312)

##### Type Parameters

###### K

`K` *extends* `string`

##### Parameters

###### name

`K`

##### Returns

[`EntityField`](../interfaces/EntityField.md) \| `undefined`

##### Inherited from

`EntityFormExtensions.getField`

#### Call Signature

> **getField**(`name`): [`EntityField`](../interfaces/EntityField.md) \| `undefined`

Defined in: [listgrid/config/form/EntityFormBase.tsx:313](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L313)

##### Parameters

###### name

`string`

##### Returns

[`EntityField`](../interfaces/EntityField.md) \| `undefined`

##### Inherited from

`EntityFormExtensions.getField`

***

### getCollection()

> **getCollection**(`name`): [`SubCollectionField`](SubCollectionField.md) \| `undefined`

Defined in: [listgrid/config/form/EntityFormBase.tsx:318](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L318)

#### Parameters

##### name

`string`

#### Returns

[`SubCollectionField`](SubCollectionField.md) \| `undefined`

#### Inherited from

`EntityFormExtensions.getCollection`

***

### getValue()

#### Call Signature

> **getValue**\<`K`\>(`name`): `Promise`\<`T`\[`K`\]\>

Defined in: [listgrid/config/form/EntityFormBase.tsx:322](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L322)

##### Type Parameters

###### K

`K` *extends* `string`

##### Parameters

###### name

`K`

##### Returns

`Promise`\<`T`\[`K`\]\>

##### Inherited from

`EntityFormExtensions.getValue`

#### Call Signature

> **getValue**(`name`): `Promise`\<`any`\>

Defined in: [listgrid/config/form/EntityFormBase.tsx:323](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L323)

##### Parameters

###### name

`string`

##### Returns

`Promise`\<`any`\>

##### Inherited from

`EntityFormExtensions.getValue`

***

### getFetchedEntity()

> **getFetchedEntity**(): `T` \| `undefined`

Defined in: [listgrid/config/form/EntityFormBase.tsx:328](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L328)

#### Returns

`T` \| `undefined`

#### Inherited from

`EntityFormExtensions.getFetchedEntity`

***

### getValues()

> **getValues**(): `Promise`\<`Partial`\<`T`\> & `Record`\<`string`, `any`\>\>

Defined in: [listgrid/config/form/EntityFormBase.tsx:333](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L333)

#### Returns

`Promise`\<`Partial`\<`T`\> & `Record`\<`string`, `any`\>\>

#### Inherited from

`EntityFormExtensions.getValues`

***

### hasTab()

> **hasTab**(`id`): `boolean`

Defined in: [listgrid/config/form/EntityFormBase.tsx:341](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L341)

#### Parameters

##### id

`string`

#### Returns

`boolean`

#### Inherited from

`EntityFormExtensions.hasTab`

***

### getTab()

> **getTab**(`tabId`): [`EntityTab`](EntityTab.md) \| `undefined`

Defined in: [listgrid/config/form/EntityFormBase.tsx:345](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L345)

#### Parameters

##### tabId

`string`

#### Returns

[`EntityTab`](EntityTab.md) \| `undefined`

#### Inherited from

`EntityFormExtensions.getTab`

***

### getViewableTabs()

> **getViewableTabs**(`includeHide?`, `createStepFields?`, `session?`): `Promise`\<[`EntityTab`](EntityTab.md)[]\>

Defined in: [listgrid/config/form/EntityFormBase.tsx:349](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L349)

#### Parameters

##### includeHide?

`boolean`

##### createStepFields?

`string`[]

##### session?

[`Session`](../interfaces/Session.md)

#### Returns

`Promise`\<[`EntityTab`](EntityTab.md)[]\>

#### Inherited from

`EntityFormExtensions.getViewableTabs`

***

### getTabs()

> **getTabs**(): [`EntityTab`](EntityTab.md)[]

Defined in: [listgrid/config/form/EntityFormBase.tsx:392](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L392)

모든 탭 목록을 반환합니다 (순서대로 정렬됨)

#### Returns

[`EntityTab`](EntityTab.md)[]

#### Inherited from

`EntityFormExtensions.getTabs`

***

### removeTabs()

> **removeTabs**(`tabsToRemove`): `this`

Defined in: [listgrid/config/form/EntityFormBase.tsx:402](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L402)

지정한 탭들을 제거합니다

#### Parameters

##### tabsToRemove

(`string` \| [`EntityTab`](EntityTab.md))[]

제거할 탭 배열 또는 탭 ID 배열

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.removeTabs`

***

### removeTab()

> **removeTab**(`tab`): `this`

Defined in: [listgrid/config/form/EntityFormBase.tsx:414](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L414)

지정한 탭을 제거합니다

#### Parameters

##### tab

`string` \| [`EntityTab`](EntityTab.md)

제거할 탭 또는 탭 ID

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.removeTab`

***

### getFieldGroup()

> **getFieldGroup**(`tabId`, `fieldGroupId`): [`EntityFieldGroup`](EntityFieldGroup.md) \| `undefined`

Defined in: [listgrid/config/form/EntityFormBase.tsx:420](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L420)

#### Parameters

##### tabId

`string`

##### fieldGroupId

`string`

#### Returns

[`EntityFieldGroup`](EntityFieldGroup.md) \| `undefined`

#### Inherited from

`EntityFormExtensions.getFieldGroup`

***

### getViewableFieldGroups()

> **getViewableFieldGroups**(`props`): `Promise`\<`string`[]\>

Defined in: [listgrid/config/form/EntityFormBase.tsx:428](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L428)

#### Parameters

##### props

###### tabId

`string`

###### session?

[`Session`](../interfaces/Session.md)

###### createStepFields?

`string`[]

#### Returns

`Promise`\<`string`[]\>

#### Inherited from

`EntityFormExtensions.getViewableFieldGroups`

***

### isViewableFieldGroup()

> **isViewableFieldGroup**(`props`): `Promise`\<`boolean`\>

Defined in: [listgrid/config/form/EntityFormBase.tsx:460](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L460)

#### Parameters

##### props

###### tabId

`string`

###### fieldGroupId

`string`

###### session?

[`Session`](../interfaces/Session.md)

###### createStepFields?

`string`[]

#### Returns

`Promise`\<`boolean`\>

#### Inherited from

`EntityFormExtensions.isViewableFieldGroup`

***

### getVisibleFields()

> **getVisibleFields**(`tabId`, `fieldGroupId`, `session?`, `createStepFields?`): `Promise`\<\{ `fieldGroup?`: [`EntityFieldGroup`](EntityFieldGroup.md); `fields?`: [`EntityField`](../interfaces/EntityField.md)[]; \}\>

Defined in: [listgrid/config/form/EntityFormBase.tsx:537](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L537)

#### Parameters

##### tabId

`string`

##### fieldGroupId

`string`

##### session?

[`Session`](../interfaces/Session.md)

##### createStepFields?

`string`[]

#### Returns

`Promise`\<\{ `fieldGroup?`: [`EntityFieldGroup`](EntityFieldGroup.md); `fields?`: [`EntityField`](../interfaces/EntityField.md)[]; \}\>

#### Inherited from

`EntityFormExtensions.getVisibleFields`

***

### getVisibleCollections()

> **getVisibleCollections**(`tabId`, `fieldGroupId`, `session?`): `Promise`\<\{ `fieldGroup?`: [`EntityFieldGroup`](EntityFieldGroup.md); `collections?`: [`SubCollectionField`](SubCollectionField.md)[]; \}\>

Defined in: [listgrid/config/form/EntityFormBase.tsx:588](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L588)

#### Parameters

##### tabId

`string`

##### fieldGroupId

`string`

##### session?

[`Session`](../interfaces/Session.md)

#### Returns

`Promise`\<\{ `fieldGroup?`: [`EntityFieldGroup`](EntityFieldGroup.md); `collections?`: [`SubCollectionField`](SubCollectionField.md)[]; \}\>

#### Inherited from

`EntityFormExtensions.getVisibleCollections`

***

### getSession()

> **getSession**(): [`Session`](../interfaces/Session.md) \| `undefined`

Defined in: [listgrid/config/form/EntityFormBase.tsx:627](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L627)

#### Returns

[`Session`](../interfaces/Session.md) \| `undefined`

#### Inherited from

`EntityFormExtensions.getSession`

***

### withSession()

> **withSession**(`session`): `this`

Defined in: [listgrid/config/form/EntityFormBase.tsx:631](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L631)

#### Parameters

##### session

[`Session`](../interfaces/Session.md)

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withSession`

***

### withShouldReload()

> **withShouldReload**(`shouldReload?`): `this`

Defined in: [listgrid/config/form/EntityFormBase.tsx:636](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L636)

#### Parameters

##### shouldReload?

`boolean`

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withShouldReload`

***

### withFieldGroupConfig()

> **withFieldGroupConfig**(`tabId`, `fieldGroupId`, `config`): `this`

Defined in: [listgrid/config/form/EntityFormBase.tsx:641](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L641)

#### Parameters

##### tabId

`string`

##### fieldGroupId

`string`

##### config

[`FieldGroupConfig`](../type-aliases/FieldGroupConfig.md)

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withFieldGroupConfig`

***

### getLabel()

> **getLabel**(`name`): `ReactNode`

Defined in: [listgrid/config/form/EntityFormBase.tsx:652](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L652)

#### Parameters

##### name

`string`

#### Returns

`ReactNode`

#### Inherited from

`EntityFormExtensions.getLabel`

***

### getHelpText()

> **getHelpText**(`name`, `session?`): `Promise`\<`ReactNode`\>

Defined in: [listgrid/config/form/EntityFormBase.tsx:662](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L662)

#### Parameters

##### name

`string`

##### session?

[`Session`](../interfaces/Session.md)

#### Returns

`Promise`\<`ReactNode`\>

#### Inherited from

`EntityFormExtensions.getHelpText`

***

### withHelpText()

> **withHelpText**(`name`, `helpText`): `this`

Defined in: [listgrid/config/form/EntityFormBase.tsx:672](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L672)

#### Parameters

##### name

`string`

##### helpText

[`ConditionalReactNodeValue`](../type-aliases/ConditionalReactNodeValue.md)

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withHelpText`

***

### withTooltip()

> **withTooltip**(`name`, `tooltip`): `this`

Defined in: [listgrid/config/form/EntityFormBase.tsx:680](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L680)

#### Parameters

##### name

`string`

##### tooltip

[`ConditionalReactNodeValue`](../type-aliases/ConditionalReactNodeValue.md)

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withTooltip`

***

### withReadonly()

> **withReadonly**(`name`, `readonly`): `this`

Defined in: [listgrid/config/form/EntityFormBase.tsx:688](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L688)

#### Parameters

##### name

`string`

##### readonly

`boolean`

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withReadonly`

***

### withOptions()

> **withOptions**(`name`, `options`): `this`

Defined in: [listgrid/config/form/EntityFormBase.tsx:696](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L696)

#### Parameters

##### name

`string`

##### options

[`SelectOption`](../interfaces/SelectOption.md)[]

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withOptions`

***

### getTabFields()

> **getTabFields**(`tabId`): [`EntityField`](../interfaces/EntityField.md)[]

Defined in: [listgrid/config/form/EntityFormBase.tsx:711](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L711)

특정 tab 의 하위의 모든 fields 를 하나의 [] 로 리턴, 필드그룹의 표시 순서를 고려해 field 의 order 를 변경하며 clone 을 통해 원래 필드에 영향을 주지 않는다.

#### Parameters

##### tabId

`string`

#### Returns

[`EntityField`](../interfaces/EntityField.md)[]

#### Inherited from

`EntityFormExtensions.getTabFields`

***

### withRevisionEntityName()

> **withRevisionEntityName**(`revisionEntityName`): `this`

Defined in: [listgrid/config/form/EntityFormBase.tsx:738](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L738)

#### Parameters

##### revisionEntityName

`string`

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withRevisionEntityName`

***

### getRevisionEntityName()

> **getRevisionEntityName**(): `string`

Defined in: [listgrid/config/form/EntityFormBase.tsx:743](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L743)

#### Returns

`string`

#### Inherited from

`EntityFormExtensions.getRevisionEntityName`

***

### withButtons()

> **withButtons**(`buttons`): `this`

Defined in: [listgrid/config/form/EntityFormBase.tsx:748](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L748)

#### Parameters

##### buttons

(`entityForm`) => `Promise`\<[`EntityFormButtonType`](../type-aliases/EntityFormButtonType.md)[]\>

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withButtons`

***

### withOnChanges()

> **withOnChanges**(...`onChanges`): `this`

Defined in: [listgrid/config/form/EntityFormBase.tsx:753](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L753)

#### Parameters

##### onChanges

...[`ModifyEntityFormFunc`](../type-aliases/ModifyEntityFormFunc.md)\<`T`\>[]

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withOnChanges`

***

### withOnFetchData()

> **withOnFetchData**(...`onLoad`): `this`

Defined in: [listgrid/config/form/EntityFormBase.tsx:758](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L758)

#### Parameters

##### onLoad

...[`ModifyFetchedEntityFormFunc`](../type-aliases/ModifyFetchedEntityFormFunc.md)\<`T`\>[]

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withOnFetchData`

***

### withOnInitialize()

> **withOnInitialize**(...`onInitialize`): `this`

Defined in: [listgrid/config/form/EntityFormBase.tsx:763](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L763)

#### Parameters

##### onInitialize

...[`OnInitializeFunc`](../type-aliases/OnInitializeFunc.md)\<`T`\>[]

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withOnInitialize`

***

### withOnPostFetchListData()

> **withOnPostFetchListData**(...`postFetchListData`): `this`

Defined in: [listgrid/config/form/EntityFormBase.tsx:768](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L768)

#### Parameters

##### postFetchListData

...[`PostFetchListData`](../type-aliases/PostFetchListData.md)[]

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withOnPostFetchListData`

***

### withOnSave()

> **withOnSave**(`onSave?`): `this`

Defined in: [listgrid/config/form/EntityFormBase.tsx:773](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L773)

#### Parameters

##### onSave?

(`entityForm`) => `Promise`\<[`EntityFormActionResult`](../interfaces/EntityFormActionResult.md)\>

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withOnSave`

***

### withAttributes()

> **withAttributes**(`attributes?`): `this`

Defined in: [listgrid/config/form/EntityFormBase.tsx:778](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L778)

#### Parameters

##### attributes?

`Map`\<`string`, `unknown`\>

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withAttributes`

***

### withHeaderArea()

> **withHeaderArea**(`headerArea`): `this`

Defined in: [listgrid/config/form/EntityFormBase.tsx:783](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L783)

#### Parameters

##### headerArea

(`entityForm`) => `Promise`\<`ReactNode`\>

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withHeaderArea`

***

### getAttributes()

> **getAttributes**(): `Map`\<`string`, `unknown`\>

Defined in: [listgrid/config/form/EntityFormBase.tsx:788](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L788)

#### Returns

`Map`\<`string`, `unknown`\>

#### Inherited from

`EntityFormExtensions.getAttributes`

***

### putAttribute()

> **putAttribute**(`key`, `value`): `this`

Defined in: [listgrid/config/form/EntityFormBase.tsx:793](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L793)

#### Parameters

##### key

`string`

##### value

`unknown`

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.putAttribute`

***

### removeAttribute()

> **removeAttribute**(`key`): `this`

Defined in: [listgrid/config/form/EntityFormBase.tsx:801](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L801)

#### Parameters

##### key

`string`

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.removeAttribute`

***

### hasAttribute()

> **hasAttribute**(`key`): `boolean`

Defined in: [listgrid/config/form/EntityFormBase.tsx:808](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L808)

#### Parameters

##### key

`string`

#### Returns

`boolean`

#### Inherited from

`EntityFormExtensions.hasAttribute`

***

### addAttributeToField()

> **addAttributeToField**(`fieldName`, `key`, `value`): `void`

Defined in: [listgrid/config/form/EntityFormBase.tsx:812](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L812)

#### Parameters

##### fieldName

`string`

##### key

`string`

##### value

`unknown`

#### Returns

`void`

#### Inherited from

`EntityFormExtensions.addAttributeToField`

***

### removeAttributeToField()

> **removeAttributeToField**(`fieldName`, `key`): `void`

Defined in: [listgrid/config/form/EntityFormBase.tsx:822](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L822)

#### Parameters

##### fieldName

`string`

##### key

`string`

#### Returns

`void`

#### Inherited from

`EntityFormExtensions.removeAttributeToField`

***

### getFieldAttributes()

> **getFieldAttributes**(`fieldName`): `Map`\<`string`, `unknown`\> \| `undefined`

Defined in: [listgrid/config/form/EntityFormBase.tsx:832](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L832)

#### Parameters

##### fieldName

`string`

#### Returns

`Map`\<`string`, `unknown`\> \| `undefined`

#### Inherited from

`EntityFormExtensions.getFieldAttributes`

***

### setReadOnly()

> **setReadOnly**(`readonly?`): `void`

Defined in: [listgrid/config/form/EntityFormBase.tsx:837](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L837)

#### Parameters

##### readonly?

`boolean` = `true`

#### Returns

`void`

#### Inherited from

`EntityFormExtensions.setReadOnly`

***

### setRevisionEntityNameIfBlank()

> **setRevisionEntityNameIfBlank**(`path`): `void`

Defined in: [listgrid/config/form/EntityFormBase.tsx:847](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormBase.tsx#L847)

#### Parameters

##### path

`string`

#### Returns

`void`

#### Inherited from

`EntityFormExtensions.setRevisionEntityNameIfBlank`

***

### resetValue()

> **resetValue**(`fieldName`, `loadOnChanges?`): `this`

Defined in: [listgrid/config/form/EntityFormData.tsx:23](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormData.tsx#L23)

#### Parameters

##### fieldName

`string`

##### loadOnChanges?

`boolean` = `true`

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.resetValue`

***

### setValue()

#### Call Signature

> **setValue**\<`K`\>(`fieldName`, `value`): `this`

Defined in: [listgrid/config/form/EntityFormData.tsx:42](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormData.tsx#L42)

필드값을 변경한다.

##### Type Parameters

###### K

`K` *extends* `string`

##### Parameters

###### fieldName

`K`

###### value

`T`\[`K`\]

##### Returns

`this`

##### Inherited from

`EntityFormExtensions.setValue`

#### Call Signature

> **setValue**(`fieldName`, `value`): `this`

Defined in: [listgrid/config/form/EntityFormData.tsx:43](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormData.tsx#L43)

필드값을 변경한다.

##### Parameters

###### fieldName

`string`

###### value

`any`

##### Returns

`this`

##### Inherited from

`EntityFormExtensions.setValue`

***

### setValues()

> **setValues**(`cloned`): `this`

Defined in: [listgrid/config/form/EntityFormData.tsx:53](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormData.tsx#L53)

#### Parameters

##### cloned

`EntityFormBase`\<`T`\>

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.setValues`

***

### changeValue()

#### Call Signature

> **changeValue**\<`K`\>(`fieldName`, `value`): `this`

Defined in: [listgrid/config/form/EntityFormData.tsx:71](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormData.tsx#L71)

단순히 필드값을 변경하는 setValue 와는 다르게 필드값이 변경되면 onChanges 에 등록된 함수를 실행한다.

##### Type Parameters

###### K

`K` *extends* `string`

##### Parameters

###### fieldName

`K`

###### value

`T`\[`K`\]

##### Returns

`this`

##### Inherited from

`EntityFormExtensions.changeValue`

#### Call Signature

> **changeValue**(`fieldName`, `value`): `this`

Defined in: [listgrid/config/form/EntityFormData.tsx:72](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormData.tsx#L72)

단순히 필드값을 변경하는 setValue 와는 다르게 필드값이 변경되면 onChanges 에 등록된 함수를 실행한다.

##### Parameters

###### fieldName

`string`

###### value

`any`

##### Returns

`this`

##### Inherited from

`EntityFormExtensions.changeValue`

***

### clearOnChanges()

> **clearOnChanges**(): `this`

Defined in: [listgrid/config/form/EntityFormData.tsx:82](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormData.tsx#L82)

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.clearOnChanges`

***

### clearOnFetchData()

> **clearOnFetchData**(): `this`

Defined in: [listgrid/config/form/EntityFormData.tsx:87](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormData.tsx#L87)

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.clearOnFetchData`

***

### clearOnInitialize()

> **clearOnInitialize**(): `this`

Defined in: [listgrid/config/form/EntityFormData.tsx:92](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormData.tsx#L92)

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.clearOnInitialize`

***

### clearOnPostFetchListData()

> **clearOnPostFetchListData**(): `this`

Defined in: [listgrid/config/form/EntityFormData.tsx:97](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormData.tsx#L97)

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.clearOnPostFetchListData`

***

### isDirty()

> **isDirty**(): `boolean`

Defined in: [listgrid/config/form/EntityFormData.tsx:102](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormData.tsx#L102)

#### Returns

`boolean`

#### Inherited from

`EntityFormExtensions.isDirty`

***

### isDirtyField()

> **isDirtyField**(`name`): `boolean`

Defined in: [listgrid/config/form/EntityFormData.tsx:112](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormData.tsx#L112)

#### Parameters

##### name

`string`

#### Returns

`boolean`

#### Inherited from

`EntityFormExtensions.isDirtyField`

***

### copyEntityFormToInnerFields()

> **copyEntityFormToInnerFields**(`__namedParameters`): `void`

Defined in: [listgrid/config/form/EntityFormData.tsx:117](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormData.tsx#L117)

#### Parameters

##### \_\_namedParameters

[`CopyEntityFormToInnerFieldsProps`](../interfaces/CopyEntityFormToInnerFieldsProps.md)

#### Returns

`void`

#### Inherited from

`EntityFormExtensions.copyEntityFormToInnerFields`

***

### withClientPreFetchList()

> **withClientPreFetchList**(`handler`, `options?`): `this`

Defined in: [listgrid/config/form/EntityFormExtensions.tsx:46](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormExtensions.tsx#L46)

#### Parameters

##### handler

[`ClientExtensionFunction`](../type-aliases/ClientExtensionFunction.md)\<[`SearchForm`](SearchForm.md)\>

##### options?

`Omit`\<[`ExtensionOptions`](../interfaces/ExtensionOptions.md), `"executionContext"`\>

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withClientPreFetchList`

***

### withClientPostFetchList()

> **withClientPostFetchList**(`handler`, `options?`): `this`

Defined in: [listgrid/config/form/EntityFormExtensions.tsx:53](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormExtensions.tsx#L53)

#### Parameters

##### handler

[`ClientExtensionFunction`](../type-aliases/ClientExtensionFunction.md)\<[`PageResult`](PageResult.md)\>

##### options?

`Omit`\<[`ExtensionOptions`](../interfaces/ExtensionOptions.md), `"executionContext"`\>

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withClientPostFetchList`

***

### withClientPreCreate()

> **withClientPreCreate**(`handler`, `options?`): `this`

Defined in: [listgrid/config/form/EntityFormExtensions.tsx:61](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormExtensions.tsx#L61)

#### Parameters

##### handler

[`ClientExtensionFunction`](../type-aliases/ClientExtensionFunction.md)\<`any`\>

##### options?

`Omit`\<[`ExtensionOptions`](../interfaces/ExtensionOptions.md), `"executionContext"`\>

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withClientPreCreate`

***

### withClientPostCreate()

> **withClientPostCreate**(`handler`, `options?`): `this`

Defined in: [listgrid/config/form/EntityFormExtensions.tsx:68](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormExtensions.tsx#L68)

#### Parameters

##### handler

[`ClientExtensionFunction`](../type-aliases/ClientExtensionFunction.md)\<`any`\>

##### options?

`Omit`\<[`ExtensionOptions`](../interfaces/ExtensionOptions.md), `"executionContext"`\>

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withClientPostCreate`

***

### withClientPreRead()

> **withClientPreRead**(`handler`, `options?`): `this`

Defined in: [listgrid/config/form/EntityFormExtensions.tsx:76](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormExtensions.tsx#L76)

#### Parameters

##### handler

[`ClientExtensionFunction`](../type-aliases/ClientExtensionFunction.md)\<`any`\>

##### options?

`Omit`\<[`ExtensionOptions`](../interfaces/ExtensionOptions.md), `"executionContext"`\>

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withClientPreRead`

***

### withClientPostRead()

> **withClientPostRead**(`handler`, `options?`): `this`

Defined in: [listgrid/config/form/EntityFormExtensions.tsx:83](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormExtensions.tsx#L83)

#### Parameters

##### handler

[`ClientExtensionFunction`](../type-aliases/ClientExtensionFunction.md)\<`any`\>

##### options?

`Omit`\<[`ExtensionOptions`](../interfaces/ExtensionOptions.md), `"executionContext"`\>

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withClientPostRead`

***

### withClientPreUpdate()

> **withClientPreUpdate**(`handler`, `options?`): `this`

Defined in: [listgrid/config/form/EntityFormExtensions.tsx:91](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormExtensions.tsx#L91)

#### Parameters

##### handler

[`ClientExtensionFunction`](../type-aliases/ClientExtensionFunction.md)\<`any`\>

##### options?

`Omit`\<[`ExtensionOptions`](../interfaces/ExtensionOptions.md), `"executionContext"`\>

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withClientPreUpdate`

***

### withClientPostUpdate()

> **withClientPostUpdate**(`handler`, `options?`): `this`

Defined in: [listgrid/config/form/EntityFormExtensions.tsx:98](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormExtensions.tsx#L98)

#### Parameters

##### handler

[`ClientExtensionFunction`](../type-aliases/ClientExtensionFunction.md)\<`any`\>

##### options?

`Omit`\<[`ExtensionOptions`](../interfaces/ExtensionOptions.md), `"executionContext"`\>

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withClientPostUpdate`

***

### withClientPreDelete()

> **withClientPreDelete**(`handler`, `options?`): `this`

Defined in: [listgrid/config/form/EntityFormExtensions.tsx:106](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormExtensions.tsx#L106)

#### Parameters

##### handler

[`ClientExtensionFunction`](../type-aliases/ClientExtensionFunction.md)\<`any`\>

##### options?

`Omit`\<[`ExtensionOptions`](../interfaces/ExtensionOptions.md), `"executionContext"`\>

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withClientPreDelete`

***

### withClientPostDelete()

> **withClientPostDelete**(`handler`, `options?`): `this`

Defined in: [listgrid/config/form/EntityFormExtensions.tsx:113](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormExtensions.tsx#L113)

#### Parameters

##### handler

[`ClientExtensionFunction`](../type-aliases/ClientExtensionFunction.md)\<`any`\>

##### options?

`Omit`\<[`ExtensionOptions`](../interfaces/ExtensionOptions.md), `"executionContext"`\>

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withClientPostDelete`

***

### executeClientExtensions()

> **executeClientExtensions**\<`T`\>(`point`, `data`, `context`): `Promise`\<`T`\>

Defined in: [listgrid/config/form/EntityFormExtensions.tsx:123](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormExtensions.tsx#L123)

Client Extension 실행

#### Type Parameters

##### T

`T`

#### Parameters

##### point

[`ExtensionPoint`](../enumerations/ExtensionPoint.md)

##### data

`T`

##### context

[`ClientExtensionContext`](../interfaces/ClientExtensionContext.md)

#### Returns

`Promise`\<`T`\>

#### Inherited from

`EntityFormExtensions.executeClientExtensions`

***

### hasClientExtensions()

> **hasClientExtensions**(...`points`): `boolean`

Defined in: [listgrid/config/form/EntityFormExtensions.tsx:152](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormExtensions.tsx#L152)

Client Extensions 존재 여부 확인

#### Parameters

##### points

...[`ExtensionPoint`](../enumerations/ExtensionPoint.md)[]

#### Returns

`boolean`

#### Inherited from

`EntityFormExtensions.hasClientExtensions`

***

### getClientExtensions()

> **getClientExtensions**(`point`): [`ClientExtensionConfig`](../interfaces/ClientExtensionConfig.md)[]

Defined in: [listgrid/config/form/EntityFormExtensions.tsx:162](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormExtensions.tsx#L162)

특정 Extension Point의 Client Extension 목록 가져오기

#### Parameters

##### point

[`ExtensionPoint`](../enumerations/ExtensionPoint.md)

#### Returns

[`ClientExtensionConfig`](../interfaces/ClientExtensionConfig.md)[]

#### Inherited from

`EntityFormExtensions.getClientExtensions`

***

### getAllClientExtensions()

> **getAllClientExtensions**(): `Map`\<[`ExtensionPoint`](../enumerations/ExtensionPoint.md), [`ClientExtensionConfig`](../interfaces/ClientExtensionConfig.md)[]\>

Defined in: [listgrid/config/form/EntityFormExtensions.tsx:169](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormExtensions.tsx#L169)

모든 Client Extension 정보 가져오기 (디버깅용)

#### Returns

`Map`\<[`ExtensionPoint`](../enumerations/ExtensionPoint.md), [`ClientExtensionConfig`](../interfaces/ClientExtensionConfig.md)[]\>

#### Inherited from

`EntityFormExtensions.getAllClientExtensions`

***

### getFieldValidationState()

> **getFieldValidationState**(`fieldName`): \{ `validated`: `boolean`; `message?`: `string`; `color?`: `string`; \} \| `undefined`

Defined in: [listgrid/config/form/EntityFormValidation.tsx:12](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormValidation.tsx#L12)

#### Parameters

##### fieldName

`string`

#### Returns

\{ `validated`: `boolean`; `message?`: `string`; `color?`: `string`; \} \| `undefined`

#### Inherited from

`EntityFormExtensions.getFieldValidationState`

***

### setFieldValidationState()

> **setFieldValidationState**(`fieldName`, `state`): `void`

Defined in: [listgrid/config/form/EntityFormValidation.tsx:18](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormValidation.tsx#L18)

#### Parameters

##### fieldName

`string`

##### state

###### validated

`boolean`

###### message?

`string`

###### color?

`string`

#### Returns

`void`

#### Inherited from

`EntityFormExtensions.setFieldValidationState`

***

### clearFieldValidationState()

> **clearFieldValidationState**(`fieldName`): `void`

Defined in: [listgrid/config/form/EntityFormValidation.tsx:25](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormValidation.tsx#L25)

#### Parameters

##### fieldName

`string`

#### Returns

`void`

#### Inherited from

`EntityFormExtensions.clearFieldValidationState`

***

### withRequired()

> **withRequired**(`name`, `required`): `this`

Defined in: [listgrid/config/form/EntityFormValidation.tsx:29](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormValidation.tsx#L29)

#### Parameters

##### name

`string`

##### required

`boolean`

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withRequired`

***

### withErrors()

> **withErrors**(`errors`): `this`

Defined in: [listgrid/config/form/EntityFormValidation.tsx:37](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormValidation.tsx#L37)

#### Parameters

##### errors

[`FieldError`](../interfaces/FieldError.md)[]

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withErrors`

***

### getErrorMap()

> **getErrorMap**(): `Map`\<`string`, [`FieldError`](../interfaces/FieldError.md)[]\>

Defined in: [listgrid/config/form/EntityFormValidation.tsx:42](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormValidation.tsx#L42)

#### Returns

`Map`\<`string`, [`FieldError`](../interfaces/FieldError.md)[]\>

#### Inherited from

`EntityFormExtensions.getErrorMap`

***

### mergeError()

> **mergeError**(`name`, `errors`): `void`

Defined in: [listgrid/config/form/EntityFormValidation.tsx:92](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormValidation.tsx#L92)

#### Parameters

##### name

`string`

##### errors

[`FieldError`](../interfaces/FieldError.md)[]

#### Returns

`void`

#### Inherited from

`EntityFormExtensions.mergeError`

***

### withManageEntityForm()

> **withManageEntityForm**(`manageEntityForm`): `this`

Defined in: [listgrid/config/form/EntityFormValidation.tsx:121](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormValidation.tsx#L121)

#### Parameters

##### manageEntityForm

[`ManageEntityForm`](../interfaces/ManageEntityForm.md)

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withManageEntityForm`

***

### withCreatable()

> **withCreatable**(`creatable?`): `this`

Defined in: [listgrid/config/form/EntityFormValidation.tsx:126](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormValidation.tsx#L126)

#### Parameters

##### creatable?

`boolean` = `true`

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withCreatable`

***

### withUpdatable()

> **withUpdatable**(`updatable?`): `this`

Defined in: [listgrid/config/form/EntityFormValidation.tsx:131](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormValidation.tsx#L131)

#### Parameters

##### updatable?

`boolean` = `true`

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withUpdatable`

***

### withDeletable()

> **withDeletable**(`deletable?`): `this`

Defined in: [listgrid/config/form/EntityFormValidation.tsx:136](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormValidation.tsx#L136)

#### Parameters

##### deletable?

`boolean` = `true`

#### Returns

`this`

#### Inherited from

`EntityFormExtensions.withDeletable`

***

### isCreatable()

> **isCreatable**(): `boolean`

Defined in: [listgrid/config/form/EntityFormValidation.tsx:141](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormValidation.tsx#L141)

#### Returns

`boolean`

#### Inherited from

`EntityFormExtensions.isCreatable`

***

### isUpdatable()

> **isUpdatable**(): `boolean`

Defined in: [listgrid/config/form/EntityFormValidation.tsx:145](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormValidation.tsx#L145)

#### Returns

`boolean`

#### Inherited from

`EntityFormExtensions.isUpdatable`

***

### isDeletable()

> **isDeletable**(): `boolean`

Defined in: [listgrid/config/form/EntityFormValidation.tsx:149](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/form/EntityFormValidation.tsx#L149)

#### Returns

`boolean`

#### Inherited from

`EntityFormExtensions.isDeletable`
