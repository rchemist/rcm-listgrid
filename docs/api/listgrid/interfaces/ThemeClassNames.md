[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ThemeClassNames

# Interface: ThemeClassNames

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:501](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L501)

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

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:503](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L503)

EntityForm 테마 클래스

***

### listGrid?

> `optional` **listGrid?**: [`ViewListGridClassNames`](ViewListGridClassNames.md)

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:505](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L505)

ListGrid 테마 클래스
