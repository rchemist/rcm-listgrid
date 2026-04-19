[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ManyToOneTreeView

# Interface: ManyToOneTreeView

Defined in: [listgrid/config/Config.ts:389](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/Config.ts#L389)

## Properties

### icon?

> `optional` **icon?**: `ReactNode` \| `ReactNode`[]

Defined in: [listgrid/config/Config.ts:390](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/Config.ts#L390)

***

### exceptId?

> `optional` **exceptId?**: `string`

Defined in: [listgrid/config/Config.ts:391](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/Config.ts#L391)

***

### rootSelectable?

> `optional` **rootSelectable?**: `boolean`

Defined in: [listgrid/config/Config.ts:392](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/Config.ts#L392)

***

### leafSelectable?

> `optional` **leafSelectable?**: `boolean`

Defined in: [listgrid/config/Config.ts:393](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/Config.ts#L393)

***

### fetch?

> `optional` **fetch?**: `object`

Defined in: [listgrid/config/Config.ts:394](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/Config.ts#L394)

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

Defined in: [listgrid/config/Config.ts:400](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/Config.ts#L400)

***

### onSelectConvert?

> `optional` **onSelectConvert?**: (`data`) => `any`

Defined in: [listgrid/config/Config.ts:401](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/Config.ts#L401)

#### Parameters

##### data

`any`

#### Returns

`any`
