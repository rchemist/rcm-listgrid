[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / RuleFieldEntityForm

# Type Alias: RuleFieldEntityForm

> **RuleFieldEntityForm** = `object`

Defined in: [listgrid/components/fields/rule/Type.ts:95](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/rule/Type.ts#L95)

Rule 이 항상 동일한 엔티티를 대상으로 적용되지는 않는다.
예를 들어 주문 상품 오퍼라면
상품에 대한 Rule 이 있을 수도 있고
주문에 대한 Rule 이 있을 수도 있다.
또 Category 에 대한 Rule 이 있을 수도 있다.
따라서 여러 엔티티폼을 전달할 수 있어야 한다.
또 각 엔티티폼에 대해 prefix 와 name 을 지정해 어떤 필드의 값인지 구분할 수 있어야 한다.
엔티티폼을 통째로 넘기거나 필요한 필드를 지정해 넘길 수 있다.

## Properties

### prefix

> **prefix**: `string`

Defined in: [listgrid/components/fields/rule/Type.ts:96](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/rule/Type.ts#L96)

***

### label

> **label**: `string`

Defined in: [listgrid/components/fields/rule/Type.ts:97](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/rule/Type.ts#L97)

***

### entityForm?

> `optional` **entityForm?**: [`EntityForm`](../classes/EntityForm.md)

Defined in: [listgrid/components/fields/rule/Type.ts:98](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/rule/Type.ts#L98)

***

### fields?

> `optional` **fields?**: [`FormField`](../classes/FormField.md)\<`any`\>[]

Defined in: [listgrid/components/fields/rule/Type.ts:99](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/fields/rule/Type.ts#L99)
