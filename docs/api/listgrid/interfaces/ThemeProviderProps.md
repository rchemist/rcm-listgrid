[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ThemeProviderProps

# Interface: ThemeProviderProps

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:548](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L548)

통합 테마 Provider props 타입

## Properties

### theme?

> `optional` **theme?**: `Partial`\<[`ThemeClassNames`](ThemeClassNames.md)\>

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:550](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L550)

커스텀 테마 (기본 테마에 병합됨)

***

### variant?

> `optional` **variant?**: [`ThemeVariant`](../type-aliases/ThemeVariant.md)

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:552](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L552)

테마 변형 (default, main, subCollection, modal 등)

***

### fieldRenderers?

> `optional` **fieldRenderers?**: [`FieldRendererMap`](../type-aliases/FieldRendererMap.md)

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:557](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L557)

커스텀 필드 렌더러
특정 필드의 View를 완전히 다른 컴포넌트로 대체

***

### children

> **children**: `ReactNode`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:559](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L559)

자식 컴포넌트
