[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / FormField

# Abstract Class: FormField\<TSelf, TValue, TForm\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:170](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L170)

## Extended by

- [`TextareaField`](TextareaField.md)
- [`HtmlField`](HtmlField.md)
- [`MarkdownField`](MarkdownField.md)
- [`PasswordField`](PasswordField.md)
- [`MultipleAssetField`](MultipleAssetField.md)
- [`MappedJoinField`](MappedJoinField.md)
- [`XrefMappingField`](XrefMappingField.md)
- [`XrefPriceMappingField`](XrefPriceMappingField.md)
- [`XrefPreferMappingField`](XrefPreferMappingField.md)
- [`XrefAvailableDateMappingField`](XrefAvailableDateMappingField.md)
- [`QrField`](QrField.md)
- [`MessageViewField`](MessageViewField.md)
- [`ProfileField`](ProfileField.md)
- [`InlineMapField`](InlineMapField.md)
- [`RuleField`](RuleField.md)
- [`ContentAssetField`](ContentAssetField.md)
- [`AddressMapField`](AddressMapField.md)
- [`ListableFormField`](ListableFormField.md)
- [`RevisionField`](RevisionField.md)

## Type Parameters

### TSelf

`TSelf` *extends* `FormField`\<`TSelf`, `TValue`, `TForm`\>

### TValue

`TValue` = `any`

### TForm

`TForm` *extends* `object` = `any`

## Implements

- [`EntityField`](../interfaces/EntityField.md)

## Constructors

### Constructor

> **new FormField**\<`TSelf`, `TValue`, `TForm`\>(`name`, `order`, `type`): `FormField`\<`TSelf`, `TValue`, `TForm`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:180](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L180)

#### Parameters

##### name

`string`

##### order

`number`

##### type

[`FieldType`](../type-aliases/FieldType.md)

#### Returns

`FormField`\<`TSelf`, `TValue`, `TForm`\>

## Properties

### order

