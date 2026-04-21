[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / prefetchCustomOptions

# Function: prefetchCustomOptions()

> **prefetchCustomOptions**(`aliases`): `Promise`\<`void`\>

Defined in: [listgrid/components/fields/CustomOptionField.tsx:214](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/CustomOptionField.tsx#L214)

여러 alias에 대한 옵션값을 일괄 조회하여 캐시에 저장
ViewListGrid에서 목록 렌더링 전에 호출하여 N+1 문제 방지

## Parameters

### aliases

`string`[]

## Returns

`Promise`\<`void`\>
