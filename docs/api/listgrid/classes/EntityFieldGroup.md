[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / EntityFieldGroup

# Class: EntityFieldGroup

Defined in: [listgrid/config/EntityFieldGroup.ts:4](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFieldGroup.ts#L4)

## Constructors

### Constructor

> **new EntityFieldGroup**(`config?`): `EntityFieldGroup`

Defined in: [listgrid/config/EntityFieldGroup.ts:23](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFieldGroup.ts#L23)

#### Parameters

##### config?

[`FieldGroupInfo`](../type-aliases/FieldGroupInfo.md)

#### Returns

`EntityFieldGroup`

## Properties

### id

> **id**: `string`

Defined in: [listgrid/config/EntityFieldGroup.ts:5](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFieldGroup.ts#L5)

***

### label

> **label**: `string`

Defined in: [listgrid/config/EntityFieldGroup.ts:6](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFieldGroup.ts#L6)

***

### order

> **order**: `number`

Defined in: [listgrid/config/EntityFieldGroup.ts:7](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFieldGroup.ts#L7)

***

### span?

> `optional` **span?**: `object`

Defined in: [listgrid/config/EntityFieldGroup.ts:8](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFieldGroup.ts#L8)

#### base?

> `optional` **base?**: `SpanValue`

#### xs?

> `optional` **xs?**: `SpanValue`

#### sm?

> `optional` **sm?**: `SpanValue`

#### md?

> `optional` **md?**: `SpanValue`

#### lg?

> `optional` **lg?**: `SpanValue`

#### xl?

> `optional` **xl?**: `SpanValue`

***

### fields

> **fields**: [`FieldGroupItem`](../interfaces/FieldGroupItem.md)[] = `[]`

Defined in: [listgrid/config/EntityFieldGroup.ts:18](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFieldGroup.ts#L18)

***

### description?

> `optional` **description?**: `string`

Defined in: [listgrid/config/EntityFieldGroup.ts:19](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFieldGroup.ts#L19)

***

### config?

> `optional` **config?**: [`FieldGroupConfig`](../type-aliases/FieldGroupConfig.md)

Defined in: [listgrid/config/EntityFieldGroup.ts:20](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFieldGroup.ts#L20)

***

### requiredPermissions?

> `optional` **requiredPermissions?**: `string`[]

Defined in: [listgrid/config/EntityFieldGroup.ts:21](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFieldGroup.ts#L21)

## Methods

### create()

> `static` **create**(`id`, `label`, `order`): `EntityFieldGroup`

Defined in: [listgrid/config/EntityFieldGroup.ts:32](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFieldGroup.ts#L32)

#### Parameters

##### id

`string`

##### label

`string`

##### order

`number`

#### Returns

`EntityFieldGroup`

***

### withRequiredPermissions()

> **withRequiredPermissions**(...`permissions`): `this`

Defined in: [listgrid/config/EntityFieldGroup.ts:40](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFieldGroup.ts#L40)

이 필드그룹을 보기 위해 필요한 권한을 설정합니다.
사용자가 지정된 권한 중 하나라도 가지고 있으면 필드그룹이 표시됩니다.

#### Parameters

##### permissions

...`string`[]

#### Returns

`this`

***

### isPermitted()

> **isPermitted**(`userPermissions?`): `boolean`

Defined in: [listgrid/config/EntityFieldGroup.ts:54](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFieldGroup.ts#L54)

사용자가 이 필드그룹을 볼 수 있는 권한이 있는지 확인합니다.
requiredPermissions가 없거나 비어있으면 true를 반환합니다.
사용자가 requiredPermissions 중 하나라도 가지고 있으면 true를 반환합니다.

#### Parameters

##### userPermissions?

`string`[]

#### Returns

`boolean`

***

### clone()

> **clone**(): `EntityFieldGroup`

Defined in: [listgrid/config/EntityFieldGroup.ts:64](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityFieldGroup.ts#L64)

#### Returns

`EntityFieldGroup`
