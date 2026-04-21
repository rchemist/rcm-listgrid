[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ListGrid

# Class: ListGrid

Defined in: [listgrid/config/ListGrid.ts:10](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/ListGrid.ts#L10)

## Constructors

### Constructor

> **new ListGrid**(`entityForm`): `ListGrid`

Defined in: [listgrid/config/ListGrid.ts:22](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/ListGrid.ts#L22)

#### Parameters

##### entityForm

[`EntityForm`](EntityForm.md)

#### Returns

`ListGrid`

## Methods

### withOverrideFetch()

> **withOverrideFetch**(`overrideFetch?`): `this`

Defined in: [listgrid/config/ListGrid.ts:26](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/ListGrid.ts#L26)

#### Parameters

##### overrideFetch?

(`url`, `searchForm`) => `Promise`\<[`PageResult`](PageResult.md)\>

#### Returns

`this`

***

### withOverrideFetchResult()

> **withOverrideFetchResult**(`overrideFetchResult?`): `this`

Defined in: [listgrid/config/ListGrid.ts:33](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/ListGrid.ts#L33)

#### Parameters

##### overrideFetchResult?

(`result`) => `Promise`\<[`PageResult`](PageResult.md)\>

#### Returns

`this`

***

### getListFields()

> **getListFields**(): [`ListableFormField`](ListableFormField.md)\<`any`, `any`, `any`\>[]

Defined in: [listgrid/config/ListGrid.ts:38](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/ListGrid.ts#L38)

#### Returns

[`ListableFormField`](ListableFormField.md)\<`any`, `any`, `any`\>[]

***

### getQuickSearchProperty()

> **getQuickSearchProperty**(`findAllFields?`): [`QuickSearchProps`](../interfaces/QuickSearchProps.md) \| `undefined`

Defined in: [listgrid/config/ListGrid.ts:45](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/ListGrid.ts#L45)

#### Parameters

##### findAllFields?

`boolean` = `true`

#### Returns

[`QuickSearchProps`](../interfaces/QuickSearchProps.md) \| `undefined`

***

### getSearchForm()

> **getSearchForm**(): [`SearchForm`](SearchForm.md)

Defined in: [listgrid/config/ListGrid.ts:153](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/ListGrid.ts#L153)

#### Returns

[`SearchForm`](SearchForm.md)

***

### getEntityForm()

> **getEntityForm**(): [`EntityForm`](EntityForm.md)

Defined in: [listgrid/config/ListGrid.ts:161](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/ListGrid.ts#L161)

#### Returns

[`EntityForm`](EntityForm.md)

***

### withSearchForm()

> **withSearchForm**(`searchForm`): `this`

Defined in: [listgrid/config/ListGrid.ts:165](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/ListGrid.ts#L165)

#### Parameters

##### searchForm

[`SearchForm`](SearchForm.md)

#### Returns

`this`

***

### fetchData()

> **fetchData**(`fetchSearchForm?`, `extensionOptions?`): `Promise`\<[`PageResult`](PageResult.md)\>

Defined in: [listgrid/config/ListGrid.ts:170](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/ListGrid.ts#L170)

#### Parameters

##### fetchSearchForm?

[`SearchForm`](SearchForm.md)

##### extensionOptions?

###### entityFormName?

`string`

###### extensionPoint?

`string`

#### Returns

`Promise`\<[`PageResult`](PageResult.md)\>

***

### getAdvancedSearchFields()

> **getAdvancedSearchFields**(): [`ListableFormField`](ListableFormField.md)\<`any`, `any`, `any`\>[]

Defined in: [listgrid/config/ListGrid.ts:208](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/ListGrid.ts#L208)

#### Returns

[`ListableFormField`](ListableFormField.md)\<`any`, `any`, `any`\>[]
