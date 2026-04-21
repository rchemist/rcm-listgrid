[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / getInputRendererParameters

# Function: getInputRendererParameters()

> **getInputRendererParameters**\<`TForm`, `TValue`\>(`field`, `params`): `Promise`\<\{ `value`: `any`; `name`: `string`; `label`: [`LabelType`](../type-aliases/LabelType.md); `attributes`: `Map`\<`string`, `unknown`\> \| `undefined`; `entityForm`: [`EntityForm`](../classes/EntityForm.md)\<`TForm`\>; `session?`: [`Session`](../interfaces/Session.md); `onChange`: (`value`, `propagation?`) => `void`; `onError?`: (`message`) => `void`; `clearError?`: () => `void`; `required?`: `boolean`; `readonly?`: `boolean`; `placeHolder?`: `string`; `helpText?`: `ReactNode`; `subCollectionEntity?`: `boolean`; `updateEntityForm?`: (`updater`) => `Promise`\<`void`\>; `resetEntityForm?`: (`delay?`, `preserveState?`) => `Promise`\<`void`\>; \}\>

Defined in: [listgrid/components/helper/FieldRendererHelper.tsx:11](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/helper/FieldRendererHelper.tsx#L11)

## Type Parameters

### TForm

`TForm` *extends* `object` = `any`

### TValue

`TValue` = `any`

## Parameters

### field

[`FormField`](../classes/FormField.md)\<`any`, `TValue`, `TForm`\>

### params

[`FieldRenderParameters`](../interfaces/FieldRenderParameters.md)\<`TForm`, `TValue`\>

## Returns

`Promise`\<\{ `value`: `any`; `name`: `string`; `label`: [`LabelType`](../type-aliases/LabelType.md); `attributes`: `Map`\<`string`, `unknown`\> \| `undefined`; `entityForm`: [`EntityForm`](../classes/EntityForm.md)\<`TForm`\>; `session?`: [`Session`](../interfaces/Session.md); `onChange`: (`value`, `propagation?`) => `void`; `onError?`: (`message`) => `void`; `clearError?`: () => `void`; `required?`: `boolean`; `readonly?`: `boolean`; `placeHolder?`: `string`; `helpText?`: `ReactNode`; `subCollectionEntity?`: `boolean`; `updateEntityForm?`: (`updater`) => `Promise`\<`void`\>; `resetEntityForm?`: (`delay?`, `preserveState?`) => `Promise`\<`void`\>; \}\>
