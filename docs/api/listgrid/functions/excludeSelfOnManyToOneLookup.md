[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / excludeSelfOnManyToOneLookup

# Function: excludeSelfOnManyToOneLookup()

> **excludeSelfOnManyToOneLookup**(): [`ManyToOneFilter`](../type-aliases/ManyToOneFilter.md)

Defined in: [listgrid/config/Config.ts:362](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/Config.ts#L362)

자기 자신을 ManyToOneField 로 가지고 있는 경우 (location.parentLocation 과 같이)
manyToOne 을 lookup 할 때 자기 자신을 제외하는 필터

## Returns

[`ManyToOneFilter`](../type-aliases/ManyToOneFilter.md)
