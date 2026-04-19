[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / InlineRowAction

# Interface: InlineRowAction

Defined in: [listgrid/config/InlineSubCollectionField.tsx:39](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L39)

Row action button configuration
`item` is a generic row payload — host apps know their own entity shape

## Properties

### id

> **id**: `string`

Defined in: [listgrid/config/InlineSubCollectionField.tsx:41](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L41)

Unique action identifier

***

### label

> **label**: `string` \| ((`item`) => `string`)

Defined in: [listgrid/config/InlineSubCollectionField.tsx:43](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L43)

Button label - static string or function receiving row item

***

### icon?

> `optional` **icon?**: `ReactNode`

Defined in: [listgrid/config/InlineSubCollectionField.tsx:45](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L45)

Button icon

***

### className?

> `optional` **className?**: `string`

Defined in: [listgrid/config/InlineSubCollectionField.tsx:47](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L47)

Additional CSS classes

***

### onClick

> **onClick**: (`item`, `entityForm`, `refresh`) => `Promise`\<`void`\>

Defined in: [listgrid/config/InlineSubCollectionField.tsx:49](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L49)

Click handler - receives row item and entityForm

#### Parameters

##### item

`any`

##### entityForm

[`EntityForm`](../classes/EntityForm.md)

##### refresh

() => `void`

#### Returns

`Promise`\<`void`\>

***

### disabled?

> `optional` **disabled?**: (`item`) => `boolean`

Defined in: [listgrid/config/InlineSubCollectionField.tsx:51](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L51)

Disable condition

#### Parameters

##### item

`any`

#### Returns

`boolean`

***

### hidden?

> `optional` **hidden?**: (`item`) => `boolean`

Defined in: [listgrid/config/InlineSubCollectionField.tsx:53](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L53)

Hide condition

#### Parameters

##### item

`any`

#### Returns

`boolean`

***

### confirm?

> `optional` **confirm?**: `string` \| ((`item`) => `string`)

Defined in: [listgrid/config/InlineSubCollectionField.tsx:55](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/InlineSubCollectionField.tsx#L55)

Confirmation message before execution
