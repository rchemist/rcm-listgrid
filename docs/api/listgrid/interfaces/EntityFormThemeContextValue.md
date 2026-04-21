[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / EntityFormThemeContextValue

# Interface: EntityFormThemeContextValue

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:377](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L377)

테마 컨텍스트 값 타입

## Properties

### classNames

> **classNames**: [`ViewEntityFormClassNames`](ViewEntityFormClassNames.md)

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:379](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L379)

클래스 이름 객체

***

### cn

> **cn**: (`base`, `custom?`) => `string`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:386](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L386)

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

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:391](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L391)

커스텀 필드 렌더러
특정 필드명에 대해 기본 View 대신 사용할 커스텀 컴포넌트

***

### getFieldRenderer

> **getFieldRenderer**: (`fieldName`) => `ComponentType`\<[`CustomFieldRendererProps`](CustomFieldRendererProps.md)\> \| `undefined`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:397](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L397)

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

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:401](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L401)

버튼 라벨 오버라이드

***

### stepperRenderer?

> `optional` **stepperRenderer?**: [`StepperRenderer`](../type-aliases/StepperRenderer.md)

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:403](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L403)

Custom stepper renderer for create step mode

***

### createStepButtonPosition?

> `optional` **createStepButtonPosition?**: `"bottom"` \| `"top"`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:405](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L405)

Create step button position: 'top' (inside stepper panel) or 'bottom' (below form fields)
