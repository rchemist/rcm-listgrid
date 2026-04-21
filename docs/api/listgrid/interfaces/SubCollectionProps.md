[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / SubCollectionProps

# Interface: SubCollectionProps

Defined in: [listgrid/config/ListGrid.ts:241](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/ListGrid.ts#L241)

## Properties

### name?

> `optional` **name?**: `string`

Defined in: [listgrid/config/ListGrid.ts:242](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/ListGrid.ts#L242)

***

### mappedBy?

> `optional` **mappedBy?**: `string`

Defined in: [listgrid/config/ListGrid.ts:248](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/ListGrid.ts#L248)

이 콜렉션의 엔티티에 상위 엔티티가 어떤 필드명으로 매핑되어 있는지.
예를 들어 one Plant : many Transceivers 관계에서
Transceiver 엔티티에 plantId = 1 이라는 값으로 매핑되어 있다고 하면 mappedBy 는 plantId 가 되고 mappedValue 는 1이 된다.

***

### mappedValue?

> `optional` **mappedValue?**: `any`

Defined in: [listgrid/config/ListGrid.ts:249](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/ListGrid.ts#L249)

***

### buttons?

> `optional` **buttons?**: (`props`) => `ReactNode`[]

Defined in: [listgrid/config/ListGrid.ts:250](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/ListGrid.ts#L250)

#### Parameters

##### props

[`SubCollectionBaseButtonProps`](SubCollectionBaseButtonProps.md)

#### Returns

`ReactNode`

***

### add?

> `optional` **add?**: `boolean`

Defined in: [listgrid/config/ListGrid.ts:251](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/ListGrid.ts#L251)

***

### delete?

> `optional` **delete?**: `boolean`

Defined in: [listgrid/config/ListGrid.ts:252](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/ListGrid.ts#L252)

***

### modifyOnView?

> `optional` **modifyOnView?**: `boolean`

Defined in: [listgrid/config/ListGrid.ts:253](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/ListGrid.ts#L253)
