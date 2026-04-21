[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ParentSearchWith

# Interface: ParentSearchWith

Defined in: [listgrid/config/Config.ts:401](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/Config.ts#L401)

many to one 필드에 대해 필터를 적용할 때, ManyToOne 필드의 fieldValue 를 그대로 searchForm 에 넣으면 안 되는 문제가 있다. 보통 ManyToOne 필드의 FieldValue 는 id 만 있지 않기 때문이다.
이럴 때 FieldValue 를 꺼내서 parent의 SearchForm에 맞게 변형해 주고, 필터가 해제되면 다시 해당 필드를 제거하는 처리가 필요하다.

## Properties

### append?

> `optional` **append?**: (`name`, `value`, `entityForm?`) => `Promise`\<[`SearchValue`](SearchValue.md)\>

Defined in: [listgrid/config/Config.ts:402](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/Config.ts#L402)

#### Parameters

##### name

`string`

##### value

`any`

##### entityForm?

[`EntityForm`](../classes/EntityForm.md)\<`any`\>

#### Returns

`Promise`\<[`SearchValue`](SearchValue.md)\>

***

### clear?

> `optional` **clear?**: `string`[]

Defined in: [listgrid/config/Config.ts:403](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/config/Config.ts#L403)
