[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / CardSubCollectionRelation

# Interface: CardSubCollectionRelation

Defined in: [listgrid/config/CardSubCollectionField.tsx:70](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/CardSubCollectionField.tsx#L70)

CardSubCollectionRelation configuration
Defines the relationship between parent and child entities

## Properties

### mappedBy

> **mappedBy**: `string`

Defined in: [listgrid/config/CardSubCollectionField.tsx:72](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/CardSubCollectionField.tsx#L72)

ManyToOne field name in the child entity

***

### filterBy?

> `optional` **filterBy?**: `string`

Defined in: [listgrid/config/CardSubCollectionField.tsx:74](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/CardSubCollectionField.tsx#L74)

Filter field name (defaults to mappedBy)

***

### valueProperty?

> `optional` **valueProperty?**: `string`

Defined in: [listgrid/config/CardSubCollectionField.tsx:76](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/CardSubCollectionField.tsx#L76)

Property to get the value from parent entity (default: 'id')

***

### attributes?

> `optional` **attributes?**: `Record`\<`string`, `any`\>

Defined in: [listgrid/config/CardSubCollectionField.tsx:78](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/CardSubCollectionField.tsx#L78)

Additional attributes for the subcollection
