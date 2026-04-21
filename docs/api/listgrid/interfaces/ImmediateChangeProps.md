[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ImmediateChangeProps

# Interface: ImmediateChangeProps

Defined in: [listgrid/components/fields/SelectField.tsx:88](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/SelectField.tsx#L88)

즉시 변경(withImmediateChange) 확장 설정.
"변경" 버튼 클릭 시 상태 필드 외에 추가 필드를 함께 전송하거나,
커스텀 전처리 로직을 실행할 수 있습니다.

## Properties

### requiredFields?

> `optional` **requiredFields?**: `string`[]

Defined in: [listgrid/components/fields/SelectField.tsx:94](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/SelectField.tsx#L94)

즉시 변경 시 함께 전송할 필드명 목록.
EntityForm.validate({ fieldNames })로 표준 검증을 수행하고,
field.isDirty()인 필드의 값을 수집하여 API 요청에 포함합니다.

***

### onSubmit?

> `optional` **onSubmit?**: (`entityForm`, `submitData`) => `Promise`\<`false` \| `void` \| `Record`\<`string`, `any`\>\>

Defined in: [listgrid/components/fields/SelectField.tsx:103](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/SelectField.tsx#L103)

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
