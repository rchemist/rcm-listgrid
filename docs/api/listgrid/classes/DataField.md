[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / DataField

# Class: DataField

Defined in: [listgrid/transfer/Type.ts:460](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L460)

## Constructors

### Constructor

> **new DataField**(`__namedParameters`): `DataField`

Defined in: [listgrid/transfer/Type.ts:469](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L469)

#### Parameters

##### \_\_namedParameters

[`DataFieldProps`](../interfaces/DataFieldProps.md)

#### Returns

`DataField`

## Methods

### create()

> `static` **create**(`props`): `DataField`

Defined in: [listgrid/transfer/Type.ts:487](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L487)

#### Parameters

##### props

[`DataFieldProps`](../interfaces/DataFieldProps.md)

#### Returns

`DataField`

***

### equals()

> **equals**(`other`): `boolean`

Defined in: [listgrid/transfer/Type.ts:491](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L491)

#### Parameters

##### other

`DataField`

#### Returns

`boolean`

***

### getName()

> **getName**(): `string`

Defined in: [listgrid/transfer/Type.ts:495](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L495)

#### Returns

`string`

***

### getLabel()

> **getLabel**(): `string`

Defined in: [listgrid/transfer/Type.ts:499](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L499)

#### Returns

`string`

***

### isRequired()

> **isRequired**(): `boolean`

Defined in: [listgrid/transfer/Type.ts:503](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L503)

#### Returns

`boolean`

***

### getType()

> **getType**(): [`FieldType`](../type-aliases/FieldType.md)

Defined in: [listgrid/transfer/Type.ts:507](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L507)

#### Returns

[`FieldType`](../type-aliases/FieldType.md)

***

### getOptions()

> **getOptions**(): [`SelectOption`](../interfaces/SelectOption.md)[]

Defined in: [listgrid/transfer/Type.ts:511](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L511)

#### Returns

[`SelectOption`](../interfaces/SelectOption.md)[]

***

### getValueOnExport()

> **getValueOnExport**(`value`): `Promise`\<`any`\>

Defined in: [listgrid/transfer/Type.ts:515](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L515)

#### Parameters

##### value

`any`

#### Returns

`Promise`\<`any`\>

***

### getValueOnImport()

> **getValueOnImport**(`value`): `Promise`\<`any`\>

Defined in: [listgrid/transfer/Type.ts:565](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L565)

#### Parameters

##### value

`any`

#### Returns

`Promise`\<`any`\>

***

### withRequired()

> **withRequired**(`required`): `DataField`

Defined in: [listgrid/transfer/Type.ts:606](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L606)

#### Parameters

##### required

`boolean`

#### Returns

`DataField`

***

### withOptions()

> **withOptions**(`options`): `DataField`

Defined in: [listgrid/transfer/Type.ts:611](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L611)

#### Parameters

##### options

[`SelectOption`](../interfaces/SelectOption.md)[]

#### Returns

`DataField`

***

### withChangeValueOnExport()

> **withChangeValueOnExport**(`changeValueOnExport`): `DataField`

Defined in: [listgrid/transfer/Type.ts:616](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L616)

#### Parameters

##### changeValueOnExport

(`value`) => `any`

#### Returns

`DataField`

***

### withChangeValueOnImport()

> **withChangeValueOnImport**(`changeValueOnImport`): `DataField`

Defined in: [listgrid/transfer/Type.ts:627](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L627)

#### Parameters

##### changeValueOnImport

(`value`) => `any`

#### Returns

`DataField`

***

### withDescription()

> **withDescription**(`description`): `DataField`

Defined in: [listgrid/transfer/Type.ts:638](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L638)

#### Parameters

##### description

`string`

#### Returns

`DataField`

***

### getDescription()

> **getDescription**(): `string`

Defined in: [listgrid/transfer/Type.ts:643](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/transfer/Type.ts#L643)

#### Returns

`string`
