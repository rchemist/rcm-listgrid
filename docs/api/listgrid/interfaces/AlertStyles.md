[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / AlertStyles

# Interface: AlertStyles

Defined in: [listgrid/components/form/types/ViewEntityFormAlerts.types.ts:18](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormAlerts.types.ts#L18)

## Properties

### icon

> **icon**: `ComponentType`\<`SVGProps`\<`SVGSVGElement`\> & `object`\>

Defined in: [listgrid/components/form/types/ViewEntityFormAlerts.types.ts:20](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormAlerts.types.ts#L20)

Icon component (e.g. Tabler icons) — accepts standard SVG/icon props.

***

### className

> **className**: `string`

Defined in: [listgrid/components/form/types/ViewEntityFormAlerts.types.ts:22](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormAlerts.types.ts#L22)

Primitive class to apply on the alert root (`rcm-notice`).

***

### dataTone?

> `optional` **dataTone?**: `"info"` \| `"success"` \| `"warning"` \| `"error"`

Defined in: [listgrid/components/form/types/ViewEntityFormAlerts.types.ts:24](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormAlerts.types.ts#L24)

Value for the `data-tone` attribute on the alert root, or undefined for neutral.
