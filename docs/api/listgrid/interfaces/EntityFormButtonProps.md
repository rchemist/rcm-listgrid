[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / EntityFormButtonProps

# Interface: EntityFormButtonProps

Defined in: [listgrid/config/EntityFormButton.tsx:15](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFormButton.tsx#L15)

## Properties

### entityForm

> **entityForm**: [`EntityForm`](../classes/EntityForm.md)

Defined in: [listgrid/config/EntityFormButton.tsx:16](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFormButton.tsx#L16)

***

### router

> **router**: [`RouterApi`](RouterApi.md)

Defined in: [listgrid/config/EntityFormButton.tsx:17](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFormButton.tsx#L17)

***

### pathname

> **pathname**: `string` \| `null`

Defined in: [listgrid/config/EntityFormButton.tsx:18](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFormButton.tsx#L18)

***

### setErrors

> **setErrors**: (`errors`) => `void`

Defined in: [listgrid/config/EntityFormButton.tsx:19](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFormButton.tsx#L19)

#### Parameters

##### errors

`string`[]

#### Returns

`void`

***

### setNotifications

> **setNotifications**: (`notifications`) => `void`

Defined in: [listgrid/config/EntityFormButton.tsx:20](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFormButton.tsx#L20)

#### Parameters

##### notifications

`string`[]

#### Returns

`void`

***

### step?

> `optional` **step?**: [`EntityFormButtonStepInfo`](EntityFormButtonStepInfo.md)

Defined in: [listgrid/config/EntityFormButton.tsx:21](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFormButton.tsx#L21)

***

### showModal?

> `optional` **showModal?**: (`options`) => `string`

Defined in: [listgrid/config/EntityFormButton.tsx:24](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFormButton.tsx#L24)

#### Parameters

##### options

[`ModalOptions`](ModalOptions.md)

#### Returns

`string`

***

### closeModal?

> `optional` **closeModal?**: (`id`) => `Promise`\<`void`\>

Defined in: [listgrid/config/EntityFormButton.tsx:25](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFormButton.tsx#L25)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`void`\>

***

### closeTopModal?

> `optional` **closeTopModal?**: () => `Promise`\<`void`\>

Defined in: [listgrid/config/EntityFormButton.tsx:26](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFormButton.tsx#L26)

#### Returns

`Promise`\<`void`\>

***

### getModalData?

> `optional` **getModalData?**: (`id`) => `unknown`

Defined in: [listgrid/config/EntityFormButton.tsx:28](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFormButton.tsx#L28)

#### Parameters

##### id

`string`

#### Returns

`unknown`

***

### updateModalData?

> `optional` **updateModalData?**: (`id`, `data`) => `void`

Defined in: [listgrid/config/EntityFormButton.tsx:29](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFormButton.tsx#L29)

#### Parameters

##### id

`string`

##### data

`Partial`\<[`ModalOptions`](ModalOptions.md)\>

#### Returns

`void`
