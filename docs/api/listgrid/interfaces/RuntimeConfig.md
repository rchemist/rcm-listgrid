[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / RuntimeConfig

# Interface: RuntimeConfig

Defined in: [listgrid/config/RuntimeConfig.ts:8](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/RuntimeConfig.ts#L8)

## Properties

### cacheControl?

> `optional` **cacheControl?**: `boolean`

Defined in: [listgrid/config/RuntimeConfig.ts:10](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/RuntimeConfig.ts#L10)

Enables server-side-rendered list caching hints.

***

### useServerSideCache?

> `optional` **useServerSideCache?**: `boolean`

Defined in: [listgrid/config/RuntimeConfig.ts:12](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/RuntimeConfig.ts#L12)

Enables an alternate listgrid data pipeline (server-side cache).

***

### searchFormHashKey?

> `optional` **searchFormHashKey?**: `string`

Defined in: [listgrid/config/RuntimeConfig.ts:14](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/RuntimeConfig.ts#L14)

sessionStorage key prefix for SearchForm persistence.

***

### debugListGridPerformance?

> `optional` **debugListGridPerformance?**: `boolean`

Defined in: [listgrid/config/RuntimeConfig.ts:16](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/RuntimeConfig.ts#L16)

Performance logging toggle for the listgrid engine.

***

### isDevelopment?

> `optional` **isDevelopment?**: `boolean`

Defined in: [listgrid/config/RuntimeConfig.ts:18](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/RuntimeConfig.ts#L18)

True when NODE_ENV === 'development' (used by perf logger).

***

### kakaoMapAppKey?

> `optional` **kakaoMapAppKey?**: `string`

Defined in: [listgrid/config/RuntimeConfig.ts:20](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/RuntimeConfig.ts#L20)

Kakao Maps JS SDK app key.

***

### cryptKey?

> `optional` **cryptKey?**: `string`

Defined in: [listgrid/config/RuntimeConfig.ts:22](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/RuntimeConfig.ts#L22)

simpleCrypt passphrase / secret (replaces NEXT_PUBLIC_CRYPT_KEY).
