[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / DataExportService

# Class: DataExportService

Defined in: [listgrid/transfer/DataExportService.ts:56](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/DataExportService.ts#L56)

## Constructors

### Constructor

> **new DataExportService**(`__namedParameters`): `DataExportService`

Defined in: [listgrid/transfer/DataExportService.ts:74](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/DataExportService.ts#L74)

#### Parameters

##### \_\_namedParameters

[`ExportServiceProps`](../interfaces/ExportServiceProps.md)

#### Returns

`DataExportService`

## Properties

### searchForm?

> `optional` **searchForm?**: [`SearchForm`](SearchForm.md)

Defined in: [listgrid/transfer/DataExportService.ts:57](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/DataExportService.ts#L57)

***

### url?

> `optional` **url?**: `string`

Defined in: [listgrid/transfer/DataExportService.ts:58](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/DataExportService.ts#L58)

***

### fields

> **fields**: [`DataField`](DataField.md)[]

Defined in: [listgrid/transfer/DataExportService.ts:59](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/DataExportService.ts#L59)

***

### restrictCount

> **restrictCount**: `number`

Defined in: [listgrid/transfer/DataExportService.ts:60](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/DataExportService.ts#L60)

***

### pagePerCount

> **pagePerCount**: `number`

Defined in: [listgrid/transfer/DataExportService.ts:61](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/DataExportService.ts#L61)

***

### setExportable

> **setExportable**: (`exportable`) => `void`

Defined in: [listgrid/transfer/DataExportService.ts:62](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/DataExportService.ts#L62)

#### Parameters

##### exportable

`boolean`

#### Returns

`void`

***

### setFailedCount

> **setFailedCount**: (`count`) => `void`

Defined in: [listgrid/transfer/DataExportService.ts:63](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/DataExportService.ts#L63)

#### Parameters

##### count

`number`

#### Returns

`void`

***

### setProgress

> **setProgress**: (`progress`) => `void`

Defined in: [listgrid/transfer/DataExportService.ts:64](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/DataExportService.ts#L64)

#### Parameters

##### progress

`number`

#### Returns

`void`

***

### data

> **data**: [`SampleDataItem`](../type-aliases/SampleDataItem.md)[][]

Defined in: [listgrid/transfer/DataExportService.ts:65](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/DataExportService.ts#L65)

***

### setData

> **setData**: (`data`) => `void`

Defined in: [listgrid/transfer/DataExportService.ts:66](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/DataExportService.ts#L66)

#### Parameters

##### data

[`DataRowSet`](../type-aliases/DataRowSet.md)

#### Returns

`void`

***

### setError

> **setError**: (`errorMessage`) => `void`

Defined in: [listgrid/transfer/DataExportService.ts:67](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/DataExportService.ts#L67)

#### Parameters

##### errorMessage

`string`

#### Returns

`void`

***

### processing

> **processing**: `boolean` = `false`

Defined in: [listgrid/transfer/DataExportService.ts:69](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/DataExportService.ts#L69)

***

### total?

> `optional` **total?**: [`DataExportCount`](../interfaces/DataExportCount.md)

Defined in: [listgrid/transfer/DataExportService.ts:70](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/DataExportService.ts#L70)

***

### editorFields

> **editorFields**: `string`[] = `[]`

Defined in: [listgrid/transfer/DataExportService.ts:71](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/DataExportService.ts#L71)

***

### addedFields?

> `optional` **addedFields?**: (`row`) => `Promise`\<[`DataRow`](../type-aliases/DataRow.md)\>

Defined in: [listgrid/transfer/DataExportService.ts:72](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/DataExportService.ts#L72)

#### Parameters

##### row

[`DataRow`](../type-aliases/DataRow.md)

#### Returns

`Promise`\<[`DataRow`](../type-aliases/DataRow.md)\>

## Methods

### process()

> **process**(): (() => `void`) \| `undefined`

Defined in: [listgrid/transfer/DataExportService.ts:127](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/DataExportService.ts#L127)

#### Returns

(() => `void`) \| `undefined`
