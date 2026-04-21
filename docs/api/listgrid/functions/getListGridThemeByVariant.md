[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / getListGridThemeByVariant

# Function: getListGridThemeByVariant()

> **getListGridThemeByVariant**(`variant`): [`ViewListGridClassNames`](../interfaces/ViewListGridClassNames.md)

Defined in: [listgrid/components/list/context/ListGridThemeContext.tsx:191](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/context/ListGridThemeContext.tsx#L191)

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
