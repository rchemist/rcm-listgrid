[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / CardViewConfig

# Interface: CardViewConfig

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:16](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L16)

CardView 렌더링 설정
ManyToOneField에서 withCardView() 메서드로 활성화할 때 사용

## Properties

### columns?

> `optional` **columns?**: `number`

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:18](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L18)

그리드 컬럼 수 (기본: 3)

***

### mobileColumns?

> `optional` **mobileColumns?**: `number`

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:20](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L20)

모바일(sm) 화면에서의 컬럼 수

***

### pageSize?

> `optional` **pageSize?**: `number`

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:22](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L22)

페이지당 카드 수 (기본: 6)

***

### showSearchButton?

> `optional` **showSearchButton?**: `boolean`

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:24](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L24)

검색 버튼 표시 여부

***

### showAllWhenEmpty?

> `optional` **showAllWhenEmpty?**: `boolean`

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:26](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L26)

선택 안됨 시 전체 표시 (기본: true)

***

### emptyMessage?

> `optional` **emptyMessage?**: `string`

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:28](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L28)

빈 상태 메시지

***

### gridClassName?

> `optional` **gridClassName?**: `string`

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:30](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L30)

카드 그리드 className

***

### cardConfig?

> `optional` **cardConfig?**: [`CardItemConfig`](CardItemConfig.md)

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:32](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L32)

카드 스타일/렌더링 설정

***

### searchFirst?

> `optional` **searchFirst?**: `boolean`

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:34](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L34)

검색 우선 모드: true면 검색 전까지 카드 목록 숨김 (서버 검색)

***

### searchPlaceholder?

> `optional` **searchPlaceholder?**: `string`

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:36](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L36)

검색 입력란 플레이스홀더

***

### searchFields?

> `optional` **searchFields?**: `string`[]

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:38](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L38)

검색 필드 지정 (기본: ['name'])
