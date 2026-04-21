[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ViewEntityFormButtonsProps

# Interface: ViewEntityFormButtonsProps

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:35](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L35)

EntityFormManageable interface for entity form state management.
EntityForm 상태 관리용 인터페이스

## Extends

- [`AbstractButtonProps`](AbstractButtonProps.md)

## Properties

### entityForm

> **entityForm**: [`EntityForm`](../classes/EntityForm.md)

Defined in: [listgrid/components/form/types/ViewEntityForm.types.ts:162](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityForm.types.ts#L162)

EntityForm instance.
EntityForm 인스턴스

#### Inherited from

[`AbstractButtonProps`](AbstractButtonProps.md).[`entityForm`](AbstractButtonProps.md#entityform)

***

### setEntityForm?

> `optional` **setEntityForm?**: `Dispatch`\<`SetStateAction`\<[`EntityForm`](../classes/EntityForm.md)\<`any`\> \| `undefined`\>\>

Defined in: [listgrid/components/form/types/ViewEntityForm.types.ts:167](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityForm.types.ts#L167)

Setter for EntityForm state (optional).
EntityForm 상태 setter (선택)

#### Inherited from

[`AbstractButtonProps`](AbstractButtonProps.md).[`setEntityForm`](AbstractButtonProps.md#setentityform)

***

### postSave?

> `optional` **postSave?**: (`entityForm`) => `Promise`\<`void` \| [`EntityForm`](../classes/EntityForm.md)\<`any`\>\>

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:13](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L13)

#### Parameters

##### entityForm

[`EntityForm`](../classes/EntityForm.md)

#### Returns

`Promise`\<`void` \| [`EntityForm`](../classes/EntityForm.md)\<`any`\>\>

#### Inherited from

[`AbstractButtonProps`](AbstractButtonProps.md).[`postSave`](AbstractButtonProps.md#postsave)

***

### postDelete?

> `optional` **postDelete?**: (`entityForm`) => `Promise`\<`void` \| [`EntityForm`](../classes/EntityForm.md)\<`any`\>\>

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:14](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L14)

#### Parameters

##### entityForm

[`EntityForm`](../classes/EntityForm.md)

#### Returns

`Promise`\<`void` \| [`EntityForm`](../classes/EntityForm.md)\<`any`\>\>

#### Inherited from

[`AbstractButtonProps`](AbstractButtonProps.md).[`postDelete`](AbstractButtonProps.md#postdelete)

***

### pathname

> **pathname**: `string`

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:15](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L15)

#### Inherited from

[`AbstractButtonProps`](AbstractButtonProps.md).[`pathname`](AbstractButtonProps.md#pathname)

***

### router

> **router**: [`RouterApi`](RouterApi.md)

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:16](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L16)

#### Inherited from

[`AbstractButtonProps`](AbstractButtonProps.md).[`router`](AbstractButtonProps.md#router)

***

### buttonLinks?

> `optional` **buttonLinks?**: [`EntityButtonLinkProps`](../type-aliases/EntityButtonLinkProps.md)

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:17](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L17)

#### Inherited from

[`AbstractButtonProps`](AbstractButtonProps.md).[`buttonLinks`](AbstractButtonProps.md#buttonlinks)

***

### setErrors

> **setErrors**: (`errors`) => `void`

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:18](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L18)

#### Parameters

##### errors

`string`[]

#### Returns

`void`

#### Inherited from

[`AbstractButtonProps`](AbstractButtonProps.md).[`setErrors`](AbstractButtonProps.md#seterrors)

***

### setNotifications

> **setNotifications**: (`notifications`) => `void`

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:19](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L19)

#### Parameters

##### notifications

`string`[]

#### Returns

`void`

#### Inherited from

[`AbstractButtonProps`](AbstractButtonProps.md).[`setNotifications`](AbstractButtonProps.md#setnotifications)

***

### subCollection?

> `optional` **subCollection?**: `boolean`

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:20](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L20)

#### Inherited from

[`AbstractButtonProps`](AbstractButtonProps.md).[`subCollection`](AbstractButtonProps.md#subcollection)

***

### onRefresh?

> `optional` **onRefresh?**: () => `void`

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:21](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L21)

#### Returns

`void`

#### Inherited from

[`AbstractButtonProps`](AbstractButtonProps.md).[`onRefresh`](AbstractButtonProps.md#onrefresh)

***

### openBaseLoading?

> `optional` **openBaseLoading?**: (`open`) => `void`

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:22](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L22)

#### Parameters

##### open

`boolean`

#### Returns

`void`

#### Inherited from

[`AbstractButtonProps`](AbstractButtonProps.md).[`openBaseLoading`](AbstractButtonProps.md#openbaseloading)

***

### session?

> `optional` **session?**: [`Session`](Session.md)

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:23](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L23)

#### Inherited from

[`AbstractButtonProps`](AbstractButtonProps.md).[`session`](AbstractButtonProps.md#session)

***

### popupMode?

> `optional` **popupMode?**: `boolean`

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:30](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L30)

새창(팝업) 모드 여부
- true일 때 목록 버튼 대신 닫기 버튼 표시
- 삭제 후 창 닫기 및 원본 창 새로고침 처리

#### Inherited from

[`AbstractButtonProps`](AbstractButtonProps.md).[`popupMode`](AbstractButtonProps.md#popupmode)

***

### buttons?

> `optional` **buttons?**: [`EntityFormButton`](../classes/EntityFormButton.md)[]

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:36](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L36)

***

### excludeButtons?

> `optional` **excludeButtons?**: `string`[]

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:37](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L37)

***

### readonly

> **readonly**: `boolean`

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:38](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L38)

#### Overrides

[`AbstractButtonProps`](AbstractButtonProps.md).[`readonly`](AbstractButtonProps.md#readonly)

***

### useCreateStep?

> `optional` **useCreateStep?**: `boolean`

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:39](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L39)

***

### currentStep?

> `optional` **currentStep?**: `number`

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:40](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L40)

