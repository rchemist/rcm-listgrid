[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / PageResult

# Class: PageResult

Defined in: [listgrid/form/Type.ts:48](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/Type.ts#L48)

## Constructors

### Constructor

> **new PageResult**(`props`): `PageResult`

Defined in: [listgrid/form/Type.ts:55](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/Type.ts#L55)

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

Defined in: [listgrid/form/Type.ts:49](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/Type.ts#L49)

***

### totalCount

> **totalCount**: `number`

Defined in: [listgrid/form/Type.ts:50](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/Type.ts#L50)

***

### totalPage

> **totalPage**: `number`

Defined in: [listgrid/form/Type.ts:51](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/Type.ts#L51)

***

### searchForm

> **searchForm**: [`SearchForm`](SearchForm.md)

Defined in: [listgrid/form/Type.ts:52](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/Type.ts#L52)

***

### errors?

> `optional` **errors?**: `string`[]

Defined in: [listgrid/form/Type.ts:53](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/Type.ts#L53)

## Methods

### createEmptyResult()

> `static` **createEmptyResult**(`searchForm?`): `PageResult`

Defined in: [listgrid/form/Type.ts:67](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/Type.ts#L67)

#### Parameters

##### searchForm?

[`SearchForm`](SearchForm.md)

#### Returns

`PageResult`

***

### withErrors()

> **withErrors**(...`errors`): `this`

Defined in: [listgrid/form/Type.ts:76](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/Type.ts#L76)

#### Parameters

##### errors

...`string`[]

#### Returns

`this`

***

### fetchListData()

> `static` **fetchListData**(`url`, `searchForm`, `extensionOptions?`, `serverProxy?`): `Promise`\<`PageResult`\>

Defined in: [listgrid/form/Type.ts:81](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/form/Type.ts#L81)

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
