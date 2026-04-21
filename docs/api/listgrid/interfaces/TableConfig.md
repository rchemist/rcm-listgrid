[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / TableConfig

# Interface: TableConfig

Defined in: [listgrid/config/TableSubCollectionField.tsx:20](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/TableSubCollectionField.tsx#L20)

Table configuration for TableSubCollectionField

## Properties

### displayFields?

> `optional` **displayFields?**: `string`[]

Defined in: [listgrid/config/TableSubCollectionField.tsx:25](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/TableSubCollectionField.tsx#L25)

Fields to display as columns (whitelist).
If not set, all list-enabled fields are shown.

***

### excludeFields?

> `optional` **excludeFields?**: `string`[]

Defined in: [listgrid/config/TableSubCollectionField.tsx:29](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/TableSubCollectionField.tsx#L29)

Fields to exclude from columns (blacklist).

***

### pageSize?

> `optional` **pageSize?**: `number`

Defined in: [listgrid/config/TableSubCollectionField.tsx:34](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/TableSubCollectionField.tsx#L34)

Page size for client-side pagination.

#### Default

```ts
undefined (no pagination)
```

***

### showRowNumbers?

> `optional` **showRowNumbers?**: `boolean`

Defined in: [listgrid/config/TableSubCollectionField.tsx:39](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/TableSubCollectionField.tsx#L39)

Whether to show row numbers as the first column.

#### Default

```ts
true
```
