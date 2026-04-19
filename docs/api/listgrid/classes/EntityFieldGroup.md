[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / EntityFieldGroup

# Class: EntityFieldGroup

Defined in: [listgrid/config/EntityFieldGroup.ts:11](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFieldGroup.ts#L11)

## Constructors

### Constructor

> **new EntityFieldGroup**(`config?`): `EntityFieldGroup`

Defined in: [listgrid/config/EntityFieldGroup.ts:30](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFieldGroup.ts#L30)

#### Parameters

##### config?

[`FieldGroupInfo`](../type-aliases/FieldGroupInfo.md)

#### Returns

`EntityFieldGroup`

## Properties

### id

> **id**: `string`

Defined in: [listgrid/config/EntityFieldGroup.ts:12](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFieldGroup.ts#L12)

***

### label

> **label**: `string`

Defined in: [listgrid/config/EntityFieldGroup.ts:13](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFieldGroup.ts#L13)

***

### order

> **order**: `number`

Defined in: [listgrid/config/EntityFieldGroup.ts:14](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFieldGroup.ts#L14)

***

### span?

> `optional` **span?**: `object`

Defined in: [listgrid/config/EntityFieldGroup.ts:15](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFieldGroup.ts#L15)

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

Defined in: [listgrid/config/EntityFieldGroup.ts:25](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFieldGroup.ts#L25)

***

### description?

> `optional` **description?**: `string`

Defined in: [listgrid/config/EntityFieldGroup.ts:26](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFieldGroup.ts#L26)

***

### config?

> `optional` **config?**: [`FieldGroupConfig`](../type-aliases/FieldGroupConfig.md)

Defined in: [listgrid/config/EntityFieldGroup.ts:27](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFieldGroup.ts#L27)

***

### requiredPermissions?

> `optional` **requiredPermissions?**: `string`[]

Defined in: [listgrid/config/EntityFieldGroup.ts:28](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFieldGroup.ts#L28)

## Methods

### create()

> `static` **create**(`id`, `label`, `order`): `EntityFieldGroup`

Defined in: [listgrid/config/EntityFieldGroup.ts:39](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFieldGroup.ts#L39)

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

Defined in: [listgrid/config/EntityFieldGroup.ts:47](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFieldGroup.ts#L47)

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

Defined in: [listgrid/config/EntityFieldGroup.ts:61](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFieldGroup.ts#L61)

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

Defined in: [listgrid/config/EntityFieldGroup.ts:71](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFieldGroup.ts#L71)

#### Returns

`EntityFieldGroup`
