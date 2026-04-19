[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / InlineSubCollectionRelation

# Interface: InlineSubCollectionRelation

Defined in: [listgrid/config/InlineSubCollectionField.tsx:77](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L77)

InlineSubCollectionRelation configuration
Same as SubCollectionRelation but explicitly typed

## Properties

### mappedBy

> **mappedBy**: `string`

Defined in: [listgrid/config/InlineSubCollectionField.tsx:79](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L79)

ManyToOne field name in the child entity

***

### filterBy?

> `optional` **filterBy?**: `string`

Defined in: [listgrid/config/InlineSubCollectionField.tsx:81](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L81)

Filter field name (defaults to mappedBy)

***

### valueProperty?

> `optional` **valueProperty?**: `string`

Defined in: [listgrid/config/InlineSubCollectionField.tsx:83](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L83)

Property to get the value from parent entity (default: 'id')

***

### attributes?

> `optional` **attributes?**: `Record`\<`string`, `any`\>

Defined in: [listgrid/config/InlineSubCollectionField.tsx:85](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L85)

Additional attributes for the subcollection
