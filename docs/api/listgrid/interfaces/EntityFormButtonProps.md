[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / EntityFormButtonProps

# Interface: EntityFormButtonProps

Defined in: [listgrid/config/EntityFormButton.tsx:22](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFormButton.tsx#L22)

## Properties

### entityForm

> **entityForm**: [`EntityForm`](../classes/EntityForm.md)

Defined in: [listgrid/config/EntityFormButton.tsx:23](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFormButton.tsx#L23)

***

### router

> **router**: [`RouterApi`](RouterApi.md)

Defined in: [listgrid/config/EntityFormButton.tsx:24](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFormButton.tsx#L24)

***

### pathname

> **pathname**: `string` \| `null`

Defined in: [listgrid/config/EntityFormButton.tsx:25](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFormButton.tsx#L25)

***

### setErrors

> **setErrors**: (`errors`) => `void`

Defined in: [listgrid/config/EntityFormButton.tsx:26](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFormButton.tsx#L26)

#### Parameters

##### errors

`string`[]

#### Returns

`void`

***

### setNotifications

> **setNotifications**: (`notifications`) => `void`

Defined in: [listgrid/config/EntityFormButton.tsx:27](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFormButton.tsx#L27)

#### Parameters

##### notifications

`string`[]

#### Returns

`void`

***

### step?

> `optional` **step?**: [`EntityFormButtonStepInfo`](EntityFormButtonStepInfo.md)

Defined in: [listgrid/config/EntityFormButton.tsx:28](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFormButton.tsx#L28)

***

### showModal?

> `optional` **showModal?**: (`options`) => `string`

Defined in: [listgrid/config/EntityFormButton.tsx:31](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFormButton.tsx#L31)

#### Parameters

##### options

[`ModalOptions`](ModalOptions.md)

#### Returns

`string`

***

### closeModal?

> `optional` **closeModal?**: (`id`) => `Promise`\<`void`\>

Defined in: [listgrid/config/EntityFormButton.tsx:32](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFormButton.tsx#L32)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`void`\>

***

### closeTopModal?

> `optional` **closeTopModal?**: () => `Promise`\<`void`\>

Defined in: [listgrid/config/EntityFormButton.tsx:33](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFormButton.tsx#L33)

#### Returns

`Promise`\<`void`\>

***

### getModalData?

> `optional` **getModalData?**: (`id`) => `unknown`

Defined in: [listgrid/config/EntityFormButton.tsx:35](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFormButton.tsx#L35)

#### Parameters

##### id

`string`

#### Returns

`unknown`

***

### updateModalData?

> `optional` **updateModalData?**: (`id`, `data`) => `void`

Defined in: [listgrid/config/EntityFormButton.tsx:36](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFormButton.tsx#L36)

#### Parameters

##### id

`string`

##### data

`Partial`\<[`ModalOptions`](ModalOptions.md)\>

#### Returns

`void`
