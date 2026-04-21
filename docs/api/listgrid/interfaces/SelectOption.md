[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / SelectOption

# Interface: SelectOption

Defined in: [listgrid/form/Type.ts:8](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/Type.ts#L8)

## Properties

### label?

> `optional` **label?**: `string`

Defined in: [listgrid/form/Type.ts:10](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/Type.ts#L10)

***

### listLabel?

> `optional` **listLabel?**: `string`

Defined in: [listgrid/form/Type.ts:13](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/Type.ts#L13)

***

### value

> **value**: `any`

Defined in: [listgrid/form/Type.ts:16](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/Type.ts#L16)

***

### color?

> `optional` **color?**: `"primary"` \| `"info"` \| `"success"` \| `"warning"` \| `"danger"` \| `"secondary"` \| `"dark"` \| `"gray"` \| `"red"` \| `"pink"` \| `"grape"` \| `"violet"` \| `"indigo"` \| `"blue"` \| `"cyan"` \| `"green"` \| `"lime"` \| `"yellow"` \| `"orange"` \| `"teal"` \| `"black"` \| `"white"`

Defined in: [listgrid/form/Type.ts:19](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/Type.ts#L19)

***

### readonly?

> `optional` **readonly?**: `boolean`

Defined in: [listgrid/form/Type.ts:25](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/Type.ts#L25)

이 옵션값이 현재 필드의 값일 때 필드를 읽기 전용으로 설정할지 여부.
true이면 해당 값이 선택되었을 때 변경이 불가능합니다.

***

### targets?

> `optional` **targets?**: `string`[]

Defined in: [listgrid/form/Type.ts:32](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/form/Type.ts#L32)

이 옵션값에서 전이 가능한 대상 옵션 값 목록.
이 값이 설정되면 현재 옵션에서 targets 배열에 포함된 값으로만 변경할 수 있습니다.
이 값이 없으면 모든 옵션으로 변경 가능합니다.
