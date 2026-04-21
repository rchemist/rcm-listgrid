[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ThemeClassNames

# Interface: ThemeClassNames

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:494](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L494)

통합 테마 클래스 타입

EntityForm과 ListGrid의 모든 스타일을 하나의 테마로 관리합니다.
모노리포 환경에서 사이트별/컨텍스트별 다른 디자인을 적용할 때 사용합니다.

## Example

```tsx
const myTheme: ThemeClassNames = {
  entityForm: {
    header: { container: 'mt-2 bg-blue-50' },
  },
  listGrid: {
    panel: { container: 'mt-5 border rounded-xl' },
  },
};
```

## Properties

### entityForm?

> `optional` **entityForm?**: [`ViewEntityFormClassNames`](ViewEntityFormClassNames.md)

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:496](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L496)

EntityForm 테마 클래스

***

### listGrid?

> `optional` **listGrid?**: [`ViewListGridClassNames`](ViewListGridClassNames.md)

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:498](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L498)

ListGrid 테마 클래스
