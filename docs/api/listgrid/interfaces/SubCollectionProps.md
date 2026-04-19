[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / SubCollectionProps

# Interface: SubCollectionProps

Defined in: [listgrid/config/ListGrid.ts:243](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/ListGrid.ts#L243)

## Properties

### name?

> `optional` **name?**: `string`

Defined in: [listgrid/config/ListGrid.ts:244](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/ListGrid.ts#L244)

***

### mappedBy?

> `optional` **mappedBy?**: `string`

Defined in: [listgrid/config/ListGrid.ts:250](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/ListGrid.ts#L250)

이 콜렉션의 엔티티에 상위 엔티티가 어떤 필드명으로 매핑되어 있는지.
예를 들어 one Plant : many Transceivers 관계에서
Transceiver 엔티티에 plantId = 1 이라는 값으로 매핑되어 있다고 하면 mappedBy 는 plantId 가 되고 mappedValue 는 1이 된다.

***

### mappedValue?

> `optional` **mappedValue?**: `any`

Defined in: [listgrid/config/ListGrid.ts:251](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/ListGrid.ts#L251)

***

### buttons?

> `optional` **buttons?**: (`props`) => `ReactNode`[]

Defined in: [listgrid/config/ListGrid.ts:252](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/ListGrid.ts#L252)

#### Parameters

##### props

[`SubCollectionBaseButtonProps`](SubCollectionBaseButtonProps.md)

#### Returns

`ReactNode`

***

### add?

> `optional` **add?**: `boolean`

Defined in: [listgrid/config/ListGrid.ts:253](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/ListGrid.ts#L253)

***

### delete?

> `optional` **delete?**: `boolean`

Defined in: [listgrid/config/ListGrid.ts:254](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/ListGrid.ts#L254)

***

### modifyOnView?

> `optional` **modifyOnView?**: `boolean`

Defined in: [listgrid/config/ListGrid.ts:255](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/ListGrid.ts#L255)
