[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / useEntityFormLogic

# Function: useEntityFormLogic()

> **useEntityFormLogic**(`props`): `object`

Defined in: [listgrid/components/form/hooks/useEntityFormLogic.ts:29](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/hooks/useEntityFormLogic.ts#L29)

useEntityFormLogic 훅
- ViewEntityForm의 모든 상태/핸들러/로직을 관리하는 커스텀 훅
- 렌더링에 필요한 모든 값/함수만 반환

## Parameters

### props

[`ViewEntityFormProps`](../interfaces/ViewEntityFormProps.md)

ViewEntityFormProps

## Returns

`object`

### entityForm

> **entityForm**: [`EntityForm`](../classes/EntityForm.md)\<`any`\> \| `undefined`

### setEntityForm

> **setEntityForm**: `Dispatch`\<`SetStateAction`\<[`EntityForm`](../classes/EntityForm.md)\<`any`\> \| `undefined`\>\>

### tabIndex

> **tabIndex**: `string` \| `undefined`

### setTabIndex

> **setTabIndex**: `Dispatch`\<`SetStateAction`\<`string` \| `undefined`\>\>

### cacheKey

> **cacheKey**: `string` \| `undefined`

### setCacheKey

> **setCacheKey**: `Dispatch`\<`SetStateAction`\<`string` \| `undefined`\>\>

### loadingError

> **loadingError**: `boolean`

### initialized

> **initialized**: `boolean`

### errors

> **errors**: `string`[]

### setErrors

> **setErrors**: `Dispatch`\<`SetStateAction`\<`string`[]\>\>

### notifications

> **notifications**: `string`[]

### setNotifications

> **setNotifications**: `Dispatch`\<`SetStateAction`\<`string`[]\>\>

### title

> **title**: `ReactNode`

### setTitle

> **setTitle**: `Dispatch`\<`SetStateAction`\<`ReactNode`\>\>

### renderType

> **renderType**: [`RenderType`](../type-aliases/RenderType.md) \| `undefined`

### setRenderType

> **setRenderType**: `Dispatch`\<`SetStateAction`\<[`RenderType`](../type-aliases/RenderType.md) \| `undefined`\>\>

### selectedTabIndex

> **selectedTabIndex**: `number`

### setSelectedTabIndex

> **setSelectedTabIndex**: `Dispatch`\<`SetStateAction`\<`number`\>\>

### currentStep

> **currentStep**: `number`

### setCurrentStep

> **setCurrentStep**: (`stepNumber`) => `void` = `changeCurrentStep`

#### Parameters

##### stepNumber

`number`

#### Returns

`void`

### showStepper

> **showStepper**: `boolean`

### setShowStepper

> **setShowStepper**: `Dispatch`\<`SetStateAction`\<`boolean`\>\>

### tabs

> **tabs**: [`EntityTab`](../classes/EntityTab.md)[]

### setTabs

> **setTabs**: `Dispatch`\<`SetStateAction`\<[`EntityTab`](../classes/EntityTab.md)[]\>\>

### isSubCollectionEntity

> **isSubCollectionEntity**: `boolean`

### isInlineMode

> **isInlineMode**: `boolean`

### readonly

> **readonly**: `boolean`

### popupMode

> **popupMode**: `boolean`

### session

> **session**: [`Session`](../interfaces/Session.md) \| `null`

### useCreateStep

> **useCreateStep**: `boolean`

### maxStep

> **maxStep**: `number`

### createStepFields

> **createStepFields**: `string`[]

### buttons

> **buttons**: `ReactNode`[]

### headerAreaContent

> **headerAreaContent**: `ReactNode`

### postSave

> **postSave**: (`entityForm`) => `Promise`\<[`EntityForm`](../classes/EntityForm.md)\<`any`\>\>

#### Parameters

##### entityForm

[`EntityForm`](../classes/EntityForm.md)

#### Returns

`Promise`\<[`EntityForm`](../classes/EntityForm.md)\<`any`\>\>

### postDelete

> **postDelete**: (`entityForm`) => `Promise`\<`void`\>

#### Parameters

##### entityForm

[`EntityForm`](../classes/EntityForm.md)

#### Returns

`Promise`\<`void`\>

### updateTitle

> **updateTitle**: (`form?`) => `Promise`\<`void`\>

#### Parameters

##### form?

[`EntityForm`](../classes/EntityForm.md)\<`any`\>

#### Returns

`Promise`\<`void`\>

### onClickSaveButton

> **onClickSaveButton**: () => `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

### showModal

> **showModal**: (`options`) => `string`

#### Parameters

##### options

[`ModalOptions`](../interfaces/ModalOptions.md)

#### Returns

`string`

### closeModal

> **closeModal**: (`id`) => `Promise`\<`void`\> = `handleCloseModal`

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`void`\>

### closeTopModal

> **closeTopModal**: () => `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

### getModalData

> **getModalData**: (`id`) => `unknown`

#### Parameters

##### id

`string`

#### Returns

`unknown`

### updateModalData

> **updateModalData**: (`id`, `data`) => `void` = `handleUpdateModalData`

#### Parameters

##### id

`string`

##### data

`Partial`\<[`ModalOptions`](../interfaces/ModalOptions.md)\>

#### Returns

`void`

### resetEntityForm

> **resetEntityForm**: (`delay?`, `preserveState`) => `Promise`\<`void`\>

#### Parameters

##### delay?

`number`

##### preserveState?

`boolean` = `true`

#### Returns

`Promise`\<`void`\>

### triggerAutoSave

> **triggerAutoSave**: () => `void`

#### Returns

`void`

### clearAutoSave

> **clearAutoSave**: () => `void`

#### Returns

`void`

### saveAutoSaveNow

> **saveAutoSaveNow**: () => `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>
