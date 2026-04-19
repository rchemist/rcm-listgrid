[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / getListGridThemeByVariant

# Function: getListGridThemeByVariant()

> **getListGridThemeByVariant**(`variant`): [`ViewListGridClassNames`](../interfaces/ViewListGridClassNames.md)

Defined in: [listgrid/components/list/context/ListGridThemeContext.tsx:195](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/list/context/ListGridThemeContext.tsx#L195)

특정 variant의 테마 클래스를 직접 가져오는 유틸리티

Provider 없이 특정 variant의 테마를 사용하고 싶을 때 활용합니다.

## Parameters

### variant

[`ListGridThemeVariant`](../type-aliases/ListGridThemeVariant.md)

## Returns

[`ViewListGridClassNames`](../interfaces/ViewListGridClassNames.md)

## Example

```tsx
const subCollectionTheme = getListGridThemeByVariant('subCollection');
```
