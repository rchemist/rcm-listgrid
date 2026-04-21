[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / EntityFormThemeProvider

# Variable: EntityFormThemeProvider

> `const` **EntityFormThemeProvider**: `React.FC`\<[`EntityFormThemeProviderProps`](../interfaces/EntityFormThemeProviderProps.md)\>

Defined in: [listgrid/components/form/context/EntityFormThemeContext.tsx:88](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/context/EntityFormThemeContext.tsx#L88)

EntityForm 테마 Provider

사이트별로 다른 테마를 적용할 때 사용합니다.
기본 테마에 커스텀 테마를 deep merge합니다.

## Example

```tsx
// 사이트 A의 layout.tsx
import { EntityFormThemeProvider } from '../../../listgrid-compat';

const siteATheme = {
  header: { container: 'mt-2 bg-blue-50 rounded-lg p-4' },
  title: { text: 'text-2xl font-medium text-blue-800' },
  buttons: { save: 'btn bg-blue-600 text-white hover:bg-blue-700' },
};

export default function RootLayout({ children }) {
  return (
    <EntityFormThemeProvider theme={siteATheme}>
      {children}
    </EntityFormThemeProvider>
  );
}
```
