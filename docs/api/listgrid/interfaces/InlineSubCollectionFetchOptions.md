[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / InlineSubCollectionFetchOptions

# Interface: InlineSubCollectionFetchOptions

Defined in: [listgrid/config/InlineSubCollectionField.tsx:113](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L113)

Fetch options for InlineSubCollectionField

## Properties

### useSearchForm?

> `optional` **useSearchForm?**: `boolean`

Defined in: [listgrid/config/InlineSubCollectionField.tsx:115](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L115)

Whether to use SearchForm-based fetching (POST request)

***

### pageSize?

> `optional` **pageSize?**: `number`

Defined in: [listgrid/config/InlineSubCollectionField.tsx:117](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L117)

Page size for fetching

***

### viewDetail?

> `optional` **viewDetail?**: `boolean`

Defined in: [listgrid/config/InlineSubCollectionField.tsx:119](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L119)

Whether to use viewDetail mode

***

### filters?

> `optional` **filters?**: (`entityForm`) => `Promise`\<`object`[]\>

Defined in: [listgrid/config/InlineSubCollectionField.tsx:121](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L121)

Additional filters to apply

#### Parameters

##### entityForm

[`EntityForm`](../classes/EntityForm.md)

#### Returns

`Promise`\<`object`[]\>
