[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ClassNamesMap

# Type Alias: ClassNamesMap\<K\>

> **ClassNamesMap**\<`K`\> = `Partial`\<`Record`\<`K`, `string`\>\>

Defined in: [listgrid/utils/classNames.ts:9](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/utils/classNames.ts#L9)

Per-slot override map accepted by field components.
Keys are component-defined slot names (e.g. `root`, `input`, `label`, `error`).
Values are any className string — Tailwind, scoped `rcm-*` classes, or CSS
module identifiers; the merger treats them as opaque strings.

## Type Parameters

### K

`K` *extends* `string`
