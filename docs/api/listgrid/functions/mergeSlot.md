[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / mergeSlot

# Function: mergeSlot()

> **mergeSlot**(`base`, `override?`): `string`

Defined in: [listgrid/utils/classNames.ts:19](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/utils/classNames.ts#L19)

Merge a component's built-in default class for a slot with a host override
from the `classNames` prop. Built-ins come first so host overrides can win
on the right when using tailwind-merge / plain cascade.

Example:
  <input className={mergeSlot('rcm-field-input', classNames?.input)} />

## Parameters

### base

`string`

### override?

`string`

## Returns

`string`
