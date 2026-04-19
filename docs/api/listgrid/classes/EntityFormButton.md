[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / EntityFormButton

# Class: EntityFormButton

Defined in: [listgrid/config/EntityFormButton.tsx:53](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFormButton.tsx#L53)

## Constructors

### Constructor

> **new EntityFormButton**(`id`): `EntityFormButton`

Defined in: [listgrid/config/EntityFormButton.tsx:63](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFormButton.tsx#L63)

#### Parameters

##### id

`string`

#### Returns

`EntityFormButton`

## Properties

### id

> `readonly` **id**: `string`

Defined in: [listgrid/config/EntityFormButton.tsx:54](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFormButton.tsx#L54)

***

### icon?

> `optional` **icon?**: `ReactNode`

Defined in: [listgrid/config/EntityFormButton.tsx:55](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFormButton.tsx#L55)

***

### label?

> `optional` **label?**: [`LabelType`](../type-aliases/LabelType.md)

Defined in: [listgrid/config/EntityFormButton.tsx:56](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFormButton.tsx#L56)

***

### className?

> `optional` **className?**: `string`

Defined in: [listgrid/config/EntityFormButton.tsx:57](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFormButton.tsx#L57)

***

### onClick?

> `optional` **onClick?**: (`props`) => `Promise`\<[`EntityForm`](EntityForm.md)\<`any`\>\>

Defined in: [listgrid/config/EntityFormButton.tsx:58](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFormButton.tsx#L58)

#### Parameters

##### props

[`EntityFormButtonProps`](../interfaces/EntityFormButtonProps.md)

#### Returns

`Promise`\<[`EntityForm`](EntityForm.md)\<`any`\>\>

***

### disabled?

> `optional` **disabled?**: (`props`) => `Promise`\<`boolean`\>

Defined in: [listgrid/config/EntityFormButton.tsx:59](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFormButton.tsx#L59)

#### Parameters

##### props

[`EntityFormButtonProps`](../interfaces/EntityFormButtonProps.md)

#### Returns

`Promise`\<`boolean`\>

***

### hidden?

> `optional` **hidden?**: (`props`) => `Promise`\<`boolean`\>

Defined in: [listgrid/config/EntityFormButton.tsx:60](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFormButton.tsx#L60)

#### Parameters

##### props

[`EntityFormButtonProps`](../interfaces/EntityFormButtonProps.md)

#### Returns

`Promise`\<`boolean`\>

***

### tooltip?

> `optional` **tooltip?**: (`props`) => `Promise`\<`ReactNode`\>

Defined in: [listgrid/config/EntityFormButton.tsx:61](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFormButton.tsx#L61)

#### Parameters

##### props

[`EntityFormButtonProps`](../interfaces/EntityFormButtonProps.md)

#### Returns

`Promise`\<`ReactNode`\>

## Methods

### getId()

> **getId**(): `string`

Defined in: [listgrid/config/EntityFormButton.tsx:68](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFormButton.tsx#L68)

#### Returns

`string`

***

### isOverwrite()

> **isOverwrite**(`id`): `boolean`

Defined in: [listgrid/config/EntityFormButton.tsx:73](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFormButton.tsx#L73)

#### Parameters

##### id

`string`

#### Returns

`boolean`

***

### withIcon()

> **withIcon**(`icon?`): `EntityFormButton`

Defined in: [listgrid/config/EntityFormButton.tsx:77](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFormButton.tsx#L77)

#### Parameters

##### icon?

`ReactNode`

#### Returns

`EntityFormButton`

***

### withLabel()

> **withLabel**(`label?`): `EntityFormButton`

Defined in: [listgrid/config/EntityFormButton.tsx:82](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFormButton.tsx#L82)

#### Parameters

##### label?

`ReactNode`

#### Returns

`EntityFormButton`

***

### withClassName()

> **withClassName**(`className?`): `EntityFormButton`

Defined in: [listgrid/config/EntityFormButton.tsx:87](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFormButton.tsx#L87)

#### Parameters

##### className?

`string`

#### Returns

`EntityFormButton`

***

### withOnClick()

> **withOnClick**(`onClick?`): `EntityFormButton`

Defined in: [listgrid/config/EntityFormButton.tsx:92](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFormButton.tsx#L92)

#### Parameters

##### onClick?

(`props`) => `Promise`\<[`EntityForm`](EntityForm.md)\<`any`\>\>

#### Returns

`EntityFormButton`

***

### withDisabled()

> **withDisabled**(`disabled?`): `EntityFormButton`

Defined in: [listgrid/config/EntityFormButton.tsx:97](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFormButton.tsx#L97)

#### Parameters

##### disabled?

(`props`) => `Promise`\<`boolean`\>

#### Returns

`EntityFormButton`

***

### withHidden()

> **withHidden**(`hidden?`): `EntityFormButton`

Defined in: [listgrid/config/EntityFormButton.tsx:102](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFormButton.tsx#L102)

#### Parameters

##### hidden?

(`props`) => `Promise`\<`boolean`\>

#### Returns

`EntityFormButton`

***

### withTooltip()

> **withTooltip**(`tooltip?`): `EntityFormButton`

Defined in: [listgrid/config/EntityFormButton.tsx:107](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFormButton.tsx#L107)

#### Parameters

##### tooltip?

(`props`) => `Promise`\<`ReactNode`\>

#### Returns

`EntityFormButton`
