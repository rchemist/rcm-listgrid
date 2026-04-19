[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ListGridThemeContextValue

# Interface: ListGridThemeContextValue

Defined in: [listgrid/components/list/types/ViewListGridTheme.types.ts:393](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/list/types/ViewListGridTheme.types.ts#L393)

ListGrid 테마 컨텍스트 값 타입

## Properties

### classNames

> **classNames**: [`ViewListGridClassNames`](ViewListGridClassNames.md)

Defined in: [listgrid/components/list/types/ViewListGridTheme.types.ts:395](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/list/types/ViewListGridTheme.types.ts#L395)

클래스 이름 객체

***

### cn

> **cn**: (`base`, `custom?`) => `string`

Defined in: [listgrid/components/list/types/ViewListGridTheme.types.ts:402](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/list/types/ViewListGridTheme.types.ts#L402)

기본 클래스와 커스텀 클래스를 병합

#### Parameters

##### base

`string`

기본 Tailwind 클래스

##### custom?

`string`

커스텀 클래스 (선택사항)

#### Returns

`string`

병합된 클래스 문자열

***

### variant

> **variant**: [`ListGridThemeVariant`](../type-aliases/ListGridThemeVariant.md)

Defined in: [listgrid/components/list/types/ViewListGridTheme.types.ts:404](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/list/types/ViewListGridTheme.types.ts#L404)

현재 적용된 변형
