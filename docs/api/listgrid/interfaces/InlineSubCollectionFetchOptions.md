[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / InlineSubCollectionFetchOptions

# Interface: InlineSubCollectionFetchOptions

Defined in: [listgrid/config/InlineSubCollectionField.tsx:106](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/InlineSubCollectionField.tsx#L106)

Fetch options for InlineSubCollectionField

## Properties

### useSearchForm?

> `optional` **useSearchForm?**: `boolean`

Defined in: [listgrid/config/InlineSubCollectionField.tsx:108](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/InlineSubCollectionField.tsx#L108)

Whether to use SearchForm-based fetching (POST request)

***

### pageSize?

> `optional` **pageSize?**: `number`

Defined in: [listgrid/config/InlineSubCollectionField.tsx:110](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/InlineSubCollectionField.tsx#L110)

Page size for fetching

***

### viewDetail?

> `optional` **viewDetail?**: `boolean`

Defined in: [listgrid/config/InlineSubCollectionField.tsx:112](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/InlineSubCollectionField.tsx#L112)

Whether to use viewDetail mode

***

### filters?

> `optional` **filters?**: (`entityForm`) => `Promise`\<`object`[]\>

Defined in: [listgrid/config/InlineSubCollectionField.tsx:114](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/InlineSubCollectionField.tsx#L114)

Additional filters to apply

#### Parameters

##### entityForm

[`EntityForm`](../classes/EntityForm.md)

#### Returns

`Promise`\<`object`[]\>
