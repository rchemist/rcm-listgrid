[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ViewRenderProps

# Interface: ViewRenderProps\<TForm\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:64](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L64)

View 모드 렌더링을 위한 파라미터
CardSubCollectionField 등에서 필드 값을 View 모드로 표시할 때 사용

TForm 은 item 타입 (entity row) 으로, FormField<TSelf, TValue, TForm>
의 TForm 과 동일 의미. default `any` 로 소비자 무수정 호환.

## Type Parameters

### TForm

`TForm` *extends* `object` = `any`

## Properties

### item

> **item**: `TForm`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:66](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L66)

아이템 데이터 (필드 값을 포함한 객체)

***

### entityForm?

> `optional` **entityForm?**: [`EntityForm`](../classes/EntityForm.md)\<`TForm`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:68](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L68)

엔티티 폼 인스턴스 (옵션)

***

### compact?

> `optional` **compact?**: `boolean`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:73](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/FormField.tsx#L73)

Compact 모드 - 아이콘 없이 깔끔한 텍스트만 표시
CardSubCollectionField 등에서 여러 필드를 나열할 때 사용
