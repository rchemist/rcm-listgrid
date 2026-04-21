[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ImportTransferConfig

# Interface: ImportTransferConfig

Defined in: [listgrid/transfer/Type.ts:140](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L140)

## Extends

- [`TransferConfig`](TransferConfig.md)

## Properties

### sampleData?

> `optional` **sampleData?**: [`SampleDataItem`](../type-aliases/SampleDataItem.md)[][]

Defined in: [listgrid/transfer/Type.ts:142](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L142)

***

### overrideParseResult?

> `optional` **overrideParseResult?**: (`formData`, `response`) => `object`

Defined in: [listgrid/transfer/Type.ts:145](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L145)

#### Parameters

##### formData

[`DataRowSet`](../type-aliases/DataRowSet.md)

##### response

`unknown`

#### Returns

`object`

##### success

> **success**: `boolean`

##### result

> **result**: [`DataTransferResult`](DataTransferResult.md)

##### error?

> `optional` **error?**: `string`

##### errorView?

> `optional` **errorView?**: `ReactNode`

***

### mode?

> `optional` **mode?**: `object`

Defined in: [listgrid/transfer/Type.ts:152](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L152)

#### create?

> `optional` **create?**: `boolean`

#### update?

> `optional` **update?**: `boolean`

***

### fields?

> `optional` **fields?**: [`DataField`](../classes/DataField.md)[]

Defined in: [listgrid/transfer/Type.ts:163](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L163)

#### Inherited from

[`TransferConfig`](TransferConfig.md).[`fields`](TransferConfig.md#fields)

***

### url?

> `optional` **url?**: `string`

Defined in: [listgrid/transfer/Type.ts:166](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L166)

#### Inherited from

[`TransferConfig`](TransferConfig.md).[`url`](TransferConfig.md#url)

***

### description?

> `optional` **description?**: `ReactNode`

Defined in: [listgrid/transfer/Type.ts:169](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L169)

#### Inherited from

[`TransferConfig`](TransferConfig.md).[`description`](TransferConfig.md#description)

***

### addedFields?

> `optional` **addedFields?**: (`row`) => `Promise`\<[`DataRow`](../type-aliases/DataRow.md)\>

Defined in: [listgrid/transfer/Type.ts:173](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L173)

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

Defined in: [listgrid/transfer/Type.ts:176](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L176)

#### Parameters

##### formData

[`DataRowSet`](../type-aliases/DataRowSet.md)

#### Returns

`Promise`\<[`DataRowSet`](../type-aliases/DataRowSet.md)\>

#### Inherited from

[`TransferConfig`](TransferConfig.md).[`overrideFormData`](TransferConfig.md#overrideformdata)
