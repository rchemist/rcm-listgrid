[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ExportTransferConfig

# Interface: ExportTransferConfig

Defined in: [listgrid/transfer/Type.ts:167](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L167)

## Extends

- [`TransferConfig`](TransferConfig.md)

## Properties

### fields?

> `optional` **fields?**: [`DataField`](../classes/DataField.md)[]

Defined in: [listgrid/transfer/Type.ts:170](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L170)

#### Inherited from

[`TransferConfig`](TransferConfig.md).[`fields`](TransferConfig.md#fields)

***

### url?

> `optional` **url?**: `string`

Defined in: [listgrid/transfer/Type.ts:173](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L173)

#### Inherited from

[`TransferConfig`](TransferConfig.md).[`url`](TransferConfig.md#url)

***

### description?

> `optional` **description?**: `ReactNode`

Defined in: [listgrid/transfer/Type.ts:176](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L176)

#### Inherited from

[`TransferConfig`](TransferConfig.md).[`description`](TransferConfig.md#description)

***

### addedFields?

> `optional` **addedFields?**: (`row`) => `Promise`\<[`DataRow`](../type-aliases/DataRow.md)\>

Defined in: [listgrid/transfer/Type.ts:180](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L180)

#### Parameters

##### row

[`DataRow`](../type-aliases/DataRow.md)

#### Returns

`Promise`\<[`DataRow`](../type-aliases/DataRow.md)\>

#### Inherited from

[`TransferConfig`](TransferConfig.md).[`addedFields`](TransferConfig.md#addedfields)

***

### overrideFormData?

> `optional` **overrideFormData?**: (`formData`) => `Promise`\<[`DataRowSet`](../type-aliases/DataRowSet.md)\>

Defined in: [listgrid/transfer/Type.ts:183](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L183)

#### Parameters

##### formData

[`DataRowSet`](../type-aliases/DataRowSet.md)

#### Returns

`Promise`\<[`DataRowSet`](../type-aliases/DataRowSet.md)\>

#### Inherited from

[`TransferConfig`](TransferConfig.md).[`overrideFormData`](TransferConfig.md#overrideformdata)
