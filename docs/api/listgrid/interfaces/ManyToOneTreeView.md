[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ManyToOneTreeView

# Interface: ManyToOneTreeView

Defined in: [listgrid/config/Config.ts:382](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/Config.ts#L382)

## Properties

### icon?

> `optional` **icon?**: `ReactNode` \| `ReactNode`[]

Defined in: [listgrid/config/Config.ts:383](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/Config.ts#L383)

***

### exceptId?

> `optional` **exceptId?**: `string`

Defined in: [listgrid/config/Config.ts:384](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/Config.ts#L384)

***

### rootSelectable?

> `optional` **rootSelectable?**: `boolean`

Defined in: [listgrid/config/Config.ts:385](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/Config.ts#L385)

***

### leafSelectable?

> `optional` **leafSelectable?**: `boolean`

Defined in: [listgrid/config/Config.ts:386](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/Config.ts#L386)

***

### fetch?

> `optional` **fetch?**: `object`

Defined in: [listgrid/config/Config.ts:387](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/Config.ts#L387)

#### url

> **url**: `string`

#### method?

> `optional` **method?**: `"GET"` \| `"POST"`

#### convert?

> `optional` **convert?**: (`item`) => `any`[]

##### Parameters

###### item

`any`

##### Returns

`any`[]

#### requestBody?

> `optional` **requestBody?**: `any`

***

### treeData?

> `optional` **treeData?**: `any`[]

Defined in: [listgrid/config/Config.ts:393](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/Config.ts#L393)

***

### onSelectConvert?

> `optional` **onSelectConvert?**: (`data`) => `any`

Defined in: [listgrid/config/Config.ts:394](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/Config.ts#L394)

#### Parameters

##### data

`any`

#### Returns

`any`
