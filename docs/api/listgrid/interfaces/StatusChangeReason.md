[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / StatusChangeReason

# Interface: StatusChangeReason

Defined in: [listgrid/components/fields/SelectField.tsx:60](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/SelectField.tsx#L60)

특정 상태로 변경 시 적용할 사유 입력 설정

## Properties

### targets?

> `optional` **targets?**: `string`[]

Defined in: [listgrid/components/fields/SelectField.tsx:65](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/SelectField.tsx#L65)

어떤 상태로 변경할 때 이 설정을 적용할지 지정.
이 값이 없으면 모든 상태 변경에 대해 사유를 입력하게 함

***

### config

> **config**: [`StatusReason`](StatusReason.md)

Defined in: [listgrid/components/fields/SelectField.tsx:67](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/SelectField.tsx#L67)

사유 입력 설정
