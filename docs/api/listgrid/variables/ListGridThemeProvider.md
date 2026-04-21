[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ListGridThemeProvider

# Variable: ListGridThemeProvider

> `const` **ListGridThemeProvider**: `React.FC`\<[`ListGridThemeProviderProps`](../interfaces/ListGridThemeProviderProps.md)\>

Defined in: [listgrid/components/list/context/ListGridThemeContext.tsx:117](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/context/ListGridThemeContext.tsx#L117)

ListGrid 테마 Provider

ListGrid에 테마를 적용할 때 사용합니다.
variant를 지정하면 해당 프리셋 테마가 자동으로 적용됩니다.

## Example

```tsx
// 서브콜렉션에서 사용
<ListGridThemeProvider variant="subCollection">
  <ViewListGrid {...props} />
</ListGridThemeProvider>

// 커스텀 테마 적용
const customTheme = {
  panel: { container: 'mt-8 border-2 rounded-2xl' },
};
<ListGridThemeProvider theme={customTheme}>
  <ViewListGrid {...props} />
</ListGridThemeProvider>
```
