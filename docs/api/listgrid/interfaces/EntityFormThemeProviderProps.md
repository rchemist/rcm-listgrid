[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / EntityFormThemeProviderProps

# Interface: EntityFormThemeProviderProps

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:441](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L441)

테마 Provider props 타입

## Properties

### theme?

> `optional` **theme?**: `Partial`\<[`ViewEntityFormClassNames`](ViewEntityFormClassNames.md)\>

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:443](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L443)

커스텀 테마 (기본 테마에 병합됨)

***

### buttonLabels?

> `optional` **buttonLabels?**: [`ButtonLabelOverrides`](ButtonLabelOverrides.md)

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:445](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L445)

버튼 라벨 오버라이드

***

### fieldRenderers?

> `optional` **fieldRenderers?**: [`FieldRendererMap`](../type-aliases/FieldRendererMap.md)

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:463](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L463)

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

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:465](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L465)

Custom stepper renderer for create step mode

***

### createStepButtonPosition?

> `optional` **createStepButtonPosition?**: `"bottom"` \| `"top"`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:467](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L467)

Create step button position

***

### children

> **children**: `ReactNode`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:469](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L469)

자식 컴포넌트
