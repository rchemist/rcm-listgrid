[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / EntityFormThemeContextValue

# Interface: EntityFormThemeContextValue

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:384](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L384)

테마 컨텍스트 값 타입

## Properties

### classNames

> **classNames**: [`ViewEntityFormClassNames`](ViewEntityFormClassNames.md)

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:386](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L386)

클래스 이름 객체

***

### cn

> **cn**: (`base`, `custom?`) => `string`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:393](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L393)

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

### fieldRenderers?

> `optional` **fieldRenderers?**: [`FieldRendererMap`](../type-aliases/FieldRendererMap.md)

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:398](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L398)

커스텀 필드 렌더러
특정 필드명에 대해 기본 View 대신 사용할 커스텀 컴포넌트

***

### getFieldRenderer

> **getFieldRenderer**: (`fieldName`) => `ComponentType`\<[`CustomFieldRendererProps`](CustomFieldRendererProps.md)\> \| `undefined`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:404](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L404)

특정 필드에 대한 커스텀 렌더러가 있는지 확인

#### Parameters

##### fieldName

`string`

필드명

#### Returns

`ComponentType`\<[`CustomFieldRendererProps`](CustomFieldRendererProps.md)\> \| `undefined`

커스텀 렌더러 컴포넌트 또는 undefined

***

### buttonLabels?

> `optional` **buttonLabels?**: [`ButtonLabelOverrides`](ButtonLabelOverrides.md)

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:408](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L408)

버튼 라벨 오버라이드

***

### stepperRenderer?

> `optional` **stepperRenderer?**: [`StepperRenderer`](../type-aliases/StepperRenderer.md)

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:410](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L410)

Custom stepper renderer for create step mode

***

### createStepButtonPosition?

> `optional` **createStepButtonPosition?**: `"bottom"` \| `"top"`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:412](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L412)

Create step button position: 'top' (inside stepper panel) or 'bottom' (below form fields)
