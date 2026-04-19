[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ImmediateChangeProps

# Interface: ImmediateChangeProps

Defined in: [listgrid/components/fields/SelectField.tsx:95](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/SelectField.tsx#L95)

즉시 변경(withImmediateChange) 확장 설정.
"변경" 버튼 클릭 시 상태 필드 외에 추가 필드를 함께 전송하거나,
커스텀 전처리 로직을 실행할 수 있습니다.

## Properties

### requiredFields?

> `optional` **requiredFields?**: `string`[]

Defined in: [listgrid/components/fields/SelectField.tsx:101](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/SelectField.tsx#L101)

즉시 변경 시 함께 전송할 필드명 목록.
EntityForm.validate({ fieldNames })로 표준 검증을 수행하고,
field.isDirty()인 필드의 값을 수집하여 API 요청에 포함합니다.

***

### onSubmit?

> `optional` **onSubmit?**: (`entityForm`, `submitData`) => `Promise`\<`false` \| `void` \| `Record`\<`string`, `any`\>\>

Defined in: [listgrid/components/fields/SelectField.tsx:110](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/SelectField.tsx#L110)

즉시 변경 전 커스텀 전처리 콜백.
requiredFields 검증/수집 및 withReason 사유 추가 이후에 호출됩니다.
- false 반환: 변경 취소
- Record 반환: 추가 데이터를 formData에 병합
- void 반환: 기본 동작 진행

#### Parameters

##### entityForm

[`EntityForm`](../classes/EntityForm.md)

##### submitData

###### targetValue

[`FieldValue`](FieldValue.md)

###### formData

`Record`\<`string`, `any`\>

#### Returns

`Promise`\<`false` \| `void` \| `Record`\<`string`, `any`\>\>
