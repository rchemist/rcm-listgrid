[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / CardConfig

# Interface: CardConfig

Defined in: [listgrid/config/CardSubCollectionField.tsx:27](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/CardSubCollectionField.tsx#L27)

Card configuration for CardSubCollectionField

## Properties

### columns?

> `optional` **columns?**: [`ColumnsConfig`](../type-aliases/ColumnsConfig.md)

Defined in: [listgrid/config/CardSubCollectionField.tsx:35](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/CardSubCollectionField.tsx#L35)

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

Defined in: [listgrid/config/CardSubCollectionField.tsx:42](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/CardSubCollectionField.tsx#L42)

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

Defined in: [listgrid/config/CardSubCollectionField.tsx:44](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/CardSubCollectionField.tsx#L44)

Fields to display on each card (whitelist)

***

### excludeFields?

> `optional` **excludeFields?**: `string`[]

Defined in: [listgrid/config/CardSubCollectionField.tsx:46](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/CardSubCollectionField.tsx#L46)

Fields to exclude from card display (blacklist) - useful when titleField is a function

***

### titleField?

> `optional` **titleField?**: `string` \| ((`item`) => `string`)

Defined in: [listgrid/config/CardSubCollectionField.tsx:48](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/CardSubCollectionField.tsx#L48)

Field name or function for card title

***

### containerClassName?

> `optional` **containerClassName?**: `string`

Defined in: [listgrid/config/CardSubCollectionField.tsx:50](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/CardSubCollectionField.tsx#L50)

CSS class name for card container

***

### selectedContainerClassName?

> `optional` **selectedContainerClassName?**: `string`

Defined in: [listgrid/config/CardSubCollectionField.tsx:52](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/CardSubCollectionField.tsx#L52)

CSS class name for selected card container

***

### titleClassName?

> `optional` **titleClassName?**: `string`

Defined in: [listgrid/config/CardSubCollectionField.tsx:54](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/CardSubCollectionField.tsx#L54)

CSS class name for card title

***

### renderCard?

> `optional` **renderCard?**: (`item`, `isSelected`, `onSelect`) => `ReactNode`

Defined in: [listgrid/config/CardSubCollectionField.tsx:56](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/CardSubCollectionField.tsx#L56)

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
