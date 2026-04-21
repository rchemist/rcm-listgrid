[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / validateIpAddressTag

# Function: validateIpAddressTag()

> **validateIpAddressTag**(`value`): `TagValidationResult`

Defined in: [listgrid/validations/IpAddressValidation.ts:60](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/validations/IpAddressValidation.ts#L60)

TagField의 withTagValidation에서 사용할 IP 주소 검증 함수
각 태그가 추가될 때 실시간으로 검증합니다.

## Parameters

### value

`string`

검증할 IP 주소 값

## Returns

`TagValidationResult`

TagValidationResult