> **order**: `number`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:175](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L175)

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`order`](../interfaces/EntityField.md#order)

***

### name

> **name**: `string`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:176](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L176)

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`name`](../interfaces/EntityField.md#name)

***

### type

> **type**: [`FieldType`](../type-aliases/FieldType.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:177](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L177)

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`type`](../interfaces/EntityField.md#type)

***

### exceptOnSave?

> `optional` **exceptOnSave?**: `boolean`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:178](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L178)

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`exceptOnSave`](../interfaces/EntityField.md#exceptonsave)

***

### value?

> `optional` **value?**: [`FieldValue`](../interfaces/FieldValue.md)\<`TValue`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:186](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L186)

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`value`](../interfaces/EntityField.md#value)

***

### tooltip?

> `optional` **tooltip?**: [`ConditionalReactNodeValue`](../type-aliases/ConditionalReactNodeValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:187](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L187)

***

### helpText?

> `optional` **helpText?**: [`ConditionalReactNodeValue`](../type-aliases/ConditionalReactNodeValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:188](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L188)

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`helpText`](../interfaces/EntityField.md#helptext)

***

### placeHolder?

> `optional` **placeHolder?**: [`ConditionalStringValue`](../type-aliases/ConditionalStringValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:189](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L189)

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`placeHolder`](../interfaces/EntityField.md#placeholder)

***

### hidden?

> `optional` **hidden?**: [`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:190](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L190)

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`hidden`](../interfaces/EntityField.md#hidden)

***

### label

> **label**: [`LabelType`](../type-aliases/LabelType.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:191](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L191)

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`label`](../interfaces/EntityField.md#label)

***

### readonly?

> `optional` **readonly?**: [`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:192](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L192)

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`readonly`](../interfaces/EntityField.md#readonly)

***

### required?

> `optional` **required?**: [`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:193](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L193)

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`required`](../interfaces/EntityField.md#required)

***

### hideLabel?

> `optional` **hideLabel?**: `boolean`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:194](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L194)

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`hideLabel`](../interfaces/EntityField.md#hidelabel)

***

### attributes?

> `optional` **attributes?**: `Map`\<`string`, `unknown`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:195](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L195)

ViewField 할 때 사용할 수 있다.
필드를 커스텀으로 표시하게 하는데 필요한 여러 정보를 자유롭게 사용할 수 있다.
이 정보는 저장 용도로는 사용되지 않는다.

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`attributes`](../interfaces/EntityField.md#attributes)

***

### requiredPermissions?

> `optional` **requiredPermissions?**: `string`[]

Defined in: [listgrid/components/fields/abstract/FormField.tsx:196](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L196)

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`requiredPermissions`](../interfaces/EntityField.md#requiredpermissions)

***

### cardIcon?

> `optional` **cardIcon?**: [`CardIconType`](../type-aliases/CardIconType.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:197](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L197)

***

### layout?

> `optional` **layout?**: [`FieldLayoutType`](../type-aliases/FieldLayoutType.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:198](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L198)

***

### lineBreak?

> `optional` **lineBreak?**: `boolean`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:199](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L199)

***

### form?

> `optional` **form?**: `object`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:201](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L201)

#### tabId

> **tabId**: `string`

#### fieldGroupId

> **fieldGroupId**: `string`

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`form`](../interfaces/EntityField.md#form)

***

### validations?

> `optional` **validations?**: [`Validation`](../interfaces/Validation.md)[]

Defined in: [listgrid/components/fields/abstract/FormField.tsx:203](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L203)

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`validations`](../interfaces/EntityField.md#validations)

***

### overrideRender?

> `optional` **overrideRender?**: (`params`) => `Promise`\<`ReactNode`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:204](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L204)

view 를 오버라이드 해 사용자정의 렌더링을 처리하는 경우 이 값을 설정한다.
ReactNode 나 null 을 반환하면 기존 view 를 완전히 대체하게 되고, undefined 를 반환하면 기존 View 를 사용하게 된다.

#### Parameters

##### params

[`FieldRenderParameters`](../interfaces/FieldRenderParameters.md)\<`TForm`, `TValue`\>

#### Returns

`Promise`\<`ReactNode`\>

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`overrideRender`](../interfaces/EntityField.md#overriderender)

***

### saveValue?

> `optional` **saveValue?**: (`entityForm`, `field`, `renderType?`) => `Promise`\<`TValue`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:207](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L207)

EntityForm 을 저장할 때 생성하는 formData 에 제공할 값을 override 할 수 있다.

#### Parameters

##### entityForm

[`EntityForm`](EntityForm.md)\<`TForm`\>

##### field

[`EntityField`](../interfaces/EntityField.md)

##### renderType?

[`RenderType`](../type-aliases/RenderType.md)

#### Returns

`Promise`\<`TValue`\>

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`saveValue`](../interfaces/EntityField.md#savevalue)

***

### displayFunc?

> `optional` **displayFunc?**: (`entityForm`, `field`, `renderType?`) => `Promise`\<`TValue`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:212](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L212)

display value 를 변조할 수 있다.

#### Parameters

##### entityForm

[`EntityForm`](EntityForm.md)\<`TForm`\>

##### field

[`EntityField`](../interfaces/EntityField.md)

##### renderType?

[`RenderType`](../type-aliases/RenderType.md)

#### Returns

`Promise`\<`TValue`\>

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`displayFunc`](../interfaces/EntityField.md#displayfunc)

***

### maskedValueFunc?

> `optional` **maskedValueFunc?**: (`entityForm`, `value`) => `Promise`\<`string`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:217](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L217)

#### Parameters

##### entityForm

[`EntityForm`](EntityForm.md)\<`TForm`\>

##### value

`TValue`

#### Returns

`Promise`\<`string`\>

## Methods

### viewValue()

> **viewValue**(`props`): `Promise`\<[`ViewRenderResult`](../interfaces/ViewRenderResult.md)\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:313](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L313)

View 모드에서 필드 값을 렌더링하는 공개 메소드
CardSubCollectionField 등에서 호출하여 사용

#### Parameters

##### props

[`ViewRenderProps`](../interfaces/ViewRenderProps.md)\<`TForm`\>

View 렌더링에 필요한 파라미터

#### Returns

`Promise`\<[`ViewRenderResult`](../interfaces/ViewRenderResult.md)\>

렌더링 결과

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`viewValue`](../interfaces/EntityField.md#viewvalue)

***

### clone()

> **clone**(`includeValue?`): `TSelf`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:321](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L321)

공통 clone 로직 - 모든 필드에서 사용
StateTracker 로직 포함

#### Parameters

##### includeValue?

`boolean`

#### Returns

`TSelf`

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`clone`](../interfaces/EntityField.md#clone)

***

### getTabId()

> **getTabId**(): `string`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:364](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L364)

#### Returns

`string`

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`getTabId`](../interfaces/EntityField.md#gettabid)

***

### getFieldGroupId()

> **getFieldGroupId**(): `string`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:368](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L368)

#### Returns

`string`

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`getFieldGroupId`](../interfaces/EntityField.md#getfieldgroupid)

***

### withTabId()

> **withTabId**(`tabId`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:372](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L372)

필드가 표시될 tab의 id 를 지정합니다.
보통 이 메소드는 EntityForm#addFields 에서 처리되므로 별도로 사용할 필요가 없습니다.

#### Parameters

##### tabId

`string`

#### Returns

`this`

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`withTabId`](../interfaces/EntityField.md#withtabid)

***

### withFieldGroupId()

> **withFieldGroupId**(`fieldGroupId`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:381](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L381)

필드가 표시될 fieldGroup 의 id 를 지정합니다.
보통 이 메소드는 EntityForm#addFields 에서 처리되므로 별도로 사용할 필요가 없습니다.

#### Parameters

##### fieldGroupId

`string`

#### Returns

`this`

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`withFieldGroupId`](../interfaces/EntityField.md#withfieldgroupid)

***

### getDisplayValue()

> **getDisplayValue**(`entityForm`, `renderType?`): `Promise`\<`any`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:390](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L390)

#### Parameters

##### entityForm

[`EntityForm`](EntityForm.md)\<`TForm`\>

##### renderType?

[`RenderType`](../type-aliases/RenderType.md)

#### Returns

`Promise`\<`any`\>

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`getDisplayValue`](../interfaces/EntityField.md#getdisplayvalue)

***

### withDisplayFunc()

> **withDisplayFunc**(`fn`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:411](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L411)

#### Parameters

##### fn

(`entityForm`, `field`, `renderType?`) => `Promise`\<`TValue`\>

#### Returns

`this`

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`withDisplayFunc`](../interfaces/EntityField.md#withdisplayfunc)

***

### withMaskedValue()

> **withMaskedValue**(`fn`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:427](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L427)

Set a masking function for readonly display.
When the field is readonly and has a value, the maskedValueFunc is called
to produce a masked display string. The original value is never modified.

#### Parameters

##### fn

(`entityForm`, `value`) => `Promise`\<`string`\>

#### Returns

`this`

***

### withAddOnly()

> **withAddOnly**(): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:432](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L432)

#### Returns

`this`

***

### withModifyOnly()

> **withModifyOnly**(): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:436](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L436)

#### Returns

`this`

***

### withViewHidden()

> **withViewHidden**(): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:440](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L440)

#### Returns

`this`

***

### withListOnly()

> **withListOnly**(): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:444](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L444)

#### Returns

`this`

***

### withViewPreset()

> **withViewPreset**(`type?`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:448](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L448)

Entity 의 상태(신규/수정)에 따라 readonly, hidden 을 ViewPreset 으로 지정해 사용할 수 있습니다.

#### Parameters

##### type?

[`ViewPreset`](../type-aliases/ViewPreset.md)

#### Returns

`this`

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`withViewPreset`](../interfaces/EntityField.md#withviewpreset)

***

### withHideLabel()

> **withHideLabel**(`hideLabel?`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:456](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L456)

이 필드의 hideLabel 을 지정한다.

#### Parameters

##### hideLabel?

`boolean`

#### Returns

`this`

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`withHideLabel`](../interfaces/EntityField.md#withhidelabel)

***

### withCardIcon()

> **withCardIcon**(`icon?`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:474](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L474)

Card View 모드에서 표시할 커스텀 아이콘을 설정합니다.
Tabler Icons 등의 아이콘 컴포넌트를 전달할 수 있습니다.

#### Parameters

##### icon?

[`CardIconType`](../type-aliases/CardIconType.md)

#### Returns

`this`

#### Example

```typescript
import { IconUser, IconMail } from '@tabler/icons-react';

TextField.create({ name: 'email', order: 1 })
  .withCardIcon(IconMail)
  .withLabel('이메일');
```

***

### withLayout()

> **withLayout**(`layout`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:480](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L480)

#### Parameters

##### layout

[`FieldLayoutType`](../type-aliases/FieldLayoutType.md)

#### Returns

`this`

***

### withLineBreak()

> **withLineBreak**(`lineBreak?`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:485](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L485)

#### Parameters

##### lineBreak?

`boolean`

#### Returns

`this`

***

### view()

> **view**(`params`): `Promise`\<`ReactNode`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:490](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L490)

#### Parameters

##### params

[`FieldRenderParameters`](../interfaces/FieldRenderParameters.md)\<`TForm`, `TValue`\>

#### Returns

`Promise`\<`ReactNode`\>

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`view`](../interfaces/EntityField.md#view)

***

### render()

> **render**(`params`): `Promise`\<`ReactNode`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:507](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L507)

공통 render 로직 - 모든 필드에서 사용
StateTracker, Performance tracking, Error handling 포함

#### Parameters

##### params

[`FieldRenderParameters`](../interfaces/FieldRenderParameters.md)\<`TForm`, `TValue`\>

#### Returns

`Promise`\<`ReactNode`\>

***

### withOverrideRender()

> **withOverrideRender**(`fn`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:524](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L524)

이 필드를 View 화면에서 렌더링하는 로직을 override 할 수 있습니다.

#### Parameters

##### fn

(`params`) => `Promise`\<`ReactNode`\>

#### Returns

`this`

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`withOverrideRender`](../interfaces/EntityField.md#withoverriderender)

***

### withOrder()

> **withOrder**(`order`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:533](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L533)

필드의 표시 순서를 설정합니다.

#### Parameters

##### order

`number`

#### Returns

`this`

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`withOrder`](../interfaces/EntityField.md#withorder)

***

### isBlank()

> **isBlank**(`renderType?`): `Promise`\<`boolean`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:538](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L538)

#### Parameters

##### renderType?

[`RenderType`](../type-aliases/RenderType.md) = `'create'`

#### Returns

`Promise`\<`boolean`\>

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`isBlank`](../interfaces/EntityField.md#isblank)

***

### isDirty()

> **isDirty**(): `boolean`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:549](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L549)

#### Returns

`boolean`

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`isDirty`](../interfaces/EntityField.md#isdirty)

***

### withTooltip()

> **withTooltip**(`tooltip?`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:615](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L615)

필드 전체에 툴팁을 씌울 수 있다.

#### Parameters

##### tooltip?

[`ConditionalReactNodeValue`](../type-aliases/ConditionalReactNodeValue.md)

#### Returns

`this`

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`withTooltip`](../interfaces/EntityField.md#withtooltip)

***

### withHelpText()

> **withHelpText**(`helpText?`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:621](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L621)

필드 입력폼 하단에 출력될 helpText 를 지정할 수 있습니다.

#### Parameters

##### helpText?

[`ConditionalReactNodeValue`](../type-aliases/ConditionalReactNodeValue.md)

#### Returns

`this`

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`withHelpText`](../interfaces/EntityField.md#withhelptext)

***

### withPlaceHolder()

> **withPlaceHolder**(`placeHolder?`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:627](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L627)

#### Parameters

##### placeHolder?

[`ConditionalStringValue`](../type-aliases/ConditionalStringValue.md)

#### Returns

`this`

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`withPlaceHolder`](../interfaces/EntityField.md#withplaceholder)

***

### withHidden()

> **withHidden**(`hidden?`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:633](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L633)

필드의 visible 옵션을 설정할 수 있습니다.

#### Parameters

##### hidden?

[`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

#### Returns

`this`

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`withHidden`](../interfaces/EntityField.md#withhidden)

***

### withLabel()

> **withLabel**(`label?`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:639](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L639)

필드 입력폼의 라벨에 표시될 내용을 설정할 수 있습니다.

#### Parameters

##### label?

[`LabelType`](../type-aliases/LabelType.md)

#### Returns

`this`

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`withLabel`](../interfaces/EntityField.md#withlabel)

***

### withReadOnly()

> **withReadOnly**(`readOnly?`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:644](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L644)

필드가 readonly 인지 여부를 설정할 수 있습니다.

#### Parameters

##### readOnly?

[`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

#### Returns

`this`

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`withReadOnly`](../interfaces/EntityField.md#withreadonly)

***

### withRequired()

> **withRequired**(`required?`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:649](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L649)

#### Parameters

##### required?

[`ConditionalBooleanValue`](../type-aliases/ConditionalBooleanValue.md)

#### Returns

`this`

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`withRequired`](../interfaces/EntityField.md#withrequired)

***

### withValue()

> **withValue**(`value`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:654](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L654)

#### Parameters

##### value

`any`

#### Returns

`this`

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`withValue`](../interfaces/EntityField.md#withvalue)

***

### getOrder()

> **getOrder**(): `number`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:678](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L678)

#### Returns

`number`

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`getOrder`](../interfaces/EntityField.md#getorder)

***

### getName()

> **getName**(): `string`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:682](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L682)

#### Returns

`string`

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`getName`](../interfaces/EntityField.md#getname)

***

### getLabel()

> **getLabel**(): [`LabelType`](../type-aliases/LabelType.md)

Defined in: [listgrid/components/fields/abstract/FormField.tsx:686](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L686)

#### Returns

[`LabelType`](../type-aliases/LabelType.md)

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`getLabel`](../interfaces/EntityField.md#getlabel)

***

### withAttributes()

> **withAttributes**(`attributes`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:693](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L693)

#### Parameters

##### attributes

`Map`\<`string`, `unknown`\>

#### Returns

`this`

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`withAttributes`](../interfaces/EntityField.md#withattributes)

***

### viewLabel()

> **viewLabel**(`t`): `ReactNode`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:698](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L698)

#### Parameters

##### t

`any`

#### Returns

`ReactNode`

***

### getTooltip()

> **getTooltip**(`props`): `Promise`\<`ReactNode`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:709](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L709)

#### Parameters

##### props

[`FieldInfoParameters`](../interfaces/FieldInfoParameters.md)\<`TForm`\>

#### Returns

`Promise`\<`ReactNode`\>

***

### getHelpText()

> **getHelpText**(`props`): `Promise`\<`ReactNode`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:713](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L713)

#### Parameters

##### props

[`FieldInfoParameters`](../interfaces/FieldInfoParameters.md)\<`TForm`\>

#### Returns

`Promise`\<`ReactNode`\>

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`getHelpText`](../interfaces/EntityField.md#gethelptext)

***

### getPlaceHolder()

> **getPlaceHolder**(`props`): `Promise`\<`string`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:717](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L717)

#### Parameters

##### props

[`FieldInfoParameters`](../interfaces/FieldInfoParameters.md)\<`TForm`\>

#### Returns

`Promise`\<`string`\>

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`getPlaceHolder`](../interfaces/EntityField.md#getplaceholder)

***

### isRequired()

> **isRequired**(`props`): `Promise`\<`boolean`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:721](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L721)

#### Parameters

##### props

[`FieldInfoParameters`](../interfaces/FieldInfoParameters.md)\<`TForm`\>

#### Returns

`Promise`\<`boolean`\>

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`isRequired`](../interfaces/EntityField.md#isrequired)

***

### isHidden()

> **isHidden**(`props`): `Promise`\<`boolean`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:725](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L725)

#### Parameters

##### props

[`FieldInfoParameters`](../interfaces/FieldInfoParameters.md)\<`TForm`\>

#### Returns

`Promise`\<`boolean`\>

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`isHidden`](../interfaces/EntityField.md#ishidden)

***

### isReadonly()

> **isReadonly**(`props`): `Promise`\<`boolean`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:729](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L729)

#### Parameters

##### props

[`FieldInfoParameters`](../interfaces/FieldInfoParameters.md)\<`TForm`\>

#### Returns

`Promise`\<`boolean`\>

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`isReadonly`](../interfaces/EntityField.md#isreadonly)

***

### getCurrentValue()

> **getCurrentValue**(`renderType?`): `Promise`\<`TValue` \| `undefined`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:733](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L733)

#### Parameters

##### renderType?

[`RenderType`](../type-aliases/RenderType.md)

#### Returns

`Promise`\<`TValue` \| `undefined`\>

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`getCurrentValue`](../interfaces/EntityField.md#getcurrentvalue)

***

### getSaveValue()

> **getSaveValue**(`entityForm`, `renderType?`): `Promise`\<`TValue` \| `undefined`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:746](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L746)

#### Parameters

##### entityForm

[`EntityForm`](EntityForm.md)\<`TForm`\>

##### renderType?

[`RenderType`](../type-aliases/RenderType.md)

#### Returns

`Promise`\<`TValue` \| `undefined`\>

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`getSaveValue`](../interfaces/EntityField.md#getsavevalue)

***

### getFetchedValue()

> **getFetchedValue**(): `Promise`\<`TValue` \| `undefined`\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:757](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L757)

#### Returns

`Promise`\<`TValue` \| `undefined`\>

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`getFetchedValue`](../interfaces/EntityField.md#getfetchedvalue)

***

### resetValue()

> **resetValue**(`renderType?`): `void`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:764](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L764)

#### Parameters

##### renderType?

[`RenderType`](../type-aliases/RenderType.md)

#### Returns

`void`

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`resetValue`](../interfaces/EntityField.md#resetvalue)

***

### withForm()

> **withForm**(`form`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:776](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L776)

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

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`withForm`](../interfaces/EntityField.md#withform)

***

### withValidations()

> **withValidations**(...`validation`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:781](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L781)

#### Parameters

##### validation

...([`Validation`](../interfaces/Validation.md) \| `undefined`)[]

#### Returns

`this`

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`withValidations`](../interfaces/EntityField.md#withvalidations)

***

### validate()

> **validate**(`entityForm`, `session?`): `Promise`\<[`ValidateResult`](ValidateResult.md) \| [`ValidateResult`](ValidateResult.md)[]\>

Defined in: [listgrid/components/fields/abstract/FormField.tsx:786](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L786)

#### Parameters

##### entityForm

[`EntityForm`](EntityForm.md)\<`TForm`\>

##### session?

[`Session`](../interfaces/Session.md)

#### Returns

`Promise`\<[`ValidateResult`](ValidateResult.md) \| [`ValidateResult`](ValidateResult.md)[]\>

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`validate`](../interfaces/EntityField.md#validate)

***

### withDefaultValue()

> **withDefaultValue**(`value`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:832](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L832)

#### Parameters

##### value

`any`

#### Returns

`this`

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`withDefaultValue`](../interfaces/EntityField.md#withdefaultvalue)

***

### withRequiredPermissions()

> **withRequiredPermissions**(...`permissions`): `this`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:846](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L846)

이 필드를 보기 위해 필요한 권한을 설정합니다.
사용자가 지정된 권한 중 하나라도 가지고 있으면 필드가 표시됩니다.

#### Parameters

##### permissions

...`string`[]

#### Returns

`this`

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`withRequiredPermissions`](../interfaces/EntityField.md#withrequiredpermissions)

***

### isPermitted()

> **isPermitted**(`userPermissions?`): `boolean`

Defined in: [listgrid/components/fields/abstract/FormField.tsx:860](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/abstract/FormField.tsx#L860)

사용자가 이 필드를 볼 수 있는 권한이 있는지 확인합니다.
requiredPermissions가 없거나 비어있으면 true를 반환합니다.
사용자가 requiredPermissions 중 하나라도 가지고 있으면 true를 반환합니다.

#### Parameters

##### userPermissions?

`string`[]

#### Returns

`boolean`

#### Implementation of

[`EntityField`](../interfaces/EntityField.md).[`isPermitted`](../interfaces/EntityField.md#ispermitted)
