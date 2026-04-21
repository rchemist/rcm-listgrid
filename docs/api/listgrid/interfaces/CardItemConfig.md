[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / CardItemConfig

# Interface: CardItemConfig

Defined in: [listgrid/components/fields/view/CardManyToOneView.tsx:26](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/view/CardManyToOneView.tsx#L26)

카드 아이템의 스타일/렌더링 설정

## Properties

### containerClassName?

> `optional` **containerClassName?**: `string`

Defined in: [listgrid/components/fields/view/CardManyToOneView.tsx:28](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/view/CardManyToOneView.tsx#L28)

카드 컨테이너 className

***

### selectedContainerClassName?

> `optional` **selectedContainerClassName?**: `string`

Defined in: [listgrid/components/fields/view/CardManyToOneView.tsx:30](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/view/CardManyToOneView.tsx#L30)

선택된 카드 컨테이너 className

***

### titleClassName?

> `optional` **titleClassName?**: `string`

Defined in: [listgrid/components/fields/view/CardManyToOneView.tsx:32](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/view/CardManyToOneView.tsx#L32)

카드 타이틀 className

***

### labelClassName?

> `optional` **labelClassName?**: `string`

Defined in: [listgrid/components/fields/view/CardManyToOneView.tsx:34](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/view/CardManyToOneView.tsx#L34)

카드 라벨(뱃지) className

***

### descriptionClassName?

> `optional` **descriptionClassName?**: `string`

Defined in: [listgrid/components/fields/view/CardManyToOneView.tsx:36](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/view/CardManyToOneView.tsx#L36)

카드 설명 className

***

### checkIconClassName?

> `optional` **checkIconClassName?**: `string`

Defined in: [listgrid/components/fields/view/CardManyToOneView.tsx:38](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/view/CardManyToOneView.tsx#L38)

선택 아이콘 className

***

### renderCard?

> `optional` **renderCard?**: (`item`, `isSelected`, `onSelect`) => `ReactNode`

Defined in: [listgrid/components/fields/view/CardManyToOneView.tsx:40](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/view/CardManyToOneView.tsx#L40)

카드 아이템 렌더링 함수 (완전 커스텀)

#### Parameters

##### item

`any`

##### isSelected

`boolean`

##### onSelect

() => `void`

#### Returns

`ReactNode`

***

### titleField?

> `optional` **titleField?**: `string` \| ((`item`) => `string`)

Defined in: [listgrid/components/fields/view/CardManyToOneView.tsx:42](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/view/CardManyToOneView.tsx#L42)

카드 타이틀 필드 이름 또는 함수

***

### labelField?

> `optional` **labelField?**: `string` \| ((`item`) => `string`)

Defined in: [listgrid/components/fields/view/CardManyToOneView.tsx:44](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/view/CardManyToOneView.tsx#L44)

카드 라벨(뱃지) 필드 이름 또는 함수

***

### descriptionField?

> `optional` **descriptionField?**: `string` \| ((`item`) => `string`)

Defined in: [listgrid/components/fields/view/CardManyToOneView.tsx:46](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/view/CardManyToOneView.tsx#L46)

카드 설명 필드 이름 또는 함수

***

### imageField?

> `optional` **imageField?**: `string` \| ((`item`) => `string` \| `undefined`)

Defined in: [listgrid/components/fields/view/CardManyToOneView.tsx:48](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/view/CardManyToOneView.tsx#L48)

카드 이미지 필드 이름 또는 함수

***

### renderAction?

> `optional` **renderAction?**: (`item`) => `ReactNode`

Defined in: [listgrid/components/fields/view/CardManyToOneView.tsx:50](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/view/CardManyToOneView.tsx#L50)

카드 하단 액션 영역 렌더링 함수

#### Parameters

##### item

`any`

#### Returns

`ReactNode`
