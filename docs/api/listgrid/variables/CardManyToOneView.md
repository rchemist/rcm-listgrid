[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / CardManyToOneView

# Variable: CardManyToOneView

> `const` **CardManyToOneView**: `React.FC`\<[`CardManyToOneViewProps`](../interfaces/CardManyToOneViewProps.md)\>

Defined in: [listgrid/components/fields/view/CardManyToOneView.tsx:120](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/view/CardManyToOneView.tsx#L120)

CardManyToOneView

ManyToOne 필드를 카드 형태로 표시하는 커스텀 렌더러입니다.
- readonly 모드: 선택된 카드만 표시
- 편집 모드: 선택된 카드 + 변경 버튼으로 다른 옵션 선택 가능

## Example

```tsx
<EntityFormThemeProvider
  fieldRenderers={{
    syllabus: CardManyToOneView,
    selection: (props) => (
      <CardManyToOneView
        {...props}
        columns={3}
        cardConfig={{
          titleField: 'name',
          labelField: (item) => item.term?.name,
          descriptionField: (item) => `${item.year}년도 ${item.semester}학기`,
        }}
      />
    ),
  }}
>
  {children}
</EntityFormThemeProvider>
```
