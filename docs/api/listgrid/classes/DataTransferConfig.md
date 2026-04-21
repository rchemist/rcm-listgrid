[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / DataTransferConfig

# Class: DataTransferConfig

Defined in: [listgrid/transfer/Type.ts:179](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L179)

## Implements

- [`IDataTransferConfig`](../interfaces/IDataTransferConfig.md)

## Constructors

### Constructor

> **new DataTransferConfig**(`data`, `url`): `DataTransferConfig`

Defined in: [listgrid/transfer/Type.ts:186](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L186)

#### Parameters

##### data

[`IDataTransferConfig`](../interfaces/IDataTransferConfig.md)

##### url

`string`

#### Returns

`DataTransferConfig`

## Properties

### type

> **type**: [`DataManageType`](../interfaces/DataManageType.md)

Defined in: [listgrid/transfer/Type.ts:180](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L180)

#### Implementation of

[`IDataTransferConfig`](../interfaces/IDataTransferConfig.md).[`type`](../interfaces/IDataTransferConfig.md#type)

***

### export?

> `optional` **export?**: [`ExportTransferConfig`](../interfaces/ExportTransferConfig.md)

Defined in: [listgrid/transfer/Type.ts:181](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L181)

#### Implementation of

[`IDataTransferConfig`](../interfaces/IDataTransferConfig.md).[`export`](../interfaces/IDataTransferConfig.md#export)

***

### import?

> `optional` **import?**: [`ImportTransferConfig`](../interfaces/ImportTransferConfig.md)

Defined in: [listgrid/transfer/Type.ts:182](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L182)

#### Implementation of

[`IDataTransferConfig`](../interfaces/IDataTransferConfig.md).[`import`](../interfaces/IDataTransferConfig.md#import)

***

### exportFileName?

> `optional` **exportFileName?**: `string`

Defined in: [listgrid/transfer/Type.ts:184](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L184)

#### Implementation of

[`IDataTransferConfig`](../interfaces/IDataTransferConfig.md).[`exportFileName`](../interfaces/IDataTransferConfig.md#exportfilename)

## Methods

### isSupportExport()

> **isSupportExport**(): `boolean`

Defined in: [listgrid/transfer/Type.ts:210](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L210)

#### Returns

`boolean`

***

### isSupportImport()

> **isSupportImport**(): `boolean`

Defined in: [listgrid/transfer/Type.ts:214](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L214)

#### Returns

`boolean`

***

### withExportableFields()

> **withExportableFields**(...`exportableFields`): `DataTransferConfig`

Defined in: [listgrid/transfer/Type.ts:222](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L222)

#### Parameters

##### exportableFields

...[`DataField`](DataField.md)[]

#### Returns

`DataTransferConfig`

***

### withImportableFields()

> **withImportableFields**(...`importableFields`): `DataTransferConfig`

Defined in: [listgrid/transfer/Type.ts:231](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L231)

#### Parameters

##### importableFields

...[`DataField`](DataField.md)[]

#### Returns

`DataTransferConfig`

***

### withExportUrl()

> **withExportUrl**(`exportUrl`): `DataTransferConfig`

Defined in: [listgrid/transfer/Type.ts:240](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L240)

#### Parameters

##### exportUrl

`string`

#### Returns

`DataTransferConfig`

***

### withImportUrl()

> **withImportUrl**(`importUrl`): `DataTransferConfig`

Defined in: [listgrid/transfer/Type.ts:249](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L249)

#### Parameters

##### importUrl

`string`

#### Returns

`DataTransferConfig`

***

### withExportFileName()

> **withExportFileName**(`exportFileName`): `DataTransferConfig`

Defined in: [listgrid/transfer/Type.ts:258](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L258)

#### Parameters

##### exportFileName

`string`

#### Returns

`DataTransferConfig`

***

### withImportSampleData()

> **withImportSampleData**(`importSampleData`): `DataTransferConfig`

Defined in: [listgrid/transfer/Type.ts:263](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L263)

#### Parameters

##### importSampleData

[`SampleDataItem`](../type-aliases/SampleDataItem.md)[][]

#### Returns

`DataTransferConfig`

***

### withAddedExportFields()

> **withAddedExportFields**(`addedFields?`): `DataTransferConfig`

Defined in: [listgrid/transfer/Type.ts:272](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L272)

#### Parameters

##### addedFields?

(`row`) => `Promise`\<[`DataRow`](../type-aliases/DataRow.md)\>

#### Returns

`DataTransferConfig`

***

### withAddedImportFields()

> **withAddedImportFields**(`addedFields?`): `DataTransferConfig`

Defined in: [listgrid/transfer/Type.ts:281](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L281)

#### Parameters

##### addedFields?

(`row`) => `Promise`\<[`DataRow`](../type-aliases/DataRow.md)\>

#### Returns

`DataTransferConfig`

***

### withOverrideExportFormData()

> **withOverrideExportFormData**(`overrideFormData?`): `DataTransferConfig`

Defined in: [listgrid/transfer/Type.ts:290](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L290)

#### Parameters

##### overrideFormData?

(`formData`) => `Promise`\<[`DataRowSet`](../type-aliases/DataRowSet.md)\>

#### Returns

`DataTransferConfig`

***

### withOverrideImportFormData()

> **withOverrideImportFormData**(`overrideFormData?`): `DataTransferConfig`

Defined in: [listgrid/transfer/Type.ts:301](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L301)

#### Parameters

##### overrideFormData?

(`formData`) => `Promise`\<[`DataRowSet`](../type-aliases/DataRowSet.md)\>

#### Returns

`DataTransferConfig`

***

### getExportFileName()

> **getExportFileName**(): `string`

Defined in: [listgrid/transfer/Type.ts:312](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L312)

#### Returns

`string`

***

### setDataFields()

> **setDataFields**(`dataFields`): `void`

Defined in: [listgrid/transfer/Type.ts:316](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L316)

#### Parameters

##### dataFields

[`DataField`](DataField.md)[]

#### Returns

`void`

***

### withExportDescription()

> **withExportDescription**(`description`): `DataTransferConfig`

Defined in: [listgrid/transfer/Type.ts:376](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L376)

#### Parameters

##### description

`ReactNode`

#### Returns

`DataTransferConfig`

***

### withImportDescription()

> **withImportDescription**(`description`): `DataTransferConfig`

Defined in: [listgrid/transfer/Type.ts:385](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L385)

#### Parameters

##### description

`ReactNode`

#### Returns

`DataTransferConfig`

***

### withImportOverrideParseResult()

> **withImportOverrideParseResult**(`overrideParseResult`): `DataTransferConfig`

Defined in: [listgrid/transfer/Type.ts:394](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L394)

#### Parameters

##### overrideParseResult

(`formData`, `response`) => `object`

#### Returns

`DataTransferConfig`

***

### validateDataFields()

> **validateDataFields**(`defaultFields`): `void`

Defined in: [listgrid/transfer/Type.ts:408](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L408)

#### Parameters

##### defaultFields

[`DataField`](DataField.md)[]

#### Returns

`void`
