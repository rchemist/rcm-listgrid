[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / useEntityFormTheme

# Function: useEntityFormTheme()

> **useEntityFormTheme**(): [`EntityFormThemeContextValue`](../interfaces/EntityFormThemeContextValue.md)

Defined in: [listgrid/components/form/context/EntityFormThemeContext.tsx:144](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/context/EntityFormThemeContext.tsx#L144)

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
