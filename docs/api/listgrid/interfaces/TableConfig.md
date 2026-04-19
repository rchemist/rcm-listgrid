[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / TableConfig

# Interface: TableConfig

Defined in: [listgrid/config/TableSubCollectionField.tsx:27](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/TableSubCollectionField.tsx#L27)

Table configuration for TableSubCollectionField

## Properties

### displayFields?

> `optional` **displayFields?**: `string`[]

Defined in: [listgrid/config/TableSubCollectionField.tsx:32](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/TableSubCollectionField.tsx#L32)

Fields to display as columns (whitelist).
If not set, all list-enabled fields are shown.

***

### excludeFields?

> `optional` **excludeFields?**: `string`[]

Defined in: [listgrid/config/TableSubCollectionField.tsx:36](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/TableSubCollectionField.tsx#L36)

Fields to exclude from columns (blacklist).

***

### pageSize?

> `optional` **pageSize?**: `number`

Defined in: [listgrid/config/TableSubCollectionField.tsx:41](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/TableSubCollectionField.tsx#L41)

Page size for client-side pagination.

#### Default

```ts
undefined (no pagination)
```

***

### showRowNumbers?

> `optional` **showRowNumbers?**: `boolean`

Defined in: [listgrid/config/TableSubCollectionField.tsx:46](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/TableSubCollectionField.tsx#L46)

Whether to show row numbers as the first column.

#### Default

```ts
true
```
