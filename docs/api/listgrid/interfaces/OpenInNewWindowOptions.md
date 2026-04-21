[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / OpenInNewWindowOptions

# Interface: OpenInNewWindowOptions

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:117](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGrid.types.ts#L117)

새창 열기 옵션 인터페이스

## Properties

### enabled

> **enabled**: `boolean`

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:119](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGrid.types.ts#L119)

활성화 여부 (기본값: false)

***

### tooltip?

> `optional` **tooltip?**: `string`

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:121](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGrid.types.ts#L121)

버튼 툴팁 텍스트

***

### windowFeatures?

> `optional` **windowFeatures?**: `object`

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:123](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGrid.types.ts#L123)

새창 크기 설정

#### width?

> `optional` **width?**: `number`

#### height?

> `optional` **height?**: `number`

***

### showFilter?

> `optional` **showFilter?**: (`item`) => `boolean`

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:128](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGrid.types.ts#L128)

행별 표시 여부 필터 (특정 조건의 항목만 새창 버튼 표시)

#### Parameters

##### item

`any`

#### Returns

`boolean`
