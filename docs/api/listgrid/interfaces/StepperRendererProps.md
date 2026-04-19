[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / StepperRendererProps

# Interface: StepperRendererProps

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:428](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L428)

Custom stepper renderer props for create step mode
CreateStep 모드에서 커스텀 스테퍼 렌더러에 전달되는 Props

## Properties

### steps

> **steps**: `object`[]

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:430](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L430)

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

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:432](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L432)

Current active step index

***

### maxStep

> **maxStep**: `number`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:434](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L434)

Maximum step index

***

### onStepClick

> **onStepClick**: (`step`) => `void`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:436](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L436)

Step click handler

#### Parameters

##### step

`number`

#### Returns

`void`
