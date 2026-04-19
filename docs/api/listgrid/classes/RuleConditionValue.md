[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / RuleConditionValue

# Class: RuleConditionValue

Defined in: [listgrid/components/fields/rule/Type.ts:23](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/rule/Type.ts#L23)

## Constructors

### Constructor

> **new RuleConditionValue**(`id`, `condition`, `targetEntityPrefix`): `RuleConditionValue`

Defined in: [listgrid/components/fields/rule/Type.ts:29](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/rule/Type.ts#L29)

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

Defined in: [listgrid/components/fields/rule/Type.ts:24](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/rule/Type.ts#L24)

***

### condition

> **condition**: `"AND"` \| `"OR"`

Defined in: [listgrid/components/fields/rule/Type.ts:25](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/rule/Type.ts#L25)

***

### targetEntityPrefix

> **targetEntityPrefix**: `string`

Defined in: [listgrid/components/fields/rule/Type.ts:26](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/rule/Type.ts#L26)

***

### values

> **values**: [`RuleFieldValue`](../interfaces/RuleFieldValue.md)[]

Defined in: [listgrid/components/fields/rule/Type.ts:27](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/rule/Type.ts#L27)

## Methods

### create()

> `static` **create**(`data`): `RuleConditionValue`

Defined in: [listgrid/components/fields/rule/Type.ts:36](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/rule/Type.ts#L36)

#### Parameters

##### data

`unknown`

#### Returns

`RuleConditionValue`

***

### addValues()

> **addValues**(...`values`): `void`

Defined in: [listgrid/components/fields/rule/Type.ts:52](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/rule/Type.ts#L52)

#### Parameters

##### values

...[`RuleFieldValue`](../interfaces/RuleFieldValue.md)[]

#### Returns

`void`

***

### withValues()

> **withValues**(`values`): `this`

Defined in: [listgrid/components/fields/rule/Type.ts:71](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/rule/Type.ts#L71)

#### Parameters

##### values

[`RuleFieldValue`](../interfaces/RuleFieldValue.md)[]

#### Returns

`this`

***

### isEmpty()

> **isEmpty**(): `boolean`

Defined in: [listgrid/components/fields/rule/Type.ts:76](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/rule/Type.ts#L76)

#### Returns

`boolean`
