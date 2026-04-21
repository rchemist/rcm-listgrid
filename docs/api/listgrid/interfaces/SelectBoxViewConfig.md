[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / SelectBoxViewConfig

# Interface: SelectBoxViewConfig

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:38](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L38)

SelectBoxView 렌더링 설정
ManyToOneField에서 withSelectBoxView() 메서드로 활성화할 때 사용

## Properties

### labelField?

> `optional` **labelField?**: `string` \| ((`item`) => `string`)

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:40](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L40)

표시할 라벨 필드 이름 또는 함수 (기본: 'name')

***

### valueField?

> `optional` **valueField?**: `string`

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:42](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L42)

값 필드 이름 (기본: 'id')

***

### placeholder?

> `optional` **placeholder?**: `string`

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:44](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L44)

플레이스홀더 텍스트

***

### nullValueLabel?

> `optional` **nullValueLabel?**: `string`

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:46](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L46)

선택 안함 옵션 라벨 (required=false일 때)

***

### isSearchable?

> `optional` **isSearchable?**: `boolean`

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:48](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L48)

검색 가능 여부 (기본: false)

***

### menuPosition?

> `optional` **menuPosition?**: `"fixed"` \| `"absolute"`

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:50](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L50)

메뉴 포지션

***

### menuPlacement?

> `optional` **menuPlacement?**: `"auto"` \| `"bottom"` \| `"top"`

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:52](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L52)

메뉴 배치
