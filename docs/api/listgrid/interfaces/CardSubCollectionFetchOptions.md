[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / CardSubCollectionFetchOptions

# Interface: CardSubCollectionFetchOptions

Defined in: [listgrid/config/CardSubCollectionField.tsx:96](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/CardSubCollectionField.tsx#L96)

Fetch options for CardSubCollectionField
Controls how data is fetched (SearchForm-based vs simple URL)

## Properties

### useSearchForm?

> `optional` **useSearchForm?**: `boolean`

Defined in: [listgrid/config/CardSubCollectionField.tsx:98](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/CardSubCollectionField.tsx#L98)

Whether to use SearchForm-based fetching (POST request)

***

### pageSize?

> `optional` **pageSize?**: `number`

Defined in: [listgrid/config/CardSubCollectionField.tsx:100](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/CardSubCollectionField.tsx#L100)

Page size for fetching all data (default: 10000)

***

### viewDetail?

> `optional` **viewDetail?**: `boolean`

Defined in: [listgrid/config/CardSubCollectionField.tsx:102](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/CardSubCollectionField.tsx#L102)

Whether to use viewDetail mode

***

### filters?

> `optional` **filters?**: [`CardSubCollectionFilters`](../type-aliases/CardSubCollectionFilters.md)

Defined in: [listgrid/config/CardSubCollectionField.tsx:104](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/CardSubCollectionField.tsx#L104)

Additional filters to apply
