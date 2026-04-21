[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / StatusChangeReason

# Interface: StatusChangeReason

Defined in: [listgrid/components/fields/SelectField.tsx:53](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/SelectField.tsx#L53)

특정 상태로 변경 시 적용할 사유 입력 설정

## Properties

### targets?

> `optional` **targets?**: `string`[]

Defined in: [listgrid/components/fields/SelectField.tsx:58](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/SelectField.tsx#L58)

어떤 상태로 변경할 때 이 설정을 적용할지 지정.
이 값이 없으면 모든 상태 변경에 대해 사유를 입력하게 함

***

### config

> **config**: [`StatusReason`](StatusReason.md)

Defined in: [listgrid/components/fields/SelectField.tsx:60](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/SelectField.tsx#L60)

사유 입력 설정
