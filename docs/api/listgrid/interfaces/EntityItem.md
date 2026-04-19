[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / EntityItem

# Interface: EntityItem

Defined in: [listgrid/config/EntityItem.ts:19](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L19)

## Extended by

- [`EntityField`](EntityField.md)

## Properties

### order

> **order**: `number`

Defined in: [listgrid/config/EntityItem.ts:20](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L20)

***

### name

> **name**: `string`

Defined in: [listgrid/config/EntityItem.ts:21](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L21)

***

### label?

> `optional` **label?**: [`LabelType`](../type-aliases/LabelType.md)

Defined in: [listgrid/config/EntityItem.ts:22](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L22)

***

### helpText?

> `optional` **helpText?**: [`ConditionalReactNodeValue`](../type-aliases/ConditionalReactNodeValue.md)

Defined in: [listgrid/config/EntityItem.ts:23](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L23)

***

### hidden?

> `optional` **hidden?**: [`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

Defined in: [listgrid/config/EntityItem.ts:24](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L24)

***

### readonly?

> `optional` **readonly?**: [`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

Defined in: [listgrid/config/EntityItem.ts:25](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L25)

***

### hideLabel?

> `optional` **hideLabel?**: `boolean`

Defined in: [listgrid/config/EntityItem.ts:26](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L26)

***

### form?

> `optional` **form?**: `object`

Defined in: [listgrid/config/EntityItem.ts:29](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L29)

#### tabId

> **tabId**: `string`

#### fieldGroupId

> **fieldGroupId**: `string`

## Methods

### clone()

> **clone**(`includeValue?`): `any`

Defined in: [listgrid/config/EntityItem.ts:32](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L32)

#### Parameters

##### includeValue?

`boolean`

#### Returns

`any`

***

### getTabId()

> **getTabId**(): `string`

Defined in: [listgrid/config/EntityItem.ts:34](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L34)

#### Returns

`string`

***

### getFieldGroupId()

> **getFieldGroupId**(): `string`

Defined in: [listgrid/config/EntityItem.ts:36](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L36)

#### Returns

`string`

***

### withTabId()

> **withTabId**(`tabId`): `this`

Defined in: [listgrid/config/EntityItem.ts:43](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L43)

필드가 표시될 tab의 id 를 지정합니다.
보통 이 메소드는 EntityForm#addFields 에서 처리되므로 별도로 사용할 필요가 없습니다.

#### Parameters

##### tabId

`string`

#### Returns

`this`

***

### withFieldGroupId()

> **withFieldGroupId**(`fieldGroupId`): `this`

Defined in: [listgrid/config/EntityItem.ts:50](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L50)

필드가 표시될 fieldGroup 의 id 를 지정합니다.
보통 이 메소드는 EntityForm#addFields 에서 처리되므로 별도로 사용할 필요가 없습니다.

#### Parameters

##### fieldGroupId

`string`

#### Returns

`this`

***

### withViewPreset()

> **withViewPreset**(`type`): `this`

Defined in: [listgrid/config/EntityItem.ts:56](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L56)

Entity 의 상태(신규/수정)에 따라 readonly, hidden 을 ViewPreset 으로 지정해 사용할 수 있습니다.

#### Parameters

##### type

[`ViewPreset`](../type-aliases/ViewPreset.md)

#### Returns

`this`

***

### withHelpText()

> **withHelpText**(`helpText?`): `this`

Defined in: [listgrid/config/EntityItem.ts:62](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L62)

필드 입력폼 하단에 출력될 helpText 를 지정할 수 있습니다.

#### Parameters

##### helpText?

[`ConditionalReactNodeValue`](../type-aliases/ConditionalReactNodeValue.md)

#### Returns

`this`

***

### withTooltip()

> **withTooltip**(`tooltip?`): `this`

Defined in: [listgrid/config/EntityItem.ts:68](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L68)

필드 전체에 툴팁을 씌울 수 있다.

#### Parameters

##### tooltip?

[`ConditionalReactNodeValue`](../type-aliases/ConditionalReactNodeValue.md)

#### Returns

`this`

***

### withHidden()

> **withHidden**(`hidden?`): `this`

Defined in: [listgrid/config/EntityItem.ts:74](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L74)

필드의 visible 옵션을 설정할 수 있습니다.

#### Parameters

##### hidden?

[`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

#### Returns

`this`

***

### withLabel()

> **withLabel**(`label?`): `this`

Defined in: [listgrid/config/EntityItem.ts:80](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L80)

필드 입력폼의 라벨에 표시될 내용을 설정할 수 있습니다.

#### Parameters

##### label?

[`LabelType`](../type-aliases/LabelType.md)

#### Returns

`this`

***

### withReadOnly()

> **withReadOnly**(`readOnly?`): `this`

Defined in: [listgrid/config/EntityItem.ts:86](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L86)

필드가 readonly 인지 여부를 설정할 수 있습니다.

#### Parameters

##### readOnly?

[`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

#### Returns

`this`

***

### withHideLabel()

> **withHideLabel**(`hideLabel?`): `this`

Defined in: [listgrid/config/EntityItem.ts:92](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L92)

이 필드의 hideLabel 을 지정한다.

#### Parameters

##### hideLabel?

`boolean`

#### Returns

`this`

***

### withOrder()

> **withOrder**(`order`): `this`

Defined in: [listgrid/config/EntityItem.ts:98](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L98)

필드의 표시 순서를 설정합니다.

#### Parameters

##### order

`number`

#### Returns

`this`

***

### getOrder()

> **getOrder**(): `number`

Defined in: [listgrid/config/EntityItem.ts:100](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L100)

#### Returns

`number`

***

### getName()

> **getName**(): `string`

Defined in: [listgrid/config/EntityItem.ts:102](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L102)

#### Returns

`string`

***

### getLabel()

> **getLabel**(): [`LabelType`](../type-aliases/LabelType.md)

Defined in: [listgrid/config/EntityItem.ts:104](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L104)

#### Returns

[`LabelType`](../type-aliases/LabelType.md)

***

### getHelpText()

> **getHelpText**(`props`): `Promise`\<`ReactNode`\>

Defined in: [listgrid/config/EntityItem.ts:106](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L106)

#### Parameters

##### props

[`FieldInfoParameters`](FieldInfoParameters.md)

#### Returns

`Promise`\<`ReactNode`\>

***

### isHidden()

> **isHidden**(`props`): `Promise`\<`boolean`\>

Defined in: [listgrid/config/EntityItem.ts:108](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L108)

#### Parameters

##### props

[`FieldInfoParameters`](FieldInfoParameters.md)

#### Returns

`Promise`\<`boolean`\>

***

### isReadonly()

> **isReadonly**(`props`): `Promise`\<`boolean`\>

Defined in: [listgrid/config/EntityItem.ts:110](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L110)

#### Parameters

##### props

[`FieldInfoParameters`](FieldInfoParameters.md)

#### Returns

`Promise`\<`boolean`\>

***

### withForm()

> **withForm**(`form`): `this`

Defined in: [listgrid/config/EntityItem.ts:117](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/config/EntityItem.ts#L117)

필드가 표시될 tabId 와 fieldGroupId 를 설정합니다.
withTabId, withFieldGroupId 를 한번에 지정하는 것과 같습니다.

#### Parameters

##### form

###### tabId

`string`

###### fieldGroupId

`string`

#### Returns

`this`
