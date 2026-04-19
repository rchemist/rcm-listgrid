[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / resolveSlots

# Function: resolveSlots()

> **resolveSlots**\<`K`\>(`defaults`, `overrides?`): `Record`\<`K`, `string`\>

Defined in: [listgrid/utils/classNames.ts:28](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/utils/classNames.ts#L28)

Convenience when a component wants to expose a `classNames` slot map and
resolve it up-front rather than calling `mergeSlot` per slot.

## Type Parameters

### K

`K` *extends* `string`

## Parameters

### defaults

`Record`\<`K`, `string`\>

### overrides?

`Partial`\<`Record`\<`K`, `string`\>\>

## Returns

`Record`\<`K`, `string`\>
