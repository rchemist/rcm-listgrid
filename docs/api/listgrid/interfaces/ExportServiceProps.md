[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ExportServiceProps

# Interface: ExportServiceProps

Defined in: [listgrid/transfer/DataExportService.ts:40](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/DataExportService.ts#L40)

## Properties

### searchForm?

> `optional` **searchForm?**: [`SearchForm`](../classes/SearchForm.md)

Defined in: [listgrid/transfer/DataExportService.ts:41](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/DataExportService.ts#L41)

***

### url?

> `optional` **url?**: `string`

Defined in: [listgrid/transfer/DataExportService.ts:42](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/DataExportService.ts#L42)

***

### fields

> **fields**: [`DataField`](../classes/DataField.md)[]

Defined in: [listgrid/transfer/DataExportService.ts:43](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/DataExportService.ts#L43)

***

### restrictCount?

> `optional` **restrictCount?**: `number`

Defined in: [listgrid/transfer/DataExportService.ts:44](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/DataExportService.ts#L44)

***

### pagePerCount?

> `optional` **pagePerCount?**: `number`

Defined in: [listgrid/transfer/DataExportService.ts:45](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/DataExportService.ts#L45)

***

### setExportable?

> `optional` **setExportable?**: (`exportable`) => `void`

Defined in: [listgrid/transfer/DataExportService.ts:46](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/DataExportService.ts#L46)

#### Parameters

##### exportable

`boolean`

#### Returns

`void`

***

### setFailedCount?

> `optional` **setFailedCount?**: (`count`) => `void`

Defined in: [listgrid/transfer/DataExportService.ts:47](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/DataExportService.ts#L47)

#### Parameters

##### count

`number`

#### Returns

`void`

***

### setProgress?

> `optional` **setProgress?**: (`progress`) => `void`

Defined in: [listgrid/transfer/DataExportService.ts:48](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/DataExportService.ts#L48)

#### Parameters

##### progress

`number`

#### Returns

`void`

***

### data?

> `optional` **data?**: [`SampleDataItem`](../type-aliases/SampleDataItem.md)[][]

Defined in: [listgrid/transfer/DataExportService.ts:49](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/DataExportService.ts#L49)

***

### setData?

> `optional` **setData?**: (`data`) => `void`

Defined in: [listgrid/transfer/DataExportService.ts:50](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/DataExportService.ts#L50)

#### Parameters

##### data

[`DataRowSet`](../type-aliases/DataRowSet.md)

#### Returns

`void`

***

### setError?

> `optional` **setError?**: (`errorMessage`) => `void`

Defined in: [listgrid/transfer/DataExportService.ts:51](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/DataExportService.ts#L51)

#### Parameters

##### errorMessage

`string`

#### Returns

`void`

***

### editorFields?

> `optional` **editorFields?**: `string`[]

Defined in: [listgrid/transfer/DataExportService.ts:52](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/DataExportService.ts#L52)

***

### addedFields?

> `optional` **addedFields?**: (`row`) => `Promise`\<[`DataRow`](../type-aliases/DataRow.md)\>

Defined in: [listgrid/transfer/DataExportService.ts:53](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/DataExportService.ts#L53)

#### Parameters

##### row

[`DataRow`](../type-aliases/DataRow.md)

#### Returns

`Promise`\<[`DataRow`](../type-aliases/DataRow.md)\>
