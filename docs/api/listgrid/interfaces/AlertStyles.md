[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / AlertStyles

# Interface: AlertStyles

Defined in: [listgrid/components/form/types/ViewEntityFormAlerts.types.ts:11](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormAlerts.types.ts#L11)

## Properties

### icon

> **icon**: `ComponentType`\<`SVGProps`\<`SVGSVGElement`\> & `object`\>

Defined in: [listgrid/components/form/types/ViewEntityFormAlerts.types.ts:13](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormAlerts.types.ts#L13)

Icon component (e.g. Tabler icons) — accepts standard SVG/icon props.

***

### className

> **className**: `string`

Defined in: [listgrid/components/form/types/ViewEntityFormAlerts.types.ts:15](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormAlerts.types.ts#L15)

Primitive class to apply on the alert root (`rcm-notice`).

***

### dataTone?

> `optional` **dataTone?**: `"info"` \| `"success"` \| `"warning"` \| `"error"`

Defined in: [listgrid/components/form/types/ViewEntityFormAlerts.types.ts:17](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormAlerts.types.ts#L17)

Value for the `data-tone` attribute on the alert root, or undefined for neutral.
