[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / EntityFormButton

# Class: EntityFormButton

Defined in: [listgrid/config/EntityFormButton.tsx:46](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFormButton.tsx#L46)

## Constructors

### Constructor

> **new EntityFormButton**(`id`): `EntityFormButton`

Defined in: [listgrid/config/EntityFormButton.tsx:56](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFormButton.tsx#L56)

#### Parameters

##### id

`string`

#### Returns

`EntityFormButton`

## Properties

### id

> `readonly` **id**: `string`

Defined in: [listgrid/config/EntityFormButton.tsx:47](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFormButton.tsx#L47)

***

### icon?

> `optional` **icon?**: `ReactNode`

Defined in: [listgrid/config/EntityFormButton.tsx:48](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFormButton.tsx#L48)

***

### label?

> `optional` **label?**: [`LabelType`](../type-aliases/LabelType.md)

Defined in: [listgrid/config/EntityFormButton.tsx:49](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFormButton.tsx#L49)

***

### className?

> `optional` **className?**: `string`

Defined in: [listgrid/config/EntityFormButton.tsx:50](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFormButton.tsx#L50)

***

### onClick?

> `optional` **onClick?**: (`props`) => `Promise`\<[`EntityForm`](EntityForm.md)\<`any`\>\>

Defined in: [listgrid/config/EntityFormButton.tsx:51](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFormButton.tsx#L51)

#### Parameters

##### props

[`EntityFormButtonProps`](../interfaces/EntityFormButtonProps.md)

#### Returns

`Promise`\<[`EntityForm`](EntityForm.md)\<`any`\>\>

***

### disabled?

> `optional` **disabled?**: (`props`) => `Promise`\<`boolean`\>

Defined in: [listgrid/config/EntityFormButton.tsx:52](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFormButton.tsx#L52)

#### Parameters

##### props

[`EntityFormButtonProps`](../interfaces/EntityFormButtonProps.md)

#### Returns

`Promise`\<`boolean`\>

***

### hidden?

> `optional` **hidden?**: (`props`) => `Promise`\<`boolean`\>

Defined in: [listgrid/config/EntityFormButton.tsx:53](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFormButton.tsx#L53)

#### Parameters

##### props

[`EntityFormButtonProps`](../interfaces/EntityFormButtonProps.md)

#### Returns

`Promise`\<`boolean`\>

***

### tooltip?

> `optional` **tooltip?**: (`props`) => `Promise`\<`ReactNode`\>

Defined in: [listgrid/config/EntityFormButton.tsx:54](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFormButton.tsx#L54)

#### Parameters

##### props

[`EntityFormButtonProps`](../interfaces/EntityFormButtonProps.md)

#### Returns

`Promise`\<`ReactNode`\>

## Methods

### getId()

> **getId**(): `string`

Defined in: [listgrid/config/EntityFormButton.tsx:61](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFormButton.tsx#L61)

#### Returns

`string`

***

### isOverwrite()

> **isOverwrite**(`id`): `boolean`

Defined in: [listgrid/config/EntityFormButton.tsx:66](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFormButton.tsx#L66)

#### Parameters

##### id

`string`

#### Returns

`boolean`

***

### withIcon()

> **withIcon**(`icon?`): `EntityFormButton`

Defined in: [listgrid/config/EntityFormButton.tsx:70](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFormButton.tsx#L70)

#### Parameters

##### icon?

`ReactNode`

#### Returns

`EntityFormButton`

***

### withLabel()

> **withLabel**(`label?`): `EntityFormButton`

Defined in: [listgrid/config/EntityFormButton.tsx:75](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFormButton.tsx#L75)

#### Parameters

##### label?

`ReactNode`

#### Returns

`EntityFormButton`

***

### withClassName()

> **withClassName**(`className?`): `EntityFormButton`

Defined in: [listgrid/config/EntityFormButton.tsx:80](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFormButton.tsx#L80)

#### Parameters

##### className?

`string`

#### Returns

`EntityFormButton`

***

### withOnClick()

> **withOnClick**(`onClick?`): `EntityFormButton`

Defined in: [listgrid/config/EntityFormButton.tsx:85](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFormButton.tsx#L85)

#### Parameters

##### onClick?

(`props`) => `Promise`\<[`EntityForm`](EntityForm.md)\<`any`\>\>

#### Returns

`EntityFormButton`

***

### withDisabled()

> **withDisabled**(`disabled?`): `EntityFormButton`

Defined in: [listgrid/config/EntityFormButton.tsx:90](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFormButton.tsx#L90)

#### Parameters

##### disabled?

(`props`) => `Promise`\<`boolean`\>

#### Returns

`EntityFormButton`

***

### withHidden()

> **withHidden**(`hidden?`): `EntityFormButton`

Defined in: [listgrid/config/EntityFormButton.tsx:95](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFormButton.tsx#L95)

#### Parameters

##### hidden?

(`props`) => `Promise`\<`boolean`\>

#### Returns

`EntityFormButton`

***

### withTooltip()

> **withTooltip**(`tooltip?`): `EntityFormButton`

Defined in: [listgrid/config/EntityFormButton.tsx:100](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFormButton.tsx#L100)

#### Parameters

##### tooltip?

(`props`) => `Promise`\<`ReactNode`\>

#### Returns

`EntityFormButton`
