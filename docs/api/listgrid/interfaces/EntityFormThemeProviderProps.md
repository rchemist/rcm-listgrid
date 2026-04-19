[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / EntityFormThemeProviderProps

# Interface: EntityFormThemeProviderProps

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:448](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L448)

테마 Provider props 타입

## Properties

### theme?

> `optional` **theme?**: `Partial`\<[`ViewEntityFormClassNames`](ViewEntityFormClassNames.md)\>

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:450](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L450)

커스텀 테마 (기본 테마에 병합됨)

***

### buttonLabels?

> `optional` **buttonLabels?**: [`ButtonLabelOverrides`](ButtonLabelOverrides.md)

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:452](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L452)

버튼 라벨 오버라이드

***

### fieldRenderers?

> `optional` **fieldRenderers?**: [`FieldRendererMap`](../type-aliases/FieldRendererMap.md)

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:470](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L470)

커스텀 필드 렌더러
특정 필드의 View를 완전히 다른 컴포넌트로 대체

#### Example

```tsx
<EntityFormThemeProvider
  theme={myTheme}
  fieldRenderers={{
    syllabus: CardManyToOneView,
    selection: CardManyToOneView,
  }}
>
  {children}
</EntityFormThemeProvider>
```

***

### stepperRenderer?

> `optional` **stepperRenderer?**: [`StepperRenderer`](../type-aliases/StepperRenderer.md)

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:472](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L472)

Custom stepper renderer for create step mode

***

### createStepButtonPosition?

> `optional` **createStepButtonPosition?**: `"bottom"` \| `"top"`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:474](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L474)

Create step button position

***

### children

> **children**: `ReactNode`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:476](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L476)

자식 컴포넌트
