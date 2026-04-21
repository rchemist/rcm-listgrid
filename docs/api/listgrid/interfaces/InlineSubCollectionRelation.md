[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / InlineSubCollectionRelation

# Interface: InlineSubCollectionRelation

Defined in: [listgrid/config/InlineSubCollectionField.tsx:70](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/InlineSubCollectionField.tsx#L70)

InlineSubCollectionRelation configuration
Same as SubCollectionRelation but explicitly typed

## Properties

### mappedBy

> **mappedBy**: `string`

Defined in: [listgrid/config/InlineSubCollectionField.tsx:72](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/InlineSubCollectionField.tsx#L72)

ManyToOne field name in the child entity

***

### filterBy?

> `optional` **filterBy?**: `string`

Defined in: [listgrid/config/InlineSubCollectionField.tsx:74](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/InlineSubCollectionField.tsx#L74)

Filter field name (defaults to mappedBy)

***

### valueProperty?

> `optional` **valueProperty?**: `string`

Defined in: [listgrid/config/InlineSubCollectionField.tsx:76](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/InlineSubCollectionField.tsx#L76)

Property to get the value from parent entity (default: 'id')

***

### attributes?

> `optional` **attributes?**: `Record`\<`string`, `any`\>

Defined in: [listgrid/config/InlineSubCollectionField.tsx:78](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/InlineSubCollectionField.tsx#L78)

Additional attributes for the subcollection
