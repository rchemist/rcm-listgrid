[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / DataField

# Class: DataField

Defined in: [listgrid/transfer/Type.ts:467](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L467)

## Constructors

### Constructor

> **new DataField**(`__namedParameters`): `DataField`

Defined in: [listgrid/transfer/Type.ts:476](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L476)

#### Parameters

##### \_\_namedParameters

[`DataFieldProps`](../interfaces/DataFieldProps.md)

#### Returns

`DataField`

## Methods

### create()

> `static` **create**(`props`): `DataField`

Defined in: [listgrid/transfer/Type.ts:494](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L494)

#### Parameters

##### props

[`DataFieldProps`](../interfaces/DataFieldProps.md)

#### Returns

`DataField`

***

### equals()

> **equals**(`other`): `boolean`

Defined in: [listgrid/transfer/Type.ts:498](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L498)

#### Parameters

##### other

`DataField`

#### Returns

`boolean`

***

### getName()

> **getName**(): `string`

Defined in: [listgrid/transfer/Type.ts:502](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L502)

#### Returns

`string`

***

### getLabel()

> **getLabel**(): `string`

Defined in: [listgrid/transfer/Type.ts:506](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L506)

#### Returns

`string`

***

### isRequired()

> **isRequired**(): `boolean`

Defined in: [listgrid/transfer/Type.ts:510](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L510)

#### Returns

`boolean`

***

### getType()

> **getType**(): [`FieldType`](../type-aliases/FieldType.md)

Defined in: [listgrid/transfer/Type.ts:514](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L514)

#### Returns

[`FieldType`](../type-aliases/FieldType.md)

***

### getOptions()

> **getOptions**(): [`SelectOption`](../interfaces/SelectOption.md)[]

Defined in: [listgrid/transfer/Type.ts:518](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L518)

#### Returns

[`SelectOption`](../interfaces/SelectOption.md)[]

***

### getValueOnExport()

> **getValueOnExport**(`value`): `Promise`\<`any`\>

Defined in: [listgrid/transfer/Type.ts:522](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L522)

#### Parameters

##### value

`any`

#### Returns

`Promise`\<`any`\>

***

### getValueOnImport()

> **getValueOnImport**(`value`): `Promise`\<`any`\>

Defined in: [listgrid/transfer/Type.ts:572](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L572)

#### Parameters

##### value

`any`

#### Returns

`Promise`\<`any`\>

***

### withRequired()

> **withRequired**(`required`): `DataField`

Defined in: [listgrid/transfer/Type.ts:613](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L613)

#### Parameters

##### required

`boolean`

#### Returns

`DataField`

***

### withOptions()

> **withOptions**(`options`): `DataField`

Defined in: [listgrid/transfer/Type.ts:618](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L618)

#### Parameters

##### options

[`SelectOption`](../interfaces/SelectOption.md)[]

#### Returns

`DataField`

***

### withChangeValueOnExport()

> **withChangeValueOnExport**(`changeValueOnExport`): `DataField`

Defined in: [listgrid/transfer/Type.ts:623](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L623)

#### Parameters

##### changeValueOnExport

(`value`) => `any`

#### Returns

`DataField`

***

### withChangeValueOnImport()

> **withChangeValueOnImport**(`changeValueOnImport`): `DataField`

Defined in: [listgrid/transfer/Type.ts:634](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L634)

#### Parameters

##### changeValueOnImport

(`value`) => `any`

#### Returns

`DataField`

***

### withDescription()

> **withDescription**(`description`): `DataField`

Defined in: [listgrid/transfer/Type.ts:645](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L645)

#### Parameters

##### description

`string`

#### Returns

`DataField`

***

### getDescription()

> **getDescription**(): `string`

Defined in: [listgrid/transfer/Type.ts:650](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/transfer/Type.ts#L650)

#### Returns

`string`
