[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / useListGridTheme

# Function: useListGridTheme()

> **useListGridTheme**(): [`ListGridThemeContextValue`](../interfaces/ListGridThemeContextValue.md)

Defined in: [listgrid/components/list/context/ListGridThemeContext.tsx:170](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/list/context/ListGridThemeContext.tsx#L170)

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
