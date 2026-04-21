[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ViewValueProps

# Interface: ViewValueProps\<TForm\>

Defined in: [listgrid/config/EntityField.ts:132](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L132)

EntityField.viewValue 의 props 타입.
FormField.viewValue 가 사용하는 ViewRenderProps 와 구조적으로 동일 —
TForm 제네릭화 (default `any`) + `compact?: boolean` 선행 버그 fix
(CardFieldSection/CardFieldRenderer 호출부가 이미 compact: true 를
넘기고 있었음. 후속 리팩터링에서 타입 계약 정합성 확보).

## Type Parameters

### TForm

`TForm` *extends* `object` = `any`

## Properties

### item

> **item**: `TForm`

Defined in: [listgrid/config/EntityField.ts:134](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L134)

아이템 데이터 (필드 값을 포함한 객체)

***

### entityForm?

> `optional` **entityForm?**: [`EntityForm`](../classes/EntityForm.md)\<`TForm`\>

Defined in: [listgrid/config/EntityField.ts:136](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L136)

엔티티 폼 인스턴스 (옵션)

***

### compact?

> `optional` **compact?**: `boolean`

Defined in: [listgrid/config/EntityField.ts:141](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/EntityField.ts#L141)

Compact 모드 - 아이콘 없이 깔끔한 텍스트만 표시.
CardSubCollectionField 등에서 여러 필드를 나열할 때 사용.
