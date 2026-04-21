[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / RuleConditionValue

# Class: RuleConditionValue

Defined in: [listgrid/components/fields/rule/Type.ts:16](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/rule/Type.ts#L16)

## Constructors

### Constructor

> **new RuleConditionValue**(`id`, `condition`, `targetEntityPrefix`): `RuleConditionValue`

Defined in: [listgrid/components/fields/rule/Type.ts:22](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/rule/Type.ts#L22)

#### Parameters

##### id

`number`

##### condition

`"AND"` \| `"OR"`

##### targetEntityPrefix

`string`

#### Returns

`RuleConditionValue`

## Properties

### id

> **id**: `number`

Defined in: [listgrid/components/fields/rule/Type.ts:17](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/rule/Type.ts#L17)

***

### condition

> **condition**: `"AND"` \| `"OR"`

Defined in: [listgrid/components/fields/rule/Type.ts:18](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/rule/Type.ts#L18)

***

### targetEntityPrefix

> **targetEntityPrefix**: `string`

Defined in: [listgrid/components/fields/rule/Type.ts:19](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/rule/Type.ts#L19)

***

### values

> **values**: [`RuleFieldValue`](../interfaces/RuleFieldValue.md)[]

Defined in: [listgrid/components/fields/rule/Type.ts:20](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/rule/Type.ts#L20)

## Methods

### create()

> `static` **create**(`data`): `RuleConditionValue`

Defined in: [listgrid/components/fields/rule/Type.ts:29](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/rule/Type.ts#L29)

#### Parameters

##### data

`unknown`

#### Returns

`RuleConditionValue`

***

### addValues()

> **addValues**(...`values`): `void`

Defined in: [listgrid/components/fields/rule/Type.ts:45](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/rule/Type.ts#L45)

#### Parameters

##### values

...[`RuleFieldValue`](../interfaces/RuleFieldValue.md)[]

#### Returns

`void`

***

### withValues()

> **withValues**(`values`): `this`

Defined in: [listgrid/components/fields/rule/Type.ts:64](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/rule/Type.ts#L64)

#### Parameters

##### values

[`RuleFieldValue`](../interfaces/RuleFieldValue.md)[]

#### Returns

`this`

***

### isEmpty()

> **isEmpty**(): `boolean`

Defined in: [listgrid/components/fields/rule/Type.ts:69](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/rule/Type.ts#L69)

#### Returns

`boolean`
