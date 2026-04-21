[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / useEntityFormSave

# Function: useEntityFormSave()

> **useEntityFormSave**(`params`): `object`

Defined in: [listgrid/components/form/hooks/useEntityFormSave.ts:19](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/hooks/useEntityFormSave.ts#L19)

Custom hook for handling save/delete logic of EntityForm.
EntityForm 저장/삭제 로직을 처리하는 커스텀 훅

## Parameters

### params

저장/삭제에 필요한 파라미터 객체

#### entityForm

[`EntityForm`](../classes/EntityForm.md)

#### isSubCollectionEntity

`boolean`

#### renderType

[`RenderType`](../type-aliases/RenderType.md) \| `undefined`

#### pathname

`string`

#### router

[`RouterApi`](../interfaces/RouterApi.md)

#### buttonLinks?

[`EntityButtonLinkProps`](../type-aliases/EntityButtonLinkProps.md)

#### postSave?

(`entityForm`) => `Promise`\<[`EntityForm`](../classes/EntityForm.md)\<`any`\>\>

#### setEntityForm

(`entityForm`) => `void`

#### setNotifications

(`messages`) => `void`

#### setTitleText

(`form?`) => `void`

#### setCacheKey

(`key`) => `void`

#### setErrors

(`errors`) => `void`

#### setOpenBaseLoading

(`open`) => `void`

#### session?

[`Session`](../interfaces/Session.md)

## Returns

### onClickSaveButton

> **onClickSaveButton**: () => `Promise`\<`void`\>

EntityForm 저장 버튼 클릭 시 호출되는 함수
Handles save button click

#### Returns

`Promise`\<`void`\>

### handlePostDelete

> **handlePostDelete**: (`entityForm`) => `Promise`\<`void`\>

EntityForm 삭제 후 처리
Handles post-delete logic

#### Parameters

##### entityForm

[`EntityForm`](../classes/EntityForm.md)

#### Returns

`Promise`\<`void`\>
