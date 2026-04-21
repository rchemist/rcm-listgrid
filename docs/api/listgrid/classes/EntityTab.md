[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / EntityTab

# Class: EntityTab

Defined in: [listgrid/config/EntityTab.ts:6](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityTab.ts#L6)

## Constructors

### Constructor

> **new EntityTab**(`config?`): `EntityTab`

Defined in: [listgrid/config/EntityTab.ts:15](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityTab.ts#L15)

#### Parameters

##### config?

[`TabInfo`](../type-aliases/TabInfo.md)

#### Returns

`EntityTab`

## Properties

### id

> **id**: `string`

Defined in: [listgrid/config/EntityTab.ts:7](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityTab.ts#L7)

***

### label

> **label**: `string`

Defined in: [listgrid/config/EntityTab.ts:8](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityTab.ts#L8)

***

### order

> **order**: `number`

Defined in: [listgrid/config/EntityTab.ts:9](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityTab.ts#L9)

***

### hidden?

> `optional` **hidden?**: `boolean`

Defined in: [listgrid/config/EntityTab.ts:10](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityTab.ts#L10)

***

### description?

> `optional` **description?**: `ReactNode`

Defined in: [listgrid/config/EntityTab.ts:11](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityTab.ts#L11)

***

### fieldGroups

> **fieldGroups**: [`EntityFieldGroup`](EntityFieldGroup.md)[] = `[]`

Defined in: [listgrid/config/EntityTab.ts:12](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityTab.ts#L12)

***

### requiredPermissions?

> `optional` **requiredPermissions?**: `string`[]

Defined in: [listgrid/config/EntityTab.ts:13](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityTab.ts#L13)

## Methods

### withRequiredPermissions()

> **withRequiredPermissions**(...`permissions`): `this`

Defined in: [listgrid/config/EntityTab.ts:28](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityTab.ts#L28)

이 탭을 보기 위해 필요한 권한을 설정합니다.
사용자가 지정된 권한 중 하나라도 가지고 있으면 탭이 표시됩니다.

#### Parameters

##### permissions

...`string`[]

#### Returns

`this`

***

### isPermitted()

> **isPermitted**(`userPermissions?`): `boolean`

Defined in: [listgrid/config/EntityTab.ts:42](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityTab.ts#L42)

사용자가 이 탭을 볼 수 있는 권한이 있는지 확인합니다.
requiredPermissions가 없거나 비어있으면 true를 반환합니다.
사용자가 requiredPermissions 중 하나라도 가지고 있으면 true를 반환합니다.

#### Parameters

##### userPermissions?

`string`[]

#### Returns

`boolean`

***

### clone()

> **clone**(): `EntityTab`

Defined in: [listgrid/config/EntityTab.ts:52](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityTab.ts#L52)

#### Returns

`EntityTab`

***

### addField()

> **addField**(`fieldGroup`, `field`): `void`

Defined in: [listgrid/config/EntityTab.ts:72](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityTab.ts#L72)

#### Parameters

##### fieldGroup

[`FieldGroupInfo`](../type-aliases/FieldGroupInfo.md)

##### field

[`EntityItem`](../interfaces/EntityItem.md)

#### Returns

`void`
