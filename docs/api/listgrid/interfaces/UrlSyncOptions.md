[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / UrlSyncOptions

# Interface: UrlSyncOptions

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:135](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/list/types/ViewListGrid.types.ts#L135)

URL 동기화 옵션 인터페이스
ListGrid의 페이징, 검색, 필터, 정렬 상태를 URL과 동기화

## Properties

### enabled?

> `optional` **enabled?**: `boolean`

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:137](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/list/types/ViewListGrid.types.ts#L137)

URL 동기화 활성화 여부 (기본값: isMainEntity일 때 true)

***

### includeFilters?

> `optional` **includeFilters?**: `boolean`

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:139](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/list/types/ViewListGrid.types.ts#L139)

필터를 URL에 포함할지 여부 (기본값: true)

***

### includeSort?

> `optional` **includeSort?**: `boolean`

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:141](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/list/types/ViewListGrid.types.ts#L141)

정렬을 URL에 포함할지 여부 (기본값: true)

***

### includePageSize?

> `optional` **includePageSize?**: `boolean`

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:143](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/list/types/ViewListGrid.types.ts#L143)

페이지 크기를 URL에 포함할지 여부 (기본값: false)

***

### sessionStorageFallback?

> `optional` **sessionStorageFallback?**: `boolean`

Defined in: [listgrid/components/list/types/ViewListGrid.types.ts:145](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/list/types/ViewListGrid.types.ts#L145)

sessionStorage 폴백 사용 여부 (기본값: true)
