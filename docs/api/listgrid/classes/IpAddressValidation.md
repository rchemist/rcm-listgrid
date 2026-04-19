[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / IpAddressValidation

# Class: IpAddressValidation

Defined in: [listgrid/validations/IpAddressValidation.ts:31](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/IpAddressValidation.ts#L31)

IP 주소 형식 검증 클래스

허용 형식:
- XXX.XXX.XXX.XXX (일반 IP 주소, 예: 192.168.1.1)
- XXX.XXX.XXX.* (와일드카드, 예: 192.168.1.*)
- XXX.XXX.* (와일드카드, 예: 192.168.*)
- XXX.* (와일드카드, 예: 192.*)

## Extends

- [`ValidationItem`](ValidationItem.md)

## Constructors

### Constructor

> **new IpAddressValidation**(`id?`, `message?`): `IpAddressValidation`

Defined in: [listgrid/validations/IpAddressValidation.ts:32](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/IpAddressValidation.ts#L32)

#### Parameters

##### id?

`string` = `'ip-address-format'`

##### message?

`string`

#### Returns

`IpAddressValidation`

#### Overrides

`ValidationItem.constructor`

## Properties

### id

> **id**: `string`

Defined in: [listgrid/validations/Validation.tsx:74](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/Validation.tsx#L74)

#### Inherited from

[`ValidationItem`](ValidationItem.md).[`id`](ValidationItem.md#id)

***

### message?

> `optional` **message?**: `string`

Defined in: [listgrid/validations/Validation.tsx:76](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/Validation.tsx#L76)

#### Inherited from

[`ValidationItem`](ValidationItem.md).[`message`](ValidationItem.md#message)

## Methods

### validate()

> **validate**(`entityForm`, `value`, `message?`): `Promise`\<[`ValidateResult`](ValidateResult.md)\>

Defined in: [listgrid/validations/IpAddressValidation.ts:40](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/IpAddressValidation.ts#L40)

검증 로직

#### Parameters

##### entityForm

[`EntityForm`](EntityForm.md)

##### value

[`FieldValue`](../interfaces/FieldValue.md)

##### message?

`string`

#### Returns

`Promise`\<[`ValidateResult`](ValidateResult.md)\>

#### Overrides

[`ValidationItem`](ValidationItem.md).[`validate`](ValidationItem.md#validate)

***

### getErrorMessage()

> **getErrorMessage**(): `string`

Defined in: [listgrid/validations/Validation.tsx:90](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/Validation.tsx#L90)

에러 메시지 반환

#### Returns

`string`

#### Inherited from

[`ValidationItem`](ValidationItem.md).[`getErrorMessage`](ValidationItem.md#geterrormessage)

***

### getValueAsString()

> **getValueAsString**(`entityForm`, `value`): `string`

Defined in: [listgrid/validations/Validation.tsx:99](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/Validation.tsx#L99)

현재 필드값을 string 으로 반환하는 편의성 메소드

#### Parameters

##### entityForm

[`EntityForm`](EntityForm.md)

##### value

[`FieldValue`](../interfaces/FieldValue.md)

#### Returns

`string`

#### Inherited from

[`ValidationItem`](ValidationItem.md).[`getValueAsString`](ValidationItem.md#getvalueasstring)

***

### getValueAsNumber()

> **getValueAsNumber**(`entityForm`, `value`): `number`

Defined in: [listgrid/validations/Validation.tsx:116](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/Validation.tsx#L116)

현재 필드값을 number 로 반환하는 편의성 메소드

#### Parameters

##### entityForm

[`EntityForm`](EntityForm.md)

##### value

[`FieldValue`](../interfaces/FieldValue.md)

#### Returns

`number`

#### Inherited from

[`ValidationItem`](ValidationItem.md).[`getValueAsNumber`](ValidationItem.md#getvalueasnumber)

***

### getValueAsBoolean()

> **getValueAsBoolean**(`entityForm`, `value`): `boolean`

Defined in: [listgrid/validations/Validation.tsx:127](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/Validation.tsx#L127)

현재 필드값을 boolean 로 반환하는 편의성 메소드.

#### Parameters

##### entityForm

[`EntityForm`](EntityForm.md)

##### value

[`FieldValue`](../interfaces/FieldValue.md)

#### Returns

`boolean`

#### Inherited from

[`ValidationItem`](ValidationItem.md).[`getValueAsBoolean`](ValidationItem.md#getvalueasboolean)

***

### returnValidateResult()

> **returnValidateResult**(`error`, `message?`): [`ValidateResult`](ValidateResult.md)

Defined in: [listgrid/validations/Validation.tsx:138](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/Validation.tsx#L138)

ValidateResult 를 반환하는 편의성 메소드.

#### Parameters

##### error

`boolean`

##### message?

`string`

#### Returns

[`ValidateResult`](ValidateResult.md)

#### Inherited from

[`ValidationItem`](ValidationItem.md).[`returnValidateResult`](ValidationItem.md#returnvalidateresult)
