[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / PageResult

# Class: PageResult

Defined in: [listgrid/form/Type.ts:41](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/Type.ts#L41)

## Constructors

### Constructor

> **new PageResult**(`props`): `PageResult`

Defined in: [listgrid/form/Type.ts:48](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/Type.ts#L48)

#### Parameters

##### props

###### list

[`EntityWithId`](../type-aliases/EntityWithId.md)[]

###### totalCount

`number`

###### totalPage

`number`

###### searchForm

[`SearchForm`](SearchForm.md)

#### Returns

`PageResult`

## Properties

### list

> **list**: [`EntityWithId`](../type-aliases/EntityWithId.md)[] = `[]`

Defined in: [listgrid/form/Type.ts:42](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/Type.ts#L42)

***

### totalCount

> **totalCount**: `number`

Defined in: [listgrid/form/Type.ts:43](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/Type.ts#L43)

***

### totalPage

> **totalPage**: `number`

Defined in: [listgrid/form/Type.ts:44](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/Type.ts#L44)

***

### searchForm

> **searchForm**: [`SearchForm`](SearchForm.md)

Defined in: [listgrid/form/Type.ts:45](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/Type.ts#L45)

***

### errors?

> `optional` **errors?**: `string`[]

Defined in: [listgrid/form/Type.ts:46](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/Type.ts#L46)

## Methods

### createEmptyResult()

> `static` **createEmptyResult**(`searchForm?`): `PageResult`

Defined in: [listgrid/form/Type.ts:60](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/Type.ts#L60)

#### Parameters

##### searchForm?

[`SearchForm`](SearchForm.md)

#### Returns

`PageResult`

***

### withErrors()

> **withErrors**(...`errors`): `this`

Defined in: [listgrid/form/Type.ts:69](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/Type.ts#L69)

#### Parameters

##### errors

...`string`[]

#### Returns

`this`

***

### fetchListData()

> `static` **fetchListData**(`url`, `searchForm`, `extensionOptions?`, `serverProxy?`): `Promise`\<`PageResult`\>

Defined in: [listgrid/form/Type.ts:74](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/Type.ts#L74)

#### Parameters

##### url

`string`

##### searchForm

[`SearchForm`](SearchForm.md)

##### extensionOptions?

###### entityFormName?

`string`

###### extensionPoint?

`string`

##### serverProxy?

`boolean` = `true`

#### Returns

`Promise`\<`PageResult`\>
