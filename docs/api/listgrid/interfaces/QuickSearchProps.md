[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / QuickSearchProps

# Interface: QuickSearchProps

Defined in: [listgrid/config/ListGrid.ts:256](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/ListGrid.ts#L256)

## Properties

### name

> **name**: `string`

Defined in: [listgrid/config/ListGrid.ts:257](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/ListGrid.ts#L257)

***

### label

> **label**: [`LabelType`](../type-aliases/LabelType.md)

Defined in: [listgrid/config/ListGrid.ts:258](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/ListGrid.ts#L258)

***

### orFields?

> `optional` **orFields?**: `string`[]

Defined in: [listgrid/config/ListGrid.ts:264](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/ListGrid.ts#L264)

Additional fields to search with OR condition
When specified, quick search will search across all fields using OR condition

#### Example

```ts
['name', 'email', 'phone'] - searches all three fields
```

***

### orFieldLabels?

> `optional` **orFieldLabels?**: [`LabelType`](../type-aliases/LabelType.md)[]

Defined in: [listgrid/config/ListGrid.ts:269](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/ListGrid.ts#L269)

Labels for orFields, used to generate combined placeholder text

#### Example

```ts
['이메일', '전화번호'] for orFields ['email', 'phone']
```
