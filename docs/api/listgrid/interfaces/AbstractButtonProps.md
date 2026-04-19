[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / AbstractButtonProps

# Interface: AbstractButtonProps

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:18](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L18)

EntityFormManageable interface for entity form state management.
EntityForm 상태 관리용 인터페이스

## Extends

- [`EntityFormManageable`](EntityFormManageable.md)

## Extended by

- [`ButtonProps`](ButtonProps.md)
- [`ViewEntityFormButtonsProps`](ViewEntityFormButtonsProps.md)

## Properties

### entityForm

> **entityForm**: [`EntityForm`](../classes/EntityForm.md)

Defined in: [listgrid/components/form/types/ViewEntityForm.types.ts:162](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityForm.types.ts#L162)

EntityForm instance.
EntityForm 인스턴스

#### Inherited from

[`EntityFormManageable`](EntityFormManageable.md).[`entityForm`](EntityFormManageable.md#entityform)

***

### setEntityForm?

> `optional` **setEntityForm?**: `Dispatch`\<`SetStateAction`\<[`EntityForm`](../classes/EntityForm.md)\<`any`\> \| `undefined`\>\>

Defined in: [listgrid/components/form/types/ViewEntityForm.types.ts:167](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityForm.types.ts#L167)

Setter for EntityForm state (optional).
EntityForm 상태 setter (선택)

#### Inherited from

[`EntityFormManageable`](EntityFormManageable.md).[`setEntityForm`](EntityFormManageable.md#setentityform)

***

### postSave?

> `optional` **postSave?**: (`entityForm`) => `Promise`\<`void` \| [`EntityForm`](../classes/EntityForm.md)\<`any`\>\>

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:19](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L19)

#### Parameters

##### entityForm

[`EntityForm`](../classes/EntityForm.md)

#### Returns

`Promise`\<`void` \| [`EntityForm`](../classes/EntityForm.md)\<`any`\>\>

***

### postDelete?

> `optional` **postDelete?**: (`entityForm`) => `Promise`\<`void` \| [`EntityForm`](../classes/EntityForm.md)\<`any`\>\>

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:20](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L20)

#### Parameters

##### entityForm

[`EntityForm`](../classes/EntityForm.md)

#### Returns

`Promise`\<`void` \| [`EntityForm`](../classes/EntityForm.md)\<`any`\>\>

***

### pathname

> **pathname**: `string`

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:21](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L21)

***

### router

> **router**: [`RouterApi`](RouterApi.md)

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:22](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L22)

***

### buttonLinks?

> `optional` **buttonLinks?**: [`EntityButtonLinkProps`](../type-aliases/EntityButtonLinkProps.md)

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:23](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L23)

***

### setErrors

> **setErrors**: (`errors`) => `void`

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:24](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L24)

#### Parameters

##### errors

`string`[]

#### Returns

`void`

***

### setNotifications

> **setNotifications**: (`notifications`) => `void`

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:25](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L25)

#### Parameters

##### notifications

`string`[]

#### Returns

`void`

***

### subCollection?

> `optional` **subCollection?**: `boolean`

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:26](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L26)

***

### onRefresh?

> `optional` **onRefresh?**: () => `void`

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:27](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L27)

#### Returns

`void`

***

### openBaseLoading?

> `optional` **openBaseLoading?**: (`open`) => `void`

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:28](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L28)

#### Parameters

##### open

`boolean`

#### Returns

`void`

***

### session?

> `optional` **session?**: [`Session`](Session.md)

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:29](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L29)

***

### readonly?

> `optional` **readonly?**: `boolean`

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:30](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L30)

***

### popupMode?

> `optional` **popupMode?**: `boolean`

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:36](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L36)

새창(팝업) 모드 여부
- true일 때 목록 버튼 대신 닫기 버튼 표시
- 삭제 후 창 닫기 및 원본 창 새로고침 처리

***

### buttonClassNames?

> `optional` **buttonClassNames?**: `object`

Defined in: [listgrid/components/form/types/ViewEntityFormButtons.types.ts:38](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormButtons.types.ts#L38)

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
