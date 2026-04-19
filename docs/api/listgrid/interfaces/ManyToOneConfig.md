[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ManyToOneConfig

# Interface: ManyToOneConfig

Defined in: [listgrid/config/Config.ts:351](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/Config.ts#L351)

## Properties

### entityForm

> **entityForm**: [`EntityForm`](../classes/EntityForm.md)

Defined in: [listgrid/config/Config.ts:352](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/Config.ts#L352)

***

### tree?

> `optional` **tree?**: [`ManyToOneTreeView`](ManyToOneTreeView.md)

Defined in: [listgrid/config/Config.ts:353](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/Config.ts#L353)

***

### field?

> `optional` **field?**: `object`

Defined in: [listgrid/config/Config.ts:354](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/Config.ts#L354)

#### id?

> `optional` **id?**: `string`

#### name?

> `optional` **name?**: `string` \| ((`value`) => `string`)

***

### filter?

> `optional` **filter?**: [`ManyToOneFilter`](../type-aliases/ManyToOneFilter.md)[]

Defined in: [listgrid/config/Config.ts:355](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/Config.ts#L355)

***

### filterable?

> `optional` **filterable?**: `boolean`

Defined in: [listgrid/config/Config.ts:356](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/Config.ts#L356)

***

### displayFunc?

> `optional` **displayFunc?**: (`value`) => `Promise`\<`string`\>

Defined in: [listgrid/config/Config.ts:357](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/Config.ts#L357)

#### Parameters

##### value

`any`

#### Returns

`Promise`\<`string`\>

***

### fetch?

> `optional` **fetch?**: (`value`) => `Promise`\<`any`\>

Defined in: [listgrid/config/Config.ts:358](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/Config.ts#L358)

#### Parameters

##### value

`any`

#### Returns

`Promise`\<`any`\>

***

### modifiable?

> `optional` **modifiable?**: `boolean` \| \{ `roles`: `string`[]; \}

Defined in: [listgrid/config/Config.ts:359](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/Config.ts#L359)

***

### hideAdvancedSearch?

> `optional` **hideAdvancedSearch?**: `boolean`

Defined in: [listgrid/config/Config.ts:360](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/Config.ts#L360)
