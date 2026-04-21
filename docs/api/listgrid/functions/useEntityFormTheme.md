[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / useEntityFormTheme

# Function: useEntityFormTheme()

> **useEntityFormTheme**(): [`EntityFormThemeContextValue`](../interfaces/EntityFormThemeContextValue.md)

Defined in: [listgrid/components/form/context/EntityFormThemeContext.tsx:140](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/context/EntityFormThemeContext.tsx#L140)

EntityForm 테마 훅

ViewEntityForm의 하위 컴포넌트에서 테마 클래스를 가져올 때 사용합니다.

## Returns

[`EntityFormThemeContextValue`](../interfaces/EntityFormThemeContextValue.md)

## Example

```tsx
const { classNames, cn } = useEntityFormTheme();

return (
  <div className={cn('flex items-center', classNames.header?.container)}>
    ...
  </div>
);
```
