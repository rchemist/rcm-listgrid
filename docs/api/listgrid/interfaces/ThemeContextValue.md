[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ThemeContextValue

# Interface: ThemeContextValue

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:516](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L516)

통합 테마 컨텍스트 값 타입

## Properties

### entityFormClassNames

> **entityFormClassNames**: [`ViewEntityFormClassNames`](ViewEntityFormClassNames.md)

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:518](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L518)

EntityForm 클래스 이름 객체

***

### listGridClassNames

> **listGridClassNames**: [`ViewListGridClassNames`](ViewListGridClassNames.md)

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:520](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L520)

ListGrid 클래스 이름 객체

***

### cn

> **cn**: (`base`, `custom?`) => `string`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:527](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L527)

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

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:529](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L529)

현재 적용된 변형

***

### fieldRenderers?

> `optional` **fieldRenderers?**: [`FieldRendererMap`](../type-aliases/FieldRendererMap.md)

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:534](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L534)

커스텀 필드 렌더러
특정 필드명에 대해 기본 View 대신 사용할 커스텀 컴포넌트

***

### getFieldRenderer

> **getFieldRenderer**: (`fieldName`) => `ComponentType`\<[`CustomFieldRendererProps`](CustomFieldRendererProps.md)\> \| `undefined`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:540](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L540)

특정 필드에 대한 커스텀 렌더러가 있는지 확인

#### Parameters

##### fieldName

`string`

필드명

#### Returns

`ComponentType`\<[`CustomFieldRendererProps`](CustomFieldRendererProps.md)\> \| `undefined`

커스텀 렌더러 컴포넌트 또는 undefined
