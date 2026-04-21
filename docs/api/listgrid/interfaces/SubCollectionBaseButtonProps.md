[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / SubCollectionBaseButtonProps

# Interface: SubCollectionBaseButtonProps

Defined in: [listgrid/components/list/types/SubCollectionButtons.type.ts:5](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/SubCollectionButtons.type.ts#L5)

## Extended by

- [`SubCollectionButtonsProps`](SubCollectionButtonsProps.md)

## Properties

### add?

> `optional` **add?**: `boolean`

Defined in: [listgrid/components/list/types/SubCollectionButtons.type.ts:6](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/SubCollectionButtons.type.ts#L6)

***

### delete?

> `optional` **delete?**: `boolean`

Defined in: [listgrid/components/list/types/SubCollectionButtons.type.ts:7](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/SubCollectionButtons.type.ts#L7)

***

### activeTrashIcon

> **activeTrashIcon**: `boolean`

Defined in: [listgrid/components/list/types/SubCollectionButtons.type.ts:8](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/SubCollectionButtons.type.ts#L8)

***

### deleteItems

> **deleteItems**: () => `void`

Defined in: [listgrid/components/list/types/SubCollectionButtons.type.ts:9](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/SubCollectionButtons.type.ts#L9)

#### Returns

`void`

***

### mappedBy?

> `optional` **mappedBy?**: `string`

Defined in: [listgrid/components/list/types/SubCollectionButtons.type.ts:10](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/SubCollectionButtons.type.ts#L10)

***

### mappedValue?

> `optional` **mappedValue?**: `any`

Defined in: [listgrid/components/list/types/SubCollectionButtons.type.ts:11](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/SubCollectionButtons.type.ts#L11)

***

### collectionName?

> `optional` **collectionName?**: `string`

Defined in: [listgrid/components/list/types/SubCollectionButtons.type.ts:12](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/SubCollectionButtons.type.ts#L12)

***

### createOrUpdate?

> `optional` **createOrUpdate?**: [`CreateUpdateOptions`](CreateUpdateOptions.md)

Defined in: [listgrid/components/list/types/SubCollectionButtons.type.ts:13](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/SubCollectionButtons.type.ts#L13)

***

### setErrors

> **setErrors**: (`errors`) => `void`

Defined in: [listgrid/components/list/types/SubCollectionButtons.type.ts:14](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/SubCollectionButtons.type.ts#L14)

#### Parameters

##### errors

`string`[]

#### Returns

`void`

***

### setNotifications

> **setNotifications**: (`notifications`) => `void`

Defined in: [listgrid/components/list/types/SubCollectionButtons.type.ts:15](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/SubCollectionButtons.type.ts#L15)

#### Parameters

##### notifications

`string`[]

#### Returns

`void`

***

### entityForm

> **entityForm**: [`EntityForm`](../classes/EntityForm.md)

Defined in: [listgrid/components/list/types/SubCollectionButtons.type.ts:16](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/SubCollectionButtons.type.ts#L16)

***

### onRefresh

> **onRefresh**: () => `void`

Defined in: [listgrid/components/list/types/SubCollectionButtons.type.ts:17](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/SubCollectionButtons.type.ts#L17)

#### Returns

`void`

***

### parentId

> **parentId**: `any`

Defined in: [listgrid/components/list/types/SubCollectionButtons.type.ts:18](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/SubCollectionButtons.type.ts#L18)

***

### checkedItems?

> `optional` **checkedItems?**: `string`[]

Defined in: [listgrid/components/list/types/SubCollectionButtons.type.ts:19](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/SubCollectionButtons.type.ts#L19)

***

### onChangeSearchForm

> **onChangeSearchForm**: (`searchForm`, `reset?`, `resetPage?`) => `void`

Defined in: [listgrid/components/list/types/SubCollectionButtons.type.ts:20](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/SubCollectionButtons.type.ts#L20)

#### Parameters

##### searchForm

[`SearchForm`](../classes/SearchForm.md)

##### reset?

`boolean`

##### resetPage?

`boolean`

#### Returns

`void`

***

### searchForm

> **searchForm**: [`SearchForm`](../classes/SearchForm.md)

Defined in: [listgrid/components/list/types/SubCollectionButtons.type.ts:21](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/SubCollectionButtons.type.ts#L21)

***

### totalCount

> **totalCount**: `number`

Defined in: [listgrid/components/list/types/SubCollectionButtons.type.ts:22](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/SubCollectionButtons.type.ts#L22)
