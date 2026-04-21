[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / IpAddressValidation

# Class: IpAddressValidation

Defined in: [listgrid/validations/IpAddressValidation.ts:24](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/validations/IpAddressValidation.ts#L24)

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

Defined in: [listgrid/validations/IpAddressValidation.ts:25](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/validations/IpAddressValidation.ts#L25)

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

Defined in: [listgrid/validations/Validation.tsx:67](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/validations/Validation.tsx#L67)

#### Inherited from

[`ValidationItem`](ValidationItem.md).[`id`](ValidationItem.md#id)

***

### message?

> `optional` **message?**: `string`

Defined in: [listgrid/validations/Validation.tsx:69](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/validations/Validation.tsx#L69)

#### Inherited from

[`ValidationItem`](ValidationItem.md).[`message`](ValidationItem.md#message)

## Methods

### validate()

> **validate**(`entityForm`, `value`, `message?`): `Promise`\<[`ValidateResult`](ValidateResult.md)\>

Defined in: [listgrid/validations/IpAddressValidation.ts:33](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/validations/IpAddressValidation.ts#L33)

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

Defined in: [listgrid/validations/Validation.tsx:83](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/validations/Validation.tsx#L83)

에러 메시지 반환

#### Returns

`string`

#### Inherited from

[`ValidationItem`](ValidationItem.md).[`getErrorMessage`](ValidationItem.md#geterrormessage)

***

### getValueAsString()

> **getValueAsString**(`entityForm`, `value`): `string`

Defined in: [listgrid/validations/Validation.tsx:92](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/validations/Validation.tsx#L92)

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

Defined in: [listgrid/validations/Validation.tsx:109](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/validations/Validation.tsx#L109)

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

Defined in: [listgrid/validations/Validation.tsx:120](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/validations/Validation.tsx#L120)

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

Defined in: [listgrid/validations/Validation.tsx:131](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/validations/Validation.tsx#L131)

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
