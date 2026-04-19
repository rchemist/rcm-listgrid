[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / StatusChangeValidation

# Interface: StatusChangeValidation

Defined in: [listgrid/components/fields/SelectField.tsx:73](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/SelectField.tsx#L73)

상태 변경 시 수행할 검증 로직

## Properties

### validate

> **validate**: (`entityForm`, `value`) => `Promise`\<[`ValidateResult`](../classes/ValidateResult.md)\>

Defined in: [listgrid/components/fields/SelectField.tsx:75](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/SelectField.tsx#L75)

상태 변경 시 실행할 검증 함수

#### Parameters

##### entityForm

[`EntityForm`](../classes/EntityForm.md)

##### value

[`FieldValue`](FieldValue.md)

#### Returns

`Promise`\<[`ValidateResult`](../classes/ValidateResult.md)\>

***

### message?

> `optional` **message?**: `string`

Defined in: [listgrid/components/fields/SelectField.tsx:77](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/SelectField.tsx#L77)

검증 실패 시 표시할 에러 메시지

***

### success?

> `optional` **success?**: (`entityForm`) => `Promise`\<`void`\>

Defined in: [listgrid/components/fields/SelectField.tsx:79](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/SelectField.tsx#L79)

검증 성공 후 실행할 콜백

#### Parameters

##### entityForm

[`EntityForm`](../classes/EntityForm.md)

#### Returns

`Promise`\<`void`\>

***

### fail?

> `optional` **fail?**: (`entityForm`) => `Promise`\<`void`\>

Defined in: [listgrid/components/fields/SelectField.tsx:81](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/SelectField.tsx#L81)

검증 실패 후 실행할 콜백

#### Parameters

##### entityForm

[`EntityForm`](../classes/EntityForm.md)

#### Returns

`Promise`\<`void`\>
