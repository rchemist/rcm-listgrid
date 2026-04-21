[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / resolveSlots

# Function: resolveSlots()

> **resolveSlots**\<`K`\>(`defaults`, `overrides?`): `Record`\<`K`, `string`\>

Defined in: [listgrid/utils/classNames.ts:28](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/utils/classNames.ts#L28)

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
