[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / cn

# Function: cn()

> **cn**(...`inputs`): `string`

Defined in: [listgrid/utils/cn.ts:21](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/utils/cn.ts#L21)

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
