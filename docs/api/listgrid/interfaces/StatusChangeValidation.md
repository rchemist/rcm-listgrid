[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / StatusChangeValidation

# Interface: StatusChangeValidation

Defined in: [listgrid/components/fields/SelectField.tsx:66](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/SelectField.tsx#L66)

상태 변경 시 수행할 검증 로직

## Properties

### validate

> **validate**: (`entityForm`, `value`) => `Promise`\<[`ValidateResult`](../classes/ValidateResult.md)\>

Defined in: [listgrid/components/fields/SelectField.tsx:68](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/SelectField.tsx#L68)

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

Defined in: [listgrid/components/fields/SelectField.tsx:70](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/SelectField.tsx#L70)

검증 실패 시 표시할 에러 메시지

***

### success?

> `optional` **success?**: (`entityForm`) => `Promise`\<`void`\>

Defined in: [listgrid/components/fields/SelectField.tsx:72](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/SelectField.tsx#L72)

검증 성공 후 실행할 콜백

#### Parameters

##### entityForm

[`EntityForm`](../classes/EntityForm.md)

#### Returns

`Promise`\<`void`\>

***

### fail?

> `optional` **fail?**: (`entityForm`) => `Promise`\<`void`\>

Defined in: [listgrid/components/fields/SelectField.tsx:74](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/SelectField.tsx#L74)

검증 실패 후 실행할 콜백

#### Parameters

##### entityForm

[`EntityForm`](../classes/EntityForm.md)

#### Returns

`Promise`\<`void`\>