***

### maxStep?

> `optional` **maxStep?**: `number`

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:41](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L41)

***

### createStepFields?

> `optional` **createStepFields?**: `string`[]

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:42](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L42)

***

### showModal?

> `optional` **showModal?**: (`options`) => `string`

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:45](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L45)

#### Parameters

##### options

[`ModalOptions`](ModalOptions.md)

#### Returns

`string`

***

### closeModal?

> `optional` **closeModal?**: (`id`) => `Promise`\<`void`\>

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:46](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L46)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`void`\>

***

### closeTopModal?

> `optional` **closeTopModal?**: () => `Promise`\<`void`\>

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:47](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L47)

#### Returns

`Promise`\<`void`\>

***

### getModalData?

> `optional` **getModalData?**: (`id`) => `unknown`

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:49](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L49)

returns host-supplied data attached to the modal via ModalOptions.data

#### Parameters

##### id

`string`

#### Returns

`unknown`

***

### updateModalData?

> `optional` **updateModalData?**: (`id`, `data`) => `void`

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:50](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L50)

#### Parameters

##### id

`string`

##### data

`Partial`\<[`ModalOptions`](ModalOptions.md)\>

#### Returns

`void`

***

### buttonClassNames?

> `optional` **buttonClassNames?**: `object`

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:54](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L54)

버튼 커스텀 클래스 (테마 시스템에서 전달)

#### container?

> `optional` **container?**: `string`

버튼 그룹 컨테이너

#### innerWrapper?

> `optional` **innerWrapper?**: `string`

버튼 inner wrapper

#### save?

> `optional` **save?**: `string`

저장 버튼

#### list?

> `optional` **list?**: `string`

목록 버튼

#### delete?

> `optional` **delete?**: `string`

삭제 버튼

#### close?

> `optional` **close?**: `string`

닫기 버튼 (팝업)

#### custom?

> `optional` **custom?**: `string`

커스텀 버튼 기본값

#### Overrides

[`AbstractButtonProps`](AbstractButtonProps.md).[`buttonClassNames`](AbstractButtonProps.md#buttonclassnames)
