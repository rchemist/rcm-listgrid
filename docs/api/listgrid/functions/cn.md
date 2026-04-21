[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / cn

# Function: cn()

> **cn**(...`inputs`): `string`

Defined in: [listgrid/utils/cn.ts:14](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/utils/cn.ts#L14)

Tailwind CSS 클래스 병합 유틸리티
- clsx로 조건부 클래스를 처리하고
- tailwind-merge로 충돌하는 클래스를 스마트하게 병합

## Parameters

### inputs

...`ClassValue`[]

## Returns

`string`

## Example

```ts
cn("p-4", "p-2") // => "p-2" (마지막 값이 적용)
cn("text-red-500", condition && "text-blue-500") // => 조건부 클래스
cn(baseClass, customClass) // => 기본 클래스 + 커스텀 클래스 병합
```
