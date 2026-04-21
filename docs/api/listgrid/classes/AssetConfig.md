[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / AssetConfig

# Class: AssetConfig

Defined in: [listgrid/config/Config.ts:413](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/Config.ts#L413)

## Implements

- [`IAssetConfig`](../interfaces/IAssetConfig.md)

## Constructors

### Constructor

> **new AssetConfig**(): `AssetConfig`

#### Returns

`AssetConfig`

## Properties

### maxSize?

> `optional` **maxSize?**: `number`

Defined in: [listgrid/config/Config.ts:414](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/Config.ts#L414)

#### Implementation of

[`IAssetConfig`](../interfaces/IAssetConfig.md).[`maxSize`](../interfaces/IAssetConfig.md#maxsize)

***

### maxCount?

> `optional` **maxCount?**: `number`

Defined in: [listgrid/config/Config.ts:415](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/Config.ts#L415)

#### Implementation of

[`IAssetConfig`](../interfaces/IAssetConfig.md).[`maxCount`](../interfaces/IAssetConfig.md#maxcount)

***

### extensions?

> `optional` **extensions?**: `string`[]

Defined in: [listgrid/config/Config.ts:416](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/Config.ts#L416)

#### Implementation of

[`IAssetConfig`](../interfaces/IAssetConfig.md).[`extensions`](../interfaces/IAssetConfig.md#extensions)

## Methods

### create()

> `static` **create**(`maxSize?`, `maxCount?`, ...`extensions`): `AssetConfig`

Defined in: [listgrid/config/Config.ts:418](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/Config.ts#L418)

#### Parameters

##### maxSize?

`number`

##### maxCount?

`number`

##### extensions

...`string`[]

#### Returns

`AssetConfig`

***

### withMaxSize()

> **withMaxSize**(`maxSize?`): `AssetConfig`

Defined in: [listgrid/config/Config.ts:425](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/Config.ts#L425)

#### Parameters

##### maxSize?

`number`

#### Returns

`AssetConfig`

***

### withMaxCount()

> **withMaxCount**(`maxCount?`): `AssetConfig`

Defined in: [listgrid/config/Config.ts:430](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/Config.ts#L430)

#### Parameters

##### maxCount?

`number`

#### Returns

`AssetConfig`

***

### withExtensions()

> **withExtensions**(...`extensions`): `AssetConfig`

Defined in: [listgrid/config/Config.ts:435](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/Config.ts#L435)

#### Parameters

##### extensions

...`string`[]

#### Returns

`AssetConfig`
