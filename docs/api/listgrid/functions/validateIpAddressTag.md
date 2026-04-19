[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / validateIpAddressTag

# Function: validateIpAddressTag()

> **validateIpAddressTag**(`value`): `TagValidationResult`

Defined in: [listgrid/validations/IpAddressValidation.ts:67](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/validations/IpAddressValidation.ts#L67)

TagField의 withTagValidation에서 사용할 IP 주소 검증 함수
각 태그가 추가될 때 실시간으로 검증합니다.

## Parameters

### value

`string`

검증할 IP 주소 값

## Returns

`TagValidationResult`

TagValidationResult
