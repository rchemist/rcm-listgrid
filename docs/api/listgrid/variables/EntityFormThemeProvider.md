[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / EntityFormThemeProvider

# Variable: EntityFormThemeProvider

> `const` **EntityFormThemeProvider**: `React.FC`\<[`EntityFormThemeProviderProps`](../interfaces/EntityFormThemeProviderProps.md)\>

Defined in: [listgrid/components/form/context/EntityFormThemeContext.tsx:92](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/context/EntityFormThemeContext.tsx#L92)

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
