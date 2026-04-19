[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ClassNamesMap

# Type Alias: ClassNamesMap\<K\>

> **ClassNamesMap**\<`K`\> = `Partial`\<`Record`\<`K`, `string`\>\>

Defined in: [listgrid/utils/classNames.ts:9](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/utils/classNames.ts#L9)

Per-slot override map accepted by field components.
Keys are component-defined slot names (e.g. `root`, `input`, `label`, `error`).
Values are any className string — Tailwind, scoped `rcm-*` classes, or CSS
module identifiers; the merger treats them as opaque strings.

## Type Parameters

### K

`K` *extends* `string`
