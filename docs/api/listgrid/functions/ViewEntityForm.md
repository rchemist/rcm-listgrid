[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ViewEntityForm

# Function: ViewEntityForm()

> **ViewEntityForm**(`props`): `Element`

Defined in: [listgrid/components/form/ViewEntityForm.tsx:76](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/ViewEntityForm.tsx#L76)

ViewEntityForm component (render-only structure)
- All state/handlers/logic are managed by the useEntityFormLogic hook.
- This component is responsible only for rendering structure.

ViewEntityForm 컴포넌트 (최소 렌더링 구조)
- 모든 상태/핸들러/로직은 useEntityFormLogic 훅에서 관리
- 이 컴포넌트는 렌더링 구조만 담당

## Parameters

### props

[`ViewEntityFormProps`](../interfaces/ViewEntityFormProps.md)

{ViewEntityFormProps} - EntityForm 렌더링에 필요한 모든 속성

## Returns

`Element`

- 렌더링 결과 또는 로딩 상태
