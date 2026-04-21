[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / CardSubCollectionRelation

# Interface: CardSubCollectionRelation

Defined in: [listgrid/config/CardSubCollectionField.tsx:63](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/CardSubCollectionField.tsx#L63)

CardSubCollectionRelation configuration
Defines the relationship between parent and child entities

## Properties

### mappedBy

> **mappedBy**: `string`

Defined in: [listgrid/config/CardSubCollectionField.tsx:65](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/CardSubCollectionField.tsx#L65)

ManyToOne field name in the child entity

***

### filterBy?

> `optional` **filterBy?**: `string`

Defined in: [listgrid/config/CardSubCollectionField.tsx:67](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/CardSubCollectionField.tsx#L67)

Filter field name (defaults to mappedBy)

***

### valueProperty?

> `optional` **valueProperty?**: `string`

Defined in: [listgrid/config/CardSubCollectionField.tsx:69](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/CardSubCollectionField.tsx#L69)

Property to get the value from parent entity (default: 'id')

***

### attributes?

> `optional` **attributes?**: `Record`\<`string`, `any`\>

Defined in: [listgrid/config/CardSubCollectionField.tsx:71](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/CardSubCollectionField.tsx#L71)

Additional attributes for the subcollection
