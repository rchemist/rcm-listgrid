[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / CardViewConfig

# Interface: CardViewConfig

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:9](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L9)

CardView 렌더링 설정
ManyToOneField에서 withCardView() 메서드로 활성화할 때 사용

## Properties

### columns?

> `optional` **columns?**: `number`

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:11](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L11)

그리드 컬럼 수 (기본: 3)

***

### mobileColumns?

> `optional` **mobileColumns?**: `number`

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:13](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L13)

모바일(sm) 화면에서의 컬럼 수

***

### pageSize?

> `optional` **pageSize?**: `number`

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:15](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L15)

페이지당 카드 수 (기본: 6)

***

### showSearchButton?

> `optional` **showSearchButton?**: `boolean`

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:17](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L17)

검색 버튼 표시 여부

***

### showAllWhenEmpty?

> `optional` **showAllWhenEmpty?**: `boolean`

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:19](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L19)

선택 안됨 시 전체 표시 (기본: true)

***

### emptyMessage?

> `optional` **emptyMessage?**: `string`

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:21](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L21)

빈 상태 메시지

***

### gridClassName?

> `optional` **gridClassName?**: `string`

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:23](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L23)

카드 그리드 className

***

### cardConfig?

> `optional` **cardConfig?**: [`CardItemConfig`](CardItemConfig.md)

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:25](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L25)

카드 스타일/렌더링 설정

***

### searchFirst?

> `optional` **searchFirst?**: `boolean`

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:27](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L27)

검색 우선 모드: true면 검색 전까지 카드 목록 숨김 (서버 검색)

***

### searchPlaceholder?

> `optional` **searchPlaceholder?**: `string`

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:29](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L29)

검색 입력란 플레이스홀더

***

### searchFields?

> `optional` **searchFields?**: `string`[]

Defined in: [listgrid/components/fields/abstract/AbstractManyToOneField.tsx:31](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/AbstractManyToOneField.tsx#L31)

검색 필드 지정 (기본: ['name'])
