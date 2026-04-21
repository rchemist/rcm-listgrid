[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ListGridThemeContextValue

# Interface: ListGridThemeContextValue

Defined in: [listgrid/components/list/types/ViewListGridTheme.types.ts:386](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGridTheme.types.ts#L386)

ListGrid 테마 컨텍스트 값 타입

## Properties

### classNames

> **classNames**: [`ViewListGridClassNames`](ViewListGridClassNames.md)

Defined in: [listgrid/components/list/types/ViewListGridTheme.types.ts:388](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGridTheme.types.ts#L388)

클래스 이름 객체

***

### cn

> **cn**: (`base`, `custom?`) => `string`

Defined in: [listgrid/components/list/types/ViewListGridTheme.types.ts:395](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGridTheme.types.ts#L395)

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

Defined in: [listgrid/components/list/types/ViewListGridTheme.types.ts:397](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGridTheme.types.ts#L397)

현재 적용된 변형
