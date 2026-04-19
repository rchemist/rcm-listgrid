[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / processApiError

# Function: processApiError()

> **processApiError**(`response`, `form?`): `object`

Defined in: [listgrid/config/EntityFormMethod.ts:69](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityFormMethod.ts#L69)

API 응답 에러를 처리하고 필드 에러와 글로벌 에러를 추출합니다.
EntityForm의 save 메소드에서 사용하는 에러 처리 로직을 재사용 가능하도록 추출한 함수입니다.

## Parameters

### response

`ApiErrorResponse`

API 응답 객체 (error, entityError 포함 가능)

### form?

[`EntityForm`](../classes/EntityForm.md)\<`any`\>

필드 라벨을 가져오기 위한 EntityForm (optional)

## Returns

`object`

처리된 에러 정보

### fieldErrors

> **fieldErrors**: [`FieldError`](../interfaces/FieldError.md)[]

### globalError?

> `optional` **globalError?**: `string`

### hasError

> **hasError**: `boolean`
