[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ListGridHeaderProps

# Interface: ListGridHeaderProps

Defined in: [listgrid/components/list/types/ListGridHeader.types.ts:10](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ListGridHeader.types.ts#L10)

## Extends

- [`ListGridHeaderButtonProps`](ListGridHeaderButtonProps.md)

## Properties

### buttons?

> `optional` **buttons?**: (`props`) => `Promise`\<`ReactNode`\>[]

Defined in: [listgrid/components/list/types/ListGridHeader.types.ts:11](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ListGridHeader.types.ts#L11)

#### Parameters

##### props

[`ListGridHeaderButtonProps`](ListGridHeaderButtonProps.md)

#### Returns

`Promise`\<`ReactNode`\>

***

### supportPriority

> **supportPriority**: `boolean`

Defined in: [listgrid/components/list/types/ListGridHeader.types.ts:12](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ListGridHeader.types.ts#L12)

***

### setManagePriority

> **setManagePriority**: () => `void`

Defined in: [listgrid/components/list/types/ListGridHeader.types.ts:13](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ListGridHeader.types.ts#L13)

#### Returns

`void`

***

### cacheable?

> `optional` **cacheable?**: `boolean`

Defined in: [listgrid/components/list/types/ListGridHeader.types.ts:14](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ListGridHeader.types.ts#L14)

***

### addNew?

> `optional` **addNew?**: `boolean`

Defined in: [listgrid/components/list/types/ListGridHeader.types.ts:15](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ListGridHeader.types.ts#L15)

***

### selectionOptions?

> `optional` **selectionOptions?**: [`SelectionOptions`](SelectionOptions.md)

Defined in: [listgrid/components/list/types/ListGridHeader.types.ts:16](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ListGridHeader.types.ts#L16)

***

### rows?

> `optional` **rows?**: `any`[]

Defined in: [listgrid/components/list/types/ListGridHeader.types.ts:17](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ListGridHeader.types.ts#L17)

***

### readonly?

> `optional` **readonly?**: `boolean`

Defined in: [listgrid/components/list/types/ListGridHeader.types.ts:18](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ListGridHeader.types.ts#L18)

***

### deleteItems

> **deleteItems**: () => `void`

Defined in: [listgrid/components/list/types/ListGridHeader.types.ts:22](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ListGridHeader.types.ts#L22)

#### Returns

`void`

#### Inherited from

[`ListGridHeaderButtonProps`](ListGridHeaderButtonProps.md).[`deleteItems`](ListGridHeaderButtonProps.md#deleteitems)

***

### refresh

> **refresh**: () => `void`

Defined in: [listgrid/components/list/types/ListGridHeader.types.ts:23](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ListGridHeader.types.ts#L23)

#### Returns

`void`

#### Inherited from

[`ListGridHeaderButtonProps`](ListGridHeaderButtonProps.md).[`refresh`](ListGridHeaderButtonProps.md#refresh)

***

### title

> **title**: `string`

Defined in: [listgrid/components/list/types/ListGridHeader.types.ts:24](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ListGridHeader.types.ts#L24)

#### Inherited from

[`ListGridHeaderButtonProps`](ListGridHeaderButtonProps.md).[`title`](ListGridHeaderButtonProps.md#title)

***

### hideTitle?

> `optional` **hideTitle?**: `boolean`

Defined in: [listgrid/components/list/types/ListGridHeader.types.ts:25](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ListGridHeader.types.ts#L25)

#### Inherited from

[`ListGridHeaderButtonProps`](ListGridHeaderButtonProps.md).[`hideTitle`](ListGridHeaderButtonProps.md#hidetitle)

***

### enableHandleData

> **enableHandleData**: `boolean`

Defined in: [listgrid/components/list/types/ListGridHeader.types.ts:26](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ListGridHeader.types.ts#L26)

#### Inherited from

[`ListGridHeaderButtonProps`](ListGridHeaderButtonProps.md).[`enableHandleData`](ListGridHeaderButtonProps.md#enablehandledata)

***

### router

> **router**: `any`

Defined in: [listgrid/components/list/types/ListGridHeader.types.ts:27](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ListGridHeader.types.ts#L27)

#### Inherited from

[`ListGridHeaderButtonProps`](ListGridHeaderButtonProps.md).[`router`](ListGridHeaderButtonProps.md#router)

***

### path

> **path**: `any`

Defined in: [listgrid/components/list/types/ListGridHeader.types.ts:28](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ListGridHeader.types.ts#L28)

#### Inherited from

[`ListGridHeaderButtonProps`](ListGridHeaderButtonProps.md).[`path`](ListGridHeaderButtonProps.md#path)

***

### activeTrashIcon

> **activeTrashIcon**: `boolean`

Defined in: [listgrid/components/list/types/ListGridHeader.types.ts:29](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ListGridHeader.types.ts#L29)

#### Inherited from

[`ListGridHeaderButtonProps`](ListGridHeaderButtonProps.md).[`activeTrashIcon`](ListGridHeaderButtonProps.md#activetrashicon)

***

### searchForm

> **searchForm**: [`SearchForm`](../classes/SearchForm.md)

Defined in: [listgrid/components/list/types/ListGridHeader.types.ts:30](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ListGridHeader.types.ts#L30)

#### Inherited from

[`ListGridHeaderButtonProps`](ListGridHeaderButtonProps.md).[`searchForm`](ListGridHeaderButtonProps.md#searchform)

***

### dataTransferConfig?

> `optional` **dataTransferConfig?**: [`DataTransferConfig`](../classes/DataTransferConfig.md)

Defined in: [listgrid/components/list/types/ListGridHeader.types.ts:31](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ListGridHeader.types.ts#L31)

#### Inherited from

[`ListGridHeaderButtonProps`](ListGridHeaderButtonProps.md).[`dataTransferConfig`](ListGridHeaderButtonProps.md#datatransferconfig)

***

### isSubCollection?

> `optional` **isSubCollection?**: `boolean`

Defined in: [listgrid/components/list/types/ListGridHeader.types.ts:32](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ListGridHeader.types.ts#L32)

#### Inherited from

[`ListGridHeaderButtonProps`](ListGridHeaderButtonProps.md).[`isSubCollection`](ListGridHeaderButtonProps.md#issubcollection)

***

### entityForm

> **entityForm**: [`EntityForm`](../classes/EntityForm.md)

Defined in: [listgrid/components/list/types/ListGridHeader.types.ts:33](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ListGridHeader.types.ts#L33)

#### Inherited from

[`ListGridHeaderButtonProps`](ListGridHeaderButtonProps.md).[`entityForm`](ListGridHeaderButtonProps.md#entityform)

***

### session?

> `optional` **session?**: [`Session`](Session.md)

Defined in: [listgrid/components/list/types/ListGridHeader.types.ts:34](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ListGridHeader.types.ts#L34)

#### Inherited from

[`ListGridHeaderButtonProps`](ListGridHeaderButtonProps.md).[`session`](ListGridHeaderButtonProps.md#session)

***

### setErrors

> **setErrors**: (`errors`) => `void`

Defined in: [listgrid/components/list/types/ListGridHeader.types.ts:35](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ListGridHeader.types.ts#L35)

#### Parameters

##### errors

`string`[]

#### Returns

`void`

#### Inherited from

[`ListGridHeaderButtonProps`](ListGridHeaderButtonProps.md).[`setErrors`](ListGridHeaderButtonProps.md#seterrors)

***

### setNotifications

> **setNotifications**: (`notifications`) => `void`

Defined in: [listgrid/components/list/types/ListGridHeader.types.ts:36](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ListGridHeader.types.ts#L36)

#### Parameters

##### notifications

`string`[]

#### Returns

`void`

#### Inherited from

[`ListGridHeaderButtonProps`](ListGridHeaderButtonProps.md).[`setNotifications`](ListGridHeaderButtonProps.md#setnotifications)

***

### checkedItems?

> `optional` **checkedItems?**: `string`[]

Defined in: [listgrid/components/list/types/ListGridHeader.types.ts:37](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ListGridHeader.types.ts#L37)

#### Inherited from

[`ListGridHeaderButtonProps`](ListGridHeaderButtonProps.md).[`checkedItems`](ListGridHeaderButtonProps.md#checkeditems)
