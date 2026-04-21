[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / StepperRendererProps

# Interface: StepperRendererProps

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:421](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L421)

Custom stepper renderer props for create step mode
CreateStep 모드에서 커스텀 스테퍼 렌더러에 전달되는 Props

## Properties

### steps

> **steps**: `object`[]

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:423](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L423)

Step definitions

#### id

> **id**: `string`

#### label

> **label**: `string`

#### description?

> `optional` **description?**: `string`

***

### currentStep

> **currentStep**: `number`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:425](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L425)

Current active step index

***

### maxStep

> **maxStep**: `number`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:427](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L427)

Maximum step index

***

### onStepClick

> **onStepClick**: (`step`) => `void`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:429](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L429)

Step click handler

#### Parameters

##### step

`number`

#### Returns

`void`
