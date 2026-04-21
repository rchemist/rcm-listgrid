[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / InlineRowActionColumn

# Interface: InlineRowActionColumn

Defined in: [listgrid/config/InlineSubCollectionField.tsx:55](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/InlineSubCollectionField.tsx#L55)

Row action column configuration
Allows multiple action columns with different positions and labels

## Properties

### id

> **id**: `string`

Defined in: [listgrid/config/InlineSubCollectionField.tsx:57](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/InlineSubCollectionField.tsx#L57)

Unique column identifier

***

### label?

> `optional` **label?**: `string`

Defined in: [listgrid/config/InlineSubCollectionField.tsx:59](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/InlineSubCollectionField.tsx#L59)

Column header label (default: '작업')

***

### order?

> `optional` **order?**: `number`

Defined in: [listgrid/config/InlineSubCollectionField.tsx:61](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/InlineSubCollectionField.tsx#L61)

Column order in the list (default: 9999)

***

### actions

> **actions**: [`InlineRowAction`](InlineRowAction.md)[]

Defined in: [listgrid/config/InlineSubCollectionField.tsx:63](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/InlineSubCollectionField.tsx#L63)

Actions to display in this column
