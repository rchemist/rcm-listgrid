[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / FieldRenderParameters

# Interface: FieldRenderParameters\<T, TValue\>

Defined in: [listgrid/config/EntityField.ts:156](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L156)

## Type Parameters

### T

`T` *extends* `object` = `any`

### TValue

`TValue` = `any`

## Properties

### entityForm

> **entityForm**: [`EntityForm`](../classes/EntityForm.md)\<`T`\>

Defined in: [listgrid/config/EntityField.ts:157](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L157)

***

### session?

> `optional` **session?**: [`Session`](Session.md)

Defined in: [listgrid/config/EntityField.ts:158](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L158)

***

### onChange

> **onChange**: (`value`, `propagation?`) => `void`

Defined in: [listgrid/config/EntityField.ts:164](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L164)

필드 값이 변경될 때마다 호출된다.

#### Parameters

##### value

`TValue`

##### propagation?

`boolean`

상위로 onChange 를 전파할 지 여부, 기본은 true, textarea 나 HTML 에디터 필드와 같은 경우 글자가 변경될 때 마다 상위 전파를 하면 안 되기 때문에 이 값을 선택적으로 설정하게 한다.

#### Returns

`void`

***

### onError?

> `optional` **onError?**: (`message`) => `void`

Defined in: [listgrid/config/EntityField.ts:165](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L165)

#### Parameters

##### message

`string`

#### Returns

`void`

***

### clearError?

> `optional` **clearError?**: () => `void`

Defined in: [listgrid/config/EntityField.ts:166](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L166)

#### Returns

`void`

***

### required?

> `optional` **required?**: `boolean`

Defined in: [listgrid/config/EntityField.ts:167](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L167)

***

### readonly?

> `optional` **readonly?**: `boolean`

Defined in: [listgrid/config/EntityField.ts:168](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L168)

***

### placeHolder?

> `optional` **placeHolder?**: `string`

Defined in: [listgrid/config/EntityField.ts:169](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L169)

***

### helpText?

> `optional` **helpText?**: `ReactNode`

Defined in: [listgrid/config/EntityField.ts:170](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L170)

***

### subCollectionEntity?

> `optional` **subCollectionEntity?**: `boolean`

Defined in: [listgrid/config/EntityField.ts:171](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L171)

***

### updateEntityForm?

> `optional` **updateEntityForm?**: (`updater`) => `Promise`\<`void`\>

Defined in: [listgrid/config/EntityField.ts:176](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L176)

EntityForm을 업데이트하고 리렌더링을 트리거하는 메서드

#### Parameters

##### updater

(`entityForm`) => `Promise`\<[`EntityForm`](../classes/EntityForm.md)\<`T`\>\>

EntityForm을 업데이트하는 함수

#### Returns

`Promise`\<`void`\>

***

### resetEntityForm?

> `optional` **resetEntityForm?**: (`delay?`, `preserveState?`) => `Promise`\<`void`\>

Defined in: [listgrid/config/EntityField.ts:184](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityField.ts#L184)

EntityForm을 리셋하고 초기화 상태로 되돌리는 메서드

#### Parameters

##### delay?

`number`

리로드 전 지연 시간 (밀리초)

##### preserveState?

`boolean`

현재 탭 위치 등의 상태 유지 여부

#### Returns

`Promise`\<`void`\>
