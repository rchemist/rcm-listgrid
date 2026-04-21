[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / getNestedValue

# Function: getNestedValue()

> **getNestedValue**(`obj`, `path`): `any`

Defined in: [listgrid/components/fields/abstract/ListableFormField.tsx:21](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/abstract/ListableFormField.tsx#L21)

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
