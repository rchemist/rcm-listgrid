[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ThemeContextValue

# Interface: ThemeContextValue

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:509](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L509)

통합 테마 컨텍스트 값 타입

## Properties

### entityFormClassNames

> **entityFormClassNames**: [`ViewEntityFormClassNames`](ViewEntityFormClassNames.md)

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:511](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L511)

EntityForm 클래스 이름 객체

***

### listGridClassNames

> **listGridClassNames**: [`ViewListGridClassNames`](ViewListGridClassNames.md)

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:513](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L513)

ListGrid 클래스 이름 객체

***

### cn

> **cn**: (`base`, `custom?`) => `string`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:520](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L520)

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

> **variant**: [`ThemeVariant`](../type-aliases/ThemeVariant.md)

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:522](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L522)

현재 적용된 변형

***

### fieldRenderers?

> `optional` **fieldRenderers?**: [`FieldRendererMap`](../type-aliases/FieldRendererMap.md)

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:527](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L527)

커스텀 필드 렌더러
특정 필드명에 대해 기본 View 대신 사용할 커스텀 컴포넌트

***

### getFieldRenderer

> **getFieldRenderer**: (`fieldName`) => `ComponentType`\<[`CustomFieldRendererProps`](CustomFieldRendererProps.md)\> \| `undefined`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:533](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L533)

특정 필드에 대한 커스텀 렌더러가 있는지 확인

#### Parameters

##### fieldName

`string`

필드명

#### Returns

`ComponentType`\<[`CustomFieldRendererProps`](CustomFieldRendererProps.md)\> \| `undefined`

커스텀 렌더러 컴포넌트 또는 undefined
