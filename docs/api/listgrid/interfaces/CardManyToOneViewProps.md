[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / CardManyToOneViewProps

# Interface: CardManyToOneViewProps

Defined in: [listgrid/components/fields/view/CardManyToOneView.tsx:56](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/view/CardManyToOneView.tsx#L56)

CardManyToOneView Props

## Extends

- [`CustomFieldRendererProps`](CustomFieldRendererProps.md)

## Properties

### columns?

> `optional` **columns?**: `number`

Defined in: [listgrid/components/fields/view/CardManyToOneView.tsx:58](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/view/CardManyToOneView.tsx#L58)

카드 그리드 컬럼 수 (기본: 3)

***

### mobileColumns?

> `optional` **mobileColumns?**: `number`

Defined in: [listgrid/components/fields/view/CardManyToOneView.tsx:60](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/view/CardManyToOneView.tsx#L60)

모바일(sm) 화면에서의 컬럼 수 (기본: columns와 동일)

***

### gridClassName?

> `optional` **gridClassName?**: `string`

Defined in: [listgrid/components/fields/view/CardManyToOneView.tsx:62](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/view/CardManyToOneView.tsx#L62)

카드 그리드 className

***

### cardConfig?

> `optional` **cardConfig?**: [`CardItemConfig`](CardItemConfig.md)

Defined in: [listgrid/components/fields/view/CardManyToOneView.tsx:64](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/view/CardManyToOneView.tsx#L64)

카드 아이템 설정

***

### items?

> `optional` **items?**: `any`[]

Defined in: [listgrid/components/fields/view/CardManyToOneView.tsx:66](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/view/CardManyToOneView.tsx#L66)

선택 가능한 아이템 목록 (직접 제공하는 경우)

***

### loadItems?

> `optional` **loadItems?**: () => `Promise`\<`any`[]\>

Defined in: [listgrid/components/fields/view/CardManyToOneView.tsx:68](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/view/CardManyToOneView.tsx#L68)

아이템 목록 로드 함수 (커스텀 로드 로직)

#### Returns

`Promise`\<`any`[]\>

***

### emptyMessage?

> `optional` **emptyMessage?**: `string`

Defined in: [listgrid/components/fields/view/CardManyToOneView.tsx:70](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/view/CardManyToOneView.tsx#L70)

빈 상태 메시지

***

### showSearchButton?

> `optional` **showSearchButton?**: `boolean`

Defined in: [listgrid/components/fields/view/CardManyToOneView.tsx:72](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/view/CardManyToOneView.tsx#L72)

검색 버튼 표시 여부

***

### showAllWhenEmpty?

> `optional` **showAllWhenEmpty?**: `boolean`

Defined in: [listgrid/components/fields/view/CardManyToOneView.tsx:74](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/view/CardManyToOneView.tsx#L74)

선택되지 않은 상태에서 전체 목록 표시 여부 (기본: true)

***

### pageSize?

> `optional` **pageSize?**: `number`

Defined in: [listgrid/components/fields/view/CardManyToOneView.tsx:76](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/view/CardManyToOneView.tsx#L76)

페이지당 카드 수 (기본: 6). 이 숫자를 초과하면 페이징+검색 UI 표시

***

### searchFirst?

> `optional` **searchFirst?**: `boolean`

Defined in: [listgrid/components/fields/view/CardManyToOneView.tsx:78](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/view/CardManyToOneView.tsx#L78)

검색 우선 모드: true면 검색 전까지 카드 목록 숨김 (서버 검색)

***

### searchPlaceholder?

> `optional` **searchPlaceholder?**: `string`

Defined in: [listgrid/components/fields/view/CardManyToOneView.tsx:80](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/view/CardManyToOneView.tsx#L80)

검색 입력란 플레이스홀더

***

### searchFields?

> `optional` **searchFields?**: `string`[]

Defined in: [listgrid/components/fields/view/CardManyToOneView.tsx:82](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/view/CardManyToOneView.tsx#L82)

검색 필드 지정 (기본: ['name'])

***

### field

> **field**: [`FormField`](../classes/FormField.md)\<`any`\>

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:39](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L39)

렌더링할 필드 인스턴스

#### Inherited from

[`CustomFieldRendererProps`](CustomFieldRendererProps.md).[`field`](CustomFieldRendererProps.md#field)

***

### entityForm

> **entityForm**: [`EntityForm`](../classes/EntityForm.md)

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:41](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L41)

EntityForm 인스턴스

#### Inherited from

[`CustomFieldRendererProps`](CustomFieldRendererProps.md).[`entityForm`](CustomFieldRendererProps.md#entityform)

***

### setEntityForm?

> `optional` **setEntityForm?**: `Dispatch`\<`SetStateAction`\<[`EntityForm`](../classes/EntityForm.md)\<`any`\> \| `undefined`\>\>

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:43](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L43)

EntityForm setter

#### Inherited from

[`CustomFieldRendererProps`](CustomFieldRendererProps.md).[`setEntityForm`](CustomFieldRendererProps.md#setentityform)

***

### value

> **value**: `any`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:45](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L45)

현재 필드 값

#### Inherited from

[`CustomFieldRendererProps`](CustomFieldRendererProps.md).[`value`](CustomFieldRendererProps.md#value)

***

### onChange

> **onChange**: (`value`, `propagation?`) => `void`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:47](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L47)

값 변경 핸들러

#### Parameters

##### value

`any`

##### propagation?

`boolean`

#### Returns

`void`

#### Inherited from

[`CustomFieldRendererProps`](CustomFieldRendererProps.md).[`onChange`](CustomFieldRendererProps.md#onchange)

***

### onError

> **onError**: (`message`) => `void`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:49](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L49)

에러 발생 핸들러

#### Parameters

##### message

`string`

#### Returns

`void`

#### Inherited from

[`CustomFieldRendererProps`](CustomFieldRendererProps.md).[`onError`](CustomFieldRendererProps.md#onerror)

***

### clearError

> **clearError**: () => `void`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:51](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L51)

에러 초기화 핸들러

#### Returns

`void`

#### Inherited from

[`CustomFieldRendererProps`](CustomFieldRendererProps.md).[`clearError`](CustomFieldRendererProps.md#clearerror)

***

### required

> **required**: `boolean`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:53](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L53)

필수 여부

#### Inherited from

[`CustomFieldRendererProps`](CustomFieldRendererProps.md).[`required`](CustomFieldRendererProps.md#required)

***

### readonly

> **readonly**: `boolean`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:55](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L55)

읽기 전용 여부

#### Inherited from

[`CustomFieldRendererProps`](CustomFieldRendererProps.md).[`readonly`](CustomFieldRendererProps.md#readonly)

***

### session?

> `optional` **session?**: [`Session`](Session.md)

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:57](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L57)

세션 정보

#### Inherited from

[`CustomFieldRendererProps`](CustomFieldRendererProps.md).[`session`](CustomFieldRendererProps.md#session)

***

### helpText?

> `optional` **helpText?**: `ReactNode`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:59](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L59)

도움말 텍스트

#### Inherited from

[`CustomFieldRendererProps`](CustomFieldRendererProps.md).[`helpText`](CustomFieldRendererProps.md#helptext)

***

### placeholder?

> `optional` **placeholder?**: `string`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:61](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L61)

플레이스홀더

#### Inherited from

[`CustomFieldRendererProps`](CustomFieldRendererProps.md).[`placeholder`](CustomFieldRendererProps.md#placeholder)

***

### subCollectionEntity?

> `optional` **subCollectionEntity?**: `boolean`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:63](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L63)

서브콜렉션 엔티티 여부

#### Inherited from

[`CustomFieldRendererProps`](CustomFieldRendererProps.md).[`subCollectionEntity`](CustomFieldRendererProps.md#subcollectionentity)

***

### resetEntityForm?

> `optional` **resetEntityForm?**: (`delay?`, `preserveState?`) => `Promise`\<`void`\>

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:65](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L65)

EntityForm 리셋 함수

#### Parameters

##### delay?

`number`

##### preserveState?

`boolean`

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`CustomFieldRendererProps`](CustomFieldRendererProps.md).[`resetEntityForm`](CustomFieldRendererProps.md#resetentityform)
