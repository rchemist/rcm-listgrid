[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ListGrid

# Class: ListGrid

Defined in: [listgrid/config/ListGrid.ts:17](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/ListGrid.ts#L17)

## Constructors

### Constructor

> **new ListGrid**(`entityForm`): `ListGrid`

Defined in: [listgrid/config/ListGrid.ts:29](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/ListGrid.ts#L29)

#### Parameters

##### entityForm

[`EntityForm`](EntityForm.md)

#### Returns

`ListGrid`

## Methods

### withOverrideFetch()

> **withOverrideFetch**(`overrideFetch?`): `this`

Defined in: [listgrid/config/ListGrid.ts:33](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/ListGrid.ts#L33)

#### Parameters

##### overrideFetch?

(`url`, `searchForm`) => `Promise`\<[`PageResult`](PageResult.md)\>

#### Returns

`this`

***

### withOverrideFetchResult()

> **withOverrideFetchResult**(`overrideFetchResult?`): `this`

Defined in: [listgrid/config/ListGrid.ts:40](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/ListGrid.ts#L40)

#### Parameters

##### overrideFetchResult?

(`result`) => `Promise`\<[`PageResult`](PageResult.md)\>

#### Returns

`this`

***

### getListFields()

> **getListFields**(): [`ListableFormField`](ListableFormField.md)\<`any`, `any`, `any`\>[]

Defined in: [listgrid/config/ListGrid.ts:45](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/ListGrid.ts#L45)

#### Returns

[`ListableFormField`](ListableFormField.md)\<`any`, `any`, `any`\>[]

***

### getQuickSearchProperty()

> **getQuickSearchProperty**(`findAllFields?`): [`QuickSearchProps`](../interfaces/QuickSearchProps.md) \| `undefined`

Defined in: [listgrid/config/ListGrid.ts:52](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/ListGrid.ts#L52)

#### Parameters

##### findAllFields?

`boolean` = `true`

#### Returns

[`QuickSearchProps`](../interfaces/QuickSearchProps.md) \| `undefined`

***

### getSearchForm()

> **getSearchForm**(): [`SearchForm`](SearchForm.md)

Defined in: [listgrid/config/ListGrid.ts:155](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/ListGrid.ts#L155)

#### Returns

[`SearchForm`](SearchForm.md)

***

### getEntityForm()

> **getEntityForm**(): [`EntityForm`](EntityForm.md)

Defined in: [listgrid/config/ListGrid.ts:163](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/ListGrid.ts#L163)

#### Returns

[`EntityForm`](EntityForm.md)

***

### withSearchForm()

> **withSearchForm**(`searchForm`): `this`

Defined in: [listgrid/config/ListGrid.ts:167](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/ListGrid.ts#L167)

#### Parameters

##### searchForm

[`SearchForm`](SearchForm.md)

#### Returns

`this`

***

### fetchData()

> **fetchData**(`fetchSearchForm?`, `extensionOptions?`): `Promise`\<[`PageResult`](PageResult.md)\>

Defined in: [listgrid/config/ListGrid.ts:172](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/ListGrid.ts#L172)

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

Defined in: [listgrid/config/ListGrid.ts:210](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/ListGrid.ts#L210)

#### Returns

[`ListableFormField`](ListableFormField.md)\<`any`, `any`, `any`\>[]
