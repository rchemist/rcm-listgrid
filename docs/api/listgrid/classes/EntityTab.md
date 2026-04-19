[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / EntityTab

# Class: EntityTab

Defined in: [listgrid/config/EntityTab.ts:13](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityTab.ts#L13)

## Constructors

### Constructor

> **new EntityTab**(`config?`): `EntityTab`

Defined in: [listgrid/config/EntityTab.ts:22](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityTab.ts#L22)

#### Parameters

##### config?

[`TabInfo`](../type-aliases/TabInfo.md)

#### Returns

`EntityTab`

## Properties

### id

> **id**: `string`

Defined in: [listgrid/config/EntityTab.ts:14](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityTab.ts#L14)

***

### label

> **label**: `string`

Defined in: [listgrid/config/EntityTab.ts:15](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityTab.ts#L15)

***

### order

> **order**: `number`

Defined in: [listgrid/config/EntityTab.ts:16](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityTab.ts#L16)

***

### hidden?

> `optional` **hidden?**: `boolean`

Defined in: [listgrid/config/EntityTab.ts:17](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityTab.ts#L17)

***

### description?

> `optional` **description?**: `ReactNode`

Defined in: [listgrid/config/EntityTab.ts:18](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityTab.ts#L18)

***

### fieldGroups

> **fieldGroups**: [`EntityFieldGroup`](EntityFieldGroup.md)[] = `[]`

Defined in: [listgrid/config/EntityTab.ts:19](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityTab.ts#L19)

***

### requiredPermissions?

> `optional` **requiredPermissions?**: `string`[]

Defined in: [listgrid/config/EntityTab.ts:20](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityTab.ts#L20)

## Methods

### withRequiredPermissions()

> **withRequiredPermissions**(...`permissions`): `this`

Defined in: [listgrid/config/EntityTab.ts:35](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityTab.ts#L35)

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

Defined in: [listgrid/config/EntityTab.ts:49](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityTab.ts#L49)

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

Defined in: [listgrid/config/EntityTab.ts:59](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityTab.ts#L59)

#### Returns

`EntityTab`

***

### addField()

> **addField**(`fieldGroup`, `field`): `void`

Defined in: [listgrid/config/EntityTab.ts:79](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityTab.ts#L79)

#### Parameters

##### fieldGroup

[`FieldGroupInfo`](../type-aliases/FieldGroupInfo.md)

##### field

[`EntityItem`](../interfaces/EntityItem.md)

#### Returns

`void`
