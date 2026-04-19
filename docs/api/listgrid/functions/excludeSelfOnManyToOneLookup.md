[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / excludeSelfOnManyToOneLookup

# Function: excludeSelfOnManyToOneLookup()

> **excludeSelfOnManyToOneLookup**(): [`ManyToOneFilter`](../type-aliases/ManyToOneFilter.md)

Defined in: [listgrid/config/Config.ts:369](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/Config.ts#L369)

자기 자신을 ManyToOneField 로 가지고 있는 경우 (location.parentLocation 과 같이)
manyToOne 을 lookup 할 때 자기 자신을 제외하는 필터

## Returns

[`ManyToOneFilter`](../type-aliases/ManyToOneFilter.md)
