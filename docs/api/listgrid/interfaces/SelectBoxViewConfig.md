[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / SelectBoxViewConfig

# Interface: SelectBoxViewConfig

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:45](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L45)

SelectBoxView 렌더링 설정
ManyToOneField에서 withSelectBoxView() 메서드로 활성화할 때 사용

## Properties

### labelField?

> `optional` **labelField?**: `string` \| ((`item`) => `string`)

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:47](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L47)

표시할 라벨 필드 이름 또는 함수 (기본: 'name')

***

### valueField?

> `optional` **valueField?**: `string`

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:49](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L49)

값 필드 이름 (기본: 'id')

***

### placeholder?

> `optional` **placeholder?**: `string`

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:51](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L51)

플레이스홀더 텍스트

***

### nullValueLabel?

> `optional` **nullValueLabel?**: `string`

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:53](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L53)

선택 안함 옵션 라벨 (required=false일 때)

***

### isSearchable?

> `optional` **isSearchable?**: `boolean`

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:55](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L55)

검색 가능 여부 (기본: false)

***

### menuPosition?

> `optional` **menuPosition?**: `"fixed"` \| `"absolute"`

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:57](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L57)

메뉴 포지션

***

### menuPlacement?

> `optional` **menuPlacement?**: `"auto"` \| `"bottom"` \| `"top"`

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:59](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L59)

메뉴 배치
