[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / CardSubCollectionFetchOptions

# Interface: CardSubCollectionFetchOptions

Defined in: [listgrid/config/CardSubCollectionField.tsx:89](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/CardSubCollectionField.tsx#L89)

Fetch options for CardSubCollectionField
Controls how data is fetched (SearchForm-based vs simple URL)

## Properties

### useSearchForm?

> `optional` **useSearchForm?**: `boolean`

Defined in: [listgrid/config/CardSubCollectionField.tsx:91](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/CardSubCollectionField.tsx#L91)

Whether to use SearchForm-based fetching (POST request)

***

### pageSize?

> `optional` **pageSize?**: `number`

Defined in: [listgrid/config/CardSubCollectionField.tsx:93](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/CardSubCollectionField.tsx#L93)

Page size for fetching all data (default: 10000)

***

### viewDetail?

> `optional` **viewDetail?**: `boolean`

Defined in: [listgrid/config/CardSubCollectionField.tsx:95](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/CardSubCollectionField.tsx#L95)

Whether to use viewDetail mode

***

### filters?

> `optional` **filters?**: [`CardSubCollectionFilters`](../type-aliases/CardSubCollectionFilters.md)

Defined in: [listgrid/config/CardSubCollectionField.tsx:97](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/CardSubCollectionField.tsx#L97)

Additional filters to apply
