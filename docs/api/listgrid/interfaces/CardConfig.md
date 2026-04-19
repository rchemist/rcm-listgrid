[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / CardConfig

# Interface: CardConfig

Defined in: [listgrid/config/CardSubCollectionField.tsx:34](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/CardSubCollectionField.tsx#L34)

Card configuration for CardSubCollectionField

## Properties

### columns?

> `optional` **columns?**: [`ColumnsConfig`](../type-aliases/ColumnsConfig.md)

Defined in: [listgrid/config/CardSubCollectionField.tsx:42](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/CardSubCollectionField.tsx#L42)

Column configuration for card grid and field layout
- number: Field columns only (card grid auto-calculated based on layout)
- {card, field}: Explicit card grid columns and field columns
- Mobile is always 1 column for both cards and fields

#### Default

```ts
2
```

***

### pageSize?

> `optional` **pageSize?**: `number`

Defined in: [listgrid/config/CardSubCollectionField.tsx:49](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/CardSubCollectionField.tsx#L49)

Page size for client-side pagination
- If set, enables client-side pagination with the specified page size
- If not set or 0, all items are displayed without pagination

#### Default

```ts
undefined (no pagination)
```

***

### displayFields?

> `optional` **displayFields?**: `string`[]

Defined in: [listgrid/config/CardSubCollectionField.tsx:51](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/CardSubCollectionField.tsx#L51)

Fields to display on each card (whitelist)

***

### excludeFields?

> `optional` **excludeFields?**: `string`[]

Defined in: [listgrid/config/CardSubCollectionField.tsx:53](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/CardSubCollectionField.tsx#L53)

Fields to exclude from card display (blacklist) - useful when titleField is a function

***

### titleField?

> `optional` **titleField?**: `string` \| ((`item`) => `string`)

Defined in: [listgrid/config/CardSubCollectionField.tsx:55](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/CardSubCollectionField.tsx#L55)

Field name or function for card title

***

### containerClassName?

> `optional` **containerClassName?**: `string`

Defined in: [listgrid/config/CardSubCollectionField.tsx:57](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/CardSubCollectionField.tsx#L57)

CSS class name for card container

***

### selectedContainerClassName?

> `optional` **selectedContainerClassName?**: `string`

Defined in: [listgrid/config/CardSubCollectionField.tsx:59](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/CardSubCollectionField.tsx#L59)

CSS class name for selected card container

***

### titleClassName?

> `optional` **titleClassName?**: `string`

Defined in: [listgrid/config/CardSubCollectionField.tsx:61](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/CardSubCollectionField.tsx#L61)

CSS class name for card title

***

### renderCard?

> `optional` **renderCard?**: (`item`, `isSelected`, `onSelect`) => `ReactNode`

Defined in: [listgrid/config/CardSubCollectionField.tsx:63](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/CardSubCollectionField.tsx#L63)

Custom render function for entire card

#### Parameters

##### item

`any`

##### isSelected

`boolean`

##### onSelect

() => `void`

#### Returns

`ReactNode`
