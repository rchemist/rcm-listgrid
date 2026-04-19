[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / QuickSearchProps

# Interface: QuickSearchProps

Defined in: [listgrid/config/ListGrid.ts:258](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/ListGrid.ts#L258)

## Properties

### name

> **name**: `string`

Defined in: [listgrid/config/ListGrid.ts:259](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/ListGrid.ts#L259)

***

### label

> **label**: [`LabelType`](../type-aliases/LabelType.md)

Defined in: [listgrid/config/ListGrid.ts:260](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/ListGrid.ts#L260)

***

### orFields?

> `optional` **orFields?**: `string`[]

Defined in: [listgrid/config/ListGrid.ts:266](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/ListGrid.ts#L266)

Additional fields to search with OR condition
When specified, quick search will search across all fields using OR condition

#### Example

```ts
['name', 'email', 'phone'] - searches all three fields
```

***

### orFieldLabels?

> `optional` **orFieldLabels?**: [`LabelType`](../type-aliases/LabelType.md)[]

Defined in: [listgrid/config/ListGrid.ts:271](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/ListGrid.ts#L271)

Labels for orFields, used to generate combined placeholder text

#### Example

```ts
['이메일', '전화번호'] for orFields ['email', 'phone']
```
