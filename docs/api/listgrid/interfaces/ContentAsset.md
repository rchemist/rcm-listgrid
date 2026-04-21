[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ContentAsset

# Interface: ContentAsset

Defined in: [listgrid/components/fields/contentasset/types.ts:5](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/contentasset/types.ts#L5)

ContentAsset 인터페이스
범용적인 파일 업로드 및 관리를 위한 자산 타입

## Properties

### id?

> `optional` **id?**: `string`

Defined in: [listgrid/components/fields/contentasset/types.ts:7](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/contentasset/types.ts#L7)

백엔드 서버에서 받은 고유 식별자

***

### title

> **title**: `string`

Defined in: [listgrid/components/fields/contentasset/types.ts:10](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/contentasset/types.ts#L10)

컨텐츠 제목 (필수, 중복 불가)

***

### content?

> `optional` **content?**: `string`

Defined in: [listgrid/components/fields/contentasset/types.ts:13](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/contentasset/types.ts#L13)

부가 설명 텍스트

***

### assetUrl

> **assetUrl**: `string`

Defined in: [listgrid/components/fields/contentasset/types.ts:16](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/contentasset/types.ts#L16)

업로드된 파일의 URL
