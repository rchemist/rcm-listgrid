[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / InlineRowActionColumn

# Interface: InlineRowActionColumn

Defined in: [listgrid/config/InlineSubCollectionField.tsx:62](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L62)

Row action column configuration
Allows multiple action columns with different positions and labels

## Properties

### id

> **id**: `string`

Defined in: [listgrid/config/InlineSubCollectionField.tsx:64](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L64)

Unique column identifier

***

### label?

> `optional` **label?**: `string`

Defined in: [listgrid/config/InlineSubCollectionField.tsx:66](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L66)

Column header label (default: '작업')

***

### order?

> `optional` **order?**: `number`

Defined in: [listgrid/config/InlineSubCollectionField.tsx:68](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L68)

Column order in the list (default: 9999)

***

### actions

> **actions**: [`InlineRowAction`](InlineRowAction.md)[]

Defined in: [listgrid/config/InlineSubCollectionField.tsx:70](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L70)

Actions to display in this column
