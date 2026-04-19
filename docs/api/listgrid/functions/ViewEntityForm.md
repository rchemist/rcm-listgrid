[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ViewEntityForm

# Function: ViewEntityForm()

> **ViewEntityForm**(`props`): `Element`

Defined in: [listgrid/components/form/ViewEntityForm.tsx:82](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/ViewEntityForm.tsx#L82)

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
