[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / AssetConfig

# Class: AssetConfig

Defined in: [listgrid/config/Config.ts:420](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/Config.ts#L420)

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

Defined in: [listgrid/config/Config.ts:421](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/Config.ts#L421)

#### Implementation of

[`IAssetConfig`](../interfaces/IAssetConfig.md).[`maxSize`](../interfaces/IAssetConfig.md#maxsize)

***

### maxCount?

> `optional` **maxCount?**: `number`

Defined in: [listgrid/config/Config.ts:422](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/Config.ts#L422)

#### Implementation of

[`IAssetConfig`](../interfaces/IAssetConfig.md).[`maxCount`](../interfaces/IAssetConfig.md#maxcount)

***

### extensions?

> `optional` **extensions?**: `string`[]

Defined in: [listgrid/config/Config.ts:423](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/Config.ts#L423)

#### Implementation of

[`IAssetConfig`](../interfaces/IAssetConfig.md).[`extensions`](../interfaces/IAssetConfig.md#extensions)

## Methods

### create()

> `static` **create**(`maxSize?`, `maxCount?`, ...`extensions`): `AssetConfig`

Defined in: [listgrid/config/Config.ts:425](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/Config.ts#L425)

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

Defined in: [listgrid/config/Config.ts:432](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/Config.ts#L432)

#### Parameters

##### maxSize?

`number`

#### Returns

`AssetConfig`

***

### withMaxCount()

> **withMaxCount**(`maxCount?`): `AssetConfig`

Defined in: [listgrid/config/Config.ts:437](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/Config.ts#L437)

#### Parameters

##### maxCount?

`number`

#### Returns

`AssetConfig`

***

### withExtensions()

> **withExtensions**(...`extensions`): `AssetConfig`

Defined in: [listgrid/config/Config.ts:442](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/Config.ts#L442)

#### Parameters

##### extensions

...`string`[]

#### Returns

`AssetConfig`
