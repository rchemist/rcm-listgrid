[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ExportServiceProps

# Interface: ExportServiceProps

Defined in: [listgrid/transfer/DataExportService.ts:47](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/DataExportService.ts#L47)

## Properties

### searchForm?

> `optional` **searchForm?**: [`SearchForm`](../classes/SearchForm.md)

Defined in: [listgrid/transfer/DataExportService.ts:48](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/DataExportService.ts#L48)

***

### url?

> `optional` **url?**: `string`

Defined in: [listgrid/transfer/DataExportService.ts:49](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/DataExportService.ts#L49)

***

### fields

> **fields**: [`DataField`](../classes/DataField.md)[]

Defined in: [listgrid/transfer/DataExportService.ts:50](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/DataExportService.ts#L50)

***

### restrictCount?

> `optional` **restrictCount?**: `number`

Defined in: [listgrid/transfer/DataExportService.ts:51](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/DataExportService.ts#L51)

***

### pagePerCount?

> `optional` **pagePerCount?**: `number`

Defined in: [listgrid/transfer/DataExportService.ts:52](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/DataExportService.ts#L52)

***

### setExportable?

> `optional` **setExportable?**: (`exportable`) => `void`

Defined in: [listgrid/transfer/DataExportService.ts:53](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/DataExportService.ts#L53)

#### Parameters

##### exportable

`boolean`

#### Returns

`void`

***

### setFailedCount?

> `optional` **setFailedCount?**: (`count`) => `void`

Defined in: [listgrid/transfer/DataExportService.ts:54](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/DataExportService.ts#L54)

#### Parameters

##### count

`number`

#### Returns

`void`

***

### setProgress?

> `optional` **setProgress?**: (`progress`) => `void`

Defined in: [listgrid/transfer/DataExportService.ts:55](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/DataExportService.ts#L55)

#### Parameters

##### progress

`number`

#### Returns

`void`

***

### data?

> `optional` **data?**: [`SampleDataItem`](../type-aliases/SampleDataItem.md)[][]

Defined in: [listgrid/transfer/DataExportService.ts:56](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/DataExportService.ts#L56)

***

### setData?

> `optional` **setData?**: (`data`) => `void`

Defined in: [listgrid/transfer/DataExportService.ts:57](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/DataExportService.ts#L57)

#### Parameters

##### data

[`DataRowSet`](../type-aliases/DataRowSet.md)

#### Returns

`void`

***

### setError?

> `optional` **setError?**: (`errorMessage`) => `void`

Defined in: [listgrid/transfer/DataExportService.ts:58](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/DataExportService.ts#L58)

#### Parameters

##### errorMessage

`string`

#### Returns

`void`

***

### editorFields?

> `optional` **editorFields?**: `string`[]

Defined in: [listgrid/transfer/DataExportService.ts:59](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/DataExportService.ts#L59)

***

### addedFields?

> `optional` **addedFields?**: (`row`) => `Promise`\<[`DataRow`](../type-aliases/DataRow.md)\>

Defined in: [listgrid/transfer/DataExportService.ts:60](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/DataExportService.ts#L60)

#### Parameters

##### row

[`DataRow`](../type-aliases/DataRow.md)

#### Returns

`Promise`\<[`DataRow`](../type-aliases/DataRow.md)\>
