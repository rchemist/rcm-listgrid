[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ApiClient

# Interface: ApiClient

Defined in: [listgrid/api/ApiClient.ts:29](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/api/ApiClient.ts#L29)

## Methods

### callExternalHttpRequest()

> **callExternalHttpRequest**\<`T`\>(`options`): `Promise`\<[`ResponseData`](../classes/ResponseData.md)\<`T`\>\>

Defined in: [listgrid/api/ApiClient.ts:31](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/api/ApiClient.ts#L31)

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### options

[`ApiRequestOptions`](ApiRequestOptions.md)

#### Returns

`Promise`\<[`ResponseData`](../classes/ResponseData.md)\<`T`\>\>

***

### getExternalApiData()

> **getExternalApiData**\<`T`\>(`urlOrOptions`): `Promise`\<[`ResponseData`](../classes/ResponseData.md)\<`T`\>\>

Defined in: [listgrid/api/ApiClient.ts:35](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/api/ApiClient.ts#L35)

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### urlOrOptions

`string` \| [`ApiRequestOptions`](ApiRequestOptions.md)

#### Returns

`Promise`\<[`ResponseData`](../classes/ResponseData.md)\<`T`\>\>

***

### getExternalApiDataWithError()

> **getExternalApiDataWithError**\<`T`\>(`urlOrOptions`): `Promise`\<[`ResponseData`](../classes/ResponseData.md)\<`T`\>\>

Defined in: [listgrid/api/ApiClient.ts:36](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/api/ApiClient.ts#L36)

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### urlOrOptions

`string` \| [`ApiRequestOptions`](ApiRequestOptions.md)

#### Returns

`Promise`\<[`ResponseData`](../classes/ResponseData.md)\<`T`\>\>
