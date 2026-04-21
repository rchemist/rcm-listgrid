[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ManyToOneConfig

# Interface: ManyToOneConfig

Defined in: [listgrid/config/Config.ts:344](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/Config.ts#L344)

## Properties

### entityForm

> **entityForm**: [`EntityForm`](../classes/EntityForm.md)

Defined in: [listgrid/config/Config.ts:345](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/Config.ts#L345)

***

### tree?

> `optional` **tree?**: [`ManyToOneTreeView`](ManyToOneTreeView.md)

Defined in: [listgrid/config/Config.ts:346](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/Config.ts#L346)

***

### field?

> `optional` **field?**: `object`

Defined in: [listgrid/config/Config.ts:347](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/Config.ts#L347)

#### id?

> `optional` **id?**: `string`

#### name?

> `optional` **name?**: `string` \| ((`value`) => `string`)

***

### filter?

> `optional` **filter?**: [`ManyToOneFilter`](../type-aliases/ManyToOneFilter.md)[]

Defined in: [listgrid/config/Config.ts:348](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/Config.ts#L348)

***

### filterable?

> `optional` **filterable?**: `boolean`

Defined in: [listgrid/config/Config.ts:349](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/Config.ts#L349)

***

### displayFunc?

> `optional` **displayFunc?**: (`value`) => `Promise`\<`string`\>

Defined in: [listgrid/config/Config.ts:350](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/Config.ts#L350)

#### Parameters

##### value

`any`

#### Returns

`Promise`\<`string`\>

***

### fetch?

> `optional` **fetch?**: (`value`) => `Promise`\<`any`\>

Defined in: [listgrid/config/Config.ts:351](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/Config.ts#L351)

#### Parameters

##### value

`any`

#### Returns

`Promise`\<`any`\>

***

### modifiable?

> `optional` **modifiable?**: `boolean` \| \{ `roles`: `string`[]; \}

Defined in: [listgrid/config/Config.ts:352](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/Config.ts#L352)

***

### hideAdvancedSearch?

> `optional` **hideAdvancedSearch?**: `boolean`

Defined in: [listgrid/config/Config.ts:353](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/Config.ts#L353)
