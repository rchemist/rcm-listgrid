[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / DataTransferProperty

# Class: DataTransferProperty

Defined in: [listgrid/transfer/Type.ts:31](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L31)

## Implements

- [`IDataTransferProperty`](../interfaces/IDataTransferProperty.md)

## Constructors

### Constructor

> **new DataTransferProperty**(`data`): `DataTransferProperty`

Defined in: [listgrid/transfer/Type.ts:39](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L39)

#### Parameters

##### data

[`IDataTransferProperty`](../interfaces/IDataTransferProperty.md)

#### Returns

`DataTransferProperty`

## Properties

### name

> **name**: `string`

Defined in: [listgrid/transfer/Type.ts:32](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L32)

#### Implementation of

[`IDataTransferProperty`](../interfaces/IDataTransferProperty.md).[`name`](../interfaces/IDataTransferProperty.md#name)

***

### propertyName

> **propertyName**: `string`

Defined in: [listgrid/transfer/Type.ts:33](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L33)

#### Implementation of

[`IDataTransferProperty`](../interfaces/IDataTransferProperty.md).[`propertyName`](../interfaces/IDataTransferProperty.md#propertyname)

***

### helpText?

> `optional` **helpText?**: `string`

Defined in: [listgrid/transfer/Type.ts:34](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L34)

#### Implementation of

[`IDataTransferProperty`](../interfaces/IDataTransferProperty.md).[`helpText`](../interfaces/IDataTransferProperty.md#helptext)

***

### order?

> `optional` **order?**: `number`

Defined in: [listgrid/transfer/Type.ts:35](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L35)

#### Implementation of

[`IDataTransferProperty`](../interfaces/IDataTransferProperty.md).[`order`](../interfaces/IDataTransferProperty.md#order)

***

### tabId?

> `optional` **tabId?**: `string`

Defined in: [listgrid/transfer/Type.ts:36](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L36)

#### Implementation of

[`IDataTransferProperty`](../interfaces/IDataTransferProperty.md).[`tabId`](../interfaces/IDataTransferProperty.md#tabid)

***

### fieldGroupId?

> `optional` **fieldGroupId?**: `string`

Defined in: [listgrid/transfer/Type.ts:37](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L37)

#### Implementation of

[`IDataTransferProperty`](../interfaces/IDataTransferProperty.md).[`fieldGroupId`](../interfaces/IDataTransferProperty.md#fieldgroupid)

## Methods

### fromJson()

> `static` **fromJson**(`data`): `DataTransferProperty`

Defined in: [listgrid/transfer/Type.ts:48](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L48)

#### Parameters

##### data

[`IDataTransferProperty`](../interfaces/IDataTransferProperty.md)

#### Returns

`DataTransferProperty`

***

### fromJsonArray()

> `static` **fromJsonArray**(`data`): `DataTransferProperty`[]

Defined in: [listgrid/transfer/Type.ts:52](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L52)

#### Parameters

##### data

[`IDataTransferProperty`](../interfaces/IDataTransferProperty.md)[]

#### Returns

`DataTransferProperty`[]

***

### withHelpText()

> **withHelpText**(`helpText`): `DataTransferProperty`

Defined in: [listgrid/transfer/Type.ts:56](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L56)

#### Parameters

##### helpText

`string`

#### Returns

`DataTransferProperty`

***

### withOrder()

> **withOrder**(`order`): `DataTransferProperty`

Defined in: [listgrid/transfer/Type.ts:61](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L61)

#### Parameters

##### order

`number`

#### Returns

`DataTransferProperty`

***

### withTabId()

> **withTabId**(`tabId`): `DataTransferProperty`

Defined in: [listgrid/transfer/Type.ts:66](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L66)

#### Parameters

##### tabId

`string`

#### Returns

`DataTransferProperty`

***

### withFieldGroupId()

> **withFieldGroupId**(`fieldGroupId`): `DataTransferProperty`

Defined in: [listgrid/transfer/Type.ts:71](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L71)

#### Parameters

##### fieldGroupId

`string`

#### Returns

`DataTransferProperty`

***

### isConfigured()

> **isConfigured**(...`configuredForms`): `boolean`

Defined in: [listgrid/transfer/Type.ts:76](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L76)

#### Parameters

##### configuredForms

...`string`[]

#### Returns

`boolean`

***

### getForm()

> `static` **getForm**(`tabId`, `fieldGroupId`): `string`

Defined in: [listgrid/transfer/Type.ts:96](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L96)

#### Parameters

##### tabId

`string`

##### fieldGroupId

`string`

#### Returns

`string`
