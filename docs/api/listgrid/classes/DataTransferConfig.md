[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / DataTransferConfig

# Class: DataTransferConfig

Defined in: [listgrid/transfer/Type.ts:186](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L186)

## Implements

- [`IDataTransferConfig`](../interfaces/IDataTransferConfig.md)

## Constructors

### Constructor

> **new DataTransferConfig**(`data`, `url`): `DataTransferConfig`

Defined in: [listgrid/transfer/Type.ts:193](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L193)

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

Defined in: [listgrid/transfer/Type.ts:187](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L187)

#### Implementation of

[`IDataTransferConfig`](../interfaces/IDataTransferConfig.md).[`type`](../interfaces/IDataTransferConfig.md#type)

***

### export?

> `optional` **export?**: [`ExportTransferConfig`](../interfaces/ExportTransferConfig.md)

Defined in: [listgrid/transfer/Type.ts:188](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L188)

#### Implementation of

[`IDataTransferConfig`](../interfaces/IDataTransferConfig.md).[`export`](../interfaces/IDataTransferConfig.md#export)

***

### import?

> `optional` **import?**: [`ImportTransferConfig`](../interfaces/ImportTransferConfig.md)

Defined in: [listgrid/transfer/Type.ts:189](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L189)

#### Implementation of

[`IDataTransferConfig`](../interfaces/IDataTransferConfig.md).[`import`](../interfaces/IDataTransferConfig.md#import)

***

### exportFileName?

> `optional` **exportFileName?**: `string`

Defined in: [listgrid/transfer/Type.ts:191](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L191)

#### Implementation of

[`IDataTransferConfig`](../interfaces/IDataTransferConfig.md).[`exportFileName`](../interfaces/IDataTransferConfig.md#exportfilename)

## Methods

### isSupportExport()

> **isSupportExport**(): `boolean`

Defined in: [listgrid/transfer/Type.ts:217](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L217)

#### Returns

`boolean`

***

### isSupportImport()

> **isSupportImport**(): `boolean`

Defined in: [listgrid/transfer/Type.ts:221](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L221)

#### Returns

`boolean`

***

### withExportableFields()

> **withExportableFields**(...`exportableFields`): `DataTransferConfig`

Defined in: [listgrid/transfer/Type.ts:229](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L229)

#### Parameters

##### exportableFields

...[`DataField`](DataField.md)[]

#### Returns

`DataTransferConfig`

***

### withImportableFields()

> **withImportableFields**(...`importableFields`): `DataTransferConfig`

Defined in: [listgrid/transfer/Type.ts:238](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L238)

#### Parameters

##### importableFields

...[`DataField`](DataField.md)[]

#### Returns

`DataTransferConfig`

***

### withExportUrl()

> **withExportUrl**(`exportUrl`): `DataTransferConfig`

Defined in: [listgrid/transfer/Type.ts:247](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L247)

#### Parameters

##### exportUrl

`string`

#### Returns

`DataTransferConfig`

***

### withImportUrl()

> **withImportUrl**(`importUrl`): `DataTransferConfig`

Defined in: [listgrid/transfer/Type.ts:256](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L256)

#### Parameters

##### importUrl

`string`

#### Returns

`DataTransferConfig`

***

### withExportFileName()

> **withExportFileName**(`exportFileName`): `DataTransferConfig`

Defined in: [listgrid/transfer/Type.ts:265](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L265)

#### Parameters

##### exportFileName

`string`

#### Returns

`DataTransferConfig`

***

### withImportSampleData()

> **withImportSampleData**(`importSampleData`): `DataTransferConfig`

Defined in: [listgrid/transfer/Type.ts:270](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L270)

#### Parameters

##### importSampleData

[`SampleDataItem`](../type-aliases/SampleDataItem.md)[][]

#### Returns

`DataTransferConfig`

***

### withAddedExportFields()

> **withAddedExportFields**(`addedFields?`): `DataTransferConfig`

Defined in: [listgrid/transfer/Type.ts:279](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L279)

#### Parameters

##### addedFields?

(`row`) => `Promise`\<[`DataRow`](../type-aliases/DataRow.md)\>

#### Returns

`DataTransferConfig`

***

### withAddedImportFields()

> **withAddedImportFields**(`addedFields?`): `DataTransferConfig`

Defined in: [listgrid/transfer/Type.ts:288](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L288)

#### Parameters

##### addedFields?

(`row`) => `Promise`\<[`DataRow`](../type-aliases/DataRow.md)\>

#### Returns

`DataTransferConfig`

***

### withOverrideExportFormData()

> **withOverrideExportFormData**(`overrideFormData?`): `DataTransferConfig`

Defined in: [listgrid/transfer/Type.ts:297](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L297)

#### Parameters

##### overrideFormData?

(`formData`) => `Promise`\<[`DataRowSet`](../type-aliases/DataRowSet.md)\>

#### Returns

`DataTransferConfig`

***

### withOverrideImportFormData()

> **withOverrideImportFormData**(`overrideFormData?`): `DataTransferConfig`

Defined in: [listgrid/transfer/Type.ts:308](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L308)

#### Parameters

##### overrideFormData?

(`formData`) => `Promise`\<[`DataRowSet`](../type-aliases/DataRowSet.md)\>

#### Returns

`DataTransferConfig`

***

### getExportFileName()

> **getExportFileName**(): `string`

Defined in: [listgrid/transfer/Type.ts:319](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L319)

#### Returns

`string`

***

### setDataFields()

> **setDataFields**(`dataFields`): `void`

Defined in: [listgrid/transfer/Type.ts:323](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L323)

#### Parameters

##### dataFields

[`DataField`](DataField.md)[]

#### Returns

`void`

***

### withExportDescription()

> **withExportDescription**(`description`): `DataTransferConfig`

Defined in: [listgrid/transfer/Type.ts:383](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L383)

#### Parameters

##### description

`ReactNode`

#### Returns

`DataTransferConfig`

***

### withImportDescription()

> **withImportDescription**(`description`): `DataTransferConfig`

Defined in: [listgrid/transfer/Type.ts:392](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L392)

#### Parameters

##### description

`ReactNode`

#### Returns

`DataTransferConfig`

***

### withImportOverrideParseResult()

> **withImportOverrideParseResult**(`overrideParseResult`): `DataTransferConfig`

Defined in: [listgrid/transfer/Type.ts:401](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L401)

#### Parameters

##### overrideParseResult

(`formData`, `response`) => `object`

#### Returns

`DataTransferConfig`

***

### validateDataFields()

> **validateDataFields**(`defaultFields`): `void`

Defined in: [listgrid/transfer/Type.ts:415](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L415)

#### Parameters

##### defaultFields

[`DataField`](DataField.md)[]

#### Returns

`void`
