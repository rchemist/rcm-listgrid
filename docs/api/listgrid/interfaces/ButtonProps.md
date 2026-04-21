[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ButtonProps

# Interface: ButtonProps

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:10](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L10)

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

### readonly?

> `optional` **readonly?**: `boolean`

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:24](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L24)

#### Inherited from

[`AbstractButtonProps`](AbstractButtonProps.md).[`readonly`](AbstractButtonProps.md#readonly)

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

### buttonClassNames?

> `optional` **buttonClassNames?**: `object`

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:32](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L32)

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

#### Inherited from

[`AbstractButtonProps`](AbstractButtonProps.md).[`buttonClassNames`](AbstractButtonProps.md#buttonclassnames)
