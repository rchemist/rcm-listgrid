[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / useListGridTheme

# Function: useListGridTheme()

> **useListGridTheme**(): [`ListGridThemeContextValue`](../interfaces/ListGridThemeContextValue.md)

Defined in: [listgrid/components/list/context/ListGridThemeContext.tsx:166](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/context/ListGridThemeContext.tsx#L166)

ListGrid 테마 훅

ViewListGrid의 하위 컴포넌트에서 테마 클래스를 가져올 때 사용합니다.

## Returns

[`ListGridThemeContextValue`](../interfaces/ListGridThemeContextValue.md)

## Example

```tsx
const { classNames, cn, variant } = useListGridTheme();

return (
  <div className={cn('flex items-center', classNames.header?.container)}>
    ...
  </div>
);
```
