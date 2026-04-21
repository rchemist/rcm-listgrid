[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / InlineRowAction

# Interface: InlineRowAction

Defined in: [listgrid/config/InlineSubCollectionField.tsx:32](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/InlineSubCollectionField.tsx#L32)

Row action button configuration
`item` is a generic row payload — host apps know their own entity shape

## Properties

### id

> **id**: `string`

Defined in: [listgrid/config/InlineSubCollectionField.tsx:34](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/InlineSubCollectionField.tsx#L34)

Unique action identifier

***

### label

> **label**: `string` \| ((`item`) => `string`)

Defined in: [listgrid/config/InlineSubCollectionField.tsx:36](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/InlineSubCollectionField.tsx#L36)

Button label - static string or function receiving row item

***

### icon?

> `optional` **icon?**: `ReactNode`

Defined in: [listgrid/config/InlineSubCollectionField.tsx:38](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/InlineSubCollectionField.tsx#L38)

Button icon

***

### className?

> `optional` **className?**: `string`

Defined in: [listgrid/config/InlineSubCollectionField.tsx:40](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/InlineSubCollectionField.tsx#L40)

Additional CSS classes

***

### onClick

> **onClick**: (`item`, `entityForm`, `refresh`) => `Promise`\<`void`\>

Defined in: [listgrid/config/InlineSubCollectionField.tsx:42](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/InlineSubCollectionField.tsx#L42)

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

Defined in: [listgrid/config/InlineSubCollectionField.tsx:44](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/InlineSubCollectionField.tsx#L44)

Disable condition

#### Parameters

##### item

`any`

#### Returns

`boolean`

***

### hidden?

> `optional` **hidden?**: (`item`) => `boolean`

Defined in: [listgrid/config/InlineSubCollectionField.tsx:46](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/InlineSubCollectionField.tsx#L46)

Hide condition

#### Parameters

##### item

`any`

#### Returns

`boolean`

***

### confirm?

> `optional` **confirm?**: `string` \| ((`item`) => `string`)

Defined in: [listgrid/config/InlineSubCollectionField.tsx:48](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/InlineSubCollectionField.tsx#L48)

Confirmation message before execution
