[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / DataTransferProperty

# Class: DataTransferProperty

Defined in: [listgrid/transfer/Type.ts:24](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L24)

## Implements

- [`IDataTransferProperty`](../interfaces/IDataTransferProperty.md)

## Constructors

### Constructor

> **new DataTransferProperty**(`data`): `DataTransferProperty`

Defined in: [listgrid/transfer/Type.ts:32](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L32)

#### Parameters

##### data

[`IDataTransferProperty`](../interfaces/IDataTransferProperty.md)

#### Returns

`DataTransferProperty`

## Properties

### name

> **name**: `string`

Defined in: [listgrid/transfer/Type.ts:25](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L25)

#### Implementation of

[`IDataTransferProperty`](../interfaces/IDataTransferProperty.md).[`name`](../interfaces/IDataTransferProperty.md#name)

***

### propertyName

> **propertyName**: `string`

Defined in: [listgrid/transfer/Type.ts:26](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L26)

#### Implementation of

[`IDataTransferProperty`](../interfaces/IDataTransferProperty.md).[`propertyName`](../interfaces/IDataTransferProperty.md#propertyname)

***

### helpText?

> `optional` **helpText?**: `string`

Defined in: [listgrid/transfer/Type.ts:27](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L27)

#### Implementation of

[`IDataTransferProperty`](../interfaces/IDataTransferProperty.md).[`helpText`](../interfaces/IDataTransferProperty.md#helptext)

***

### order?

> `optional` **order?**: `number`

Defined in: [listgrid/transfer/Type.ts:28](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L28)

#### Implementation of

[`IDataTransferProperty`](../interfaces/IDataTransferProperty.md).[`order`](../interfaces/IDataTransferProperty.md#order)

***

### tabId?

> `optional` **tabId?**: `string`

Defined in: [listgrid/transfer/Type.ts:29](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L29)

#### Implementation of

[`IDataTransferProperty`](../interfaces/IDataTransferProperty.md).[`tabId`](../interfaces/IDataTransferProperty.md#tabid)

***

### fieldGroupId?

> `optional` **fieldGroupId?**: `string`

Defined in: [listgrid/transfer/Type.ts:30](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L30)

#### Implementation of

[`IDataTransferProperty`](../interfaces/IDataTransferProperty.md).[`fieldGroupId`](../interfaces/IDataTransferProperty.md#fieldgroupid)

## Methods

### fromJson()

> `static` **fromJson**(`data`): `DataTransferProperty`

Defined in: [listgrid/transfer/Type.ts:41](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L41)

#### Parameters

##### data

[`IDataTransferProperty`](../interfaces/IDataTransferProperty.md)

#### Returns

`DataTransferProperty`

***

### fromJsonArray()

> `static` **fromJsonArray**(`data`): `DataTransferProperty`[]

Defined in: [listgrid/transfer/Type.ts:45](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L45)

#### Parameters

##### data

[`IDataTransferProperty`](../interfaces/IDataTransferProperty.md)[]

#### Returns

`DataTransferProperty`[]

***

### withHelpText()

> **withHelpText**(`helpText`): `DataTransferProperty`

Defined in: [listgrid/transfer/Type.ts:49](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L49)

#### Parameters

##### helpText

`string`

#### Returns

`DataTransferProperty`

***

### withOrder()

> **withOrder**(`order`): `DataTransferProperty`

Defined in: [listgrid/transfer/Type.ts:54](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L54)

#### Parameters

##### order

`number`

#### Returns

`DataTransferProperty`

***

### withTabId()

> **withTabId**(`tabId`): `DataTransferProperty`

Defined in: [listgrid/transfer/Type.ts:59](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L59)

#### Parameters

##### tabId

`string`

#### Returns

`DataTransferProperty`

***

### withFieldGroupId()

> **withFieldGroupId**(`fieldGroupId`): `DataTransferProperty`

Defined in: [listgrid/transfer/Type.ts:64](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L64)

#### Parameters

##### fieldGroupId

`string`

#### Returns

`DataTransferProperty`

***

### isConfigured()

> **isConfigured**(...`configuredForms`): `boolean`

Defined in: [listgrid/transfer/Type.ts:69](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L69)

#### Parameters

##### configuredForms

...`string`[]

#### Returns

`boolean`

***

### getForm()

> `static` **getForm**(`tabId`, `fieldGroupId`): `string`

Defined in: [listgrid/transfer/Type.ts:89](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L89)

#### Parameters

##### tabId

`string`

##### fieldGroupId

`string`

#### Returns

`string`
