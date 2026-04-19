[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / DataExportService

# Class: DataExportService

Defined in: [listgrid/transfer/DataExportService.ts:63](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/DataExportService.ts#L63)

## Constructors

### Constructor

> **new DataExportService**(`__namedParameters`): `DataExportService`

Defined in: [listgrid/transfer/DataExportService.ts:81](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/DataExportService.ts#L81)

#### Parameters

##### \_\_namedParameters

[`ExportServiceProps`](../interfaces/ExportServiceProps.md)

#### Returns

`DataExportService`

## Properties

### searchForm?

> `optional` **searchForm?**: [`SearchForm`](SearchForm.md)

Defined in: [listgrid/transfer/DataExportService.ts:64](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/DataExportService.ts#L64)

***

### url?

> `optional` **url?**: `string`

Defined in: [listgrid/transfer/DataExportService.ts:65](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/DataExportService.ts#L65)

***

### fields

> **fields**: [`DataField`](DataField.md)[]

Defined in: [listgrid/transfer/DataExportService.ts:66](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/DataExportService.ts#L66)

***

### restrictCount

> **restrictCount**: `number`

Defined in: [listgrid/transfer/DataExportService.ts:67](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/DataExportService.ts#L67)

***

### pagePerCount

> **pagePerCount**: `number`

Defined in: [listgrid/transfer/DataExportService.ts:68](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/DataExportService.ts#L68)

***

### setExportable

> **setExportable**: (`exportable`) => `void`

Defined in: [listgrid/transfer/DataExportService.ts:69](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/DataExportService.ts#L69)

#### Parameters

##### exportable

`boolean`

#### Returns

`void`

***

### setFailedCount

> **setFailedCount**: (`count`) => `void`

Defined in: [listgrid/transfer/DataExportService.ts:70](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/DataExportService.ts#L70)

#### Parameters

##### count

`number`

#### Returns

`void`

***

### setProgress

> **setProgress**: (`progress`) => `void`

Defined in: [listgrid/transfer/DataExportService.ts:71](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/DataExportService.ts#L71)

#### Parameters

##### progress

`number`

#### Returns

`void`

***

### data

> **data**: [`SampleDataItem`](../type-aliases/SampleDataItem.md)[][]

Defined in: [listgrid/transfer/DataExportService.ts:72](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/DataExportService.ts#L72)

***

### setData

> **setData**: (`data`) => `void`

Defined in: [listgrid/transfer/DataExportService.ts:73](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/DataExportService.ts#L73)

#### Parameters

##### data

[`DataRowSet`](../type-aliases/DataRowSet.md)

#### Returns

`void`

***

### setError

> **setError**: (`errorMessage`) => `void`

Defined in: [listgrid/transfer/DataExportService.ts:74](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/DataExportService.ts#L74)

#### Parameters

##### errorMessage

`string`

#### Returns

`void`

***

### processing

> **processing**: `boolean` = `false`

Defined in: [listgrid/transfer/DataExportService.ts:76](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/DataExportService.ts#L76)

***

### total?

> `optional` **total?**: [`DataExportCount`](../interfaces/DataExportCount.md)

Defined in: [listgrid/transfer/DataExportService.ts:77](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/DataExportService.ts#L77)

***

### editorFields

> **editorFields**: `string`[] = `[]`

Defined in: [listgrid/transfer/DataExportService.ts:78](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/DataExportService.ts#L78)

***

### addedFields?

> `optional` **addedFields?**: (`row`) => `Promise`\<[`DataRow`](../type-aliases/DataRow.md)\>

Defined in: [listgrid/transfer/DataExportService.ts:79](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/DataExportService.ts#L79)

#### Parameters

##### row

[`DataRow`](../type-aliases/DataRow.md)

#### Returns

`Promise`\<[`DataRow`](../type-aliases/DataRow.md)\>

## Methods

### process()

> **process**(): (() => `void`) \| `undefined`

Defined in: [listgrid/transfer/DataExportService.ts:134](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/DataExportService.ts#L134)

#### Returns

(() => `void`) \| `undefined`
