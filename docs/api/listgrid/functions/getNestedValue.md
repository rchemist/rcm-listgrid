[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / getNestedValue

# Function: getNestedValue()

> **getNestedValue**(`obj`, `path`): `any`

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:28](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/ListableFormField.tsx#L28)

중첩 객체에서 dot notation 경로로 값을 가져온다.
예: getNestedValue(item, 'score.student.name') -> item.score.student.name

## Parameters

### obj

`any`

대상 객체

### path

`string`

dot notation 경로 (예: 'score.student.name')

## Returns

`any`

경로에 해당하는 값 또는 undefined
