[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / useContentAsset

# Function: useContentAsset()

> **useContentAsset**(`__namedParameters`): `object`

Defined in: [listgrid/components/fields/contentasset/hooks/useContentAsset.ts:34](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/fields/contentasset/hooks/useContentAsset.ts#L34)

ContentAsset 상태 관리 훅
범용적인 파일 업로드 및 관리를 위한 상태 관리

## Parameters

### \_\_namedParameters

`UseContentAssetProps`

## Returns

`object`

### assets

> **assets**: [`ContentAsset`](../interfaces/ContentAsset.md)[]

### loading

> **loading**: `boolean`

### errors

> **errors**: [`ContentAssetError`](../interfaces/ContentAssetError.md)[]

### titleErrors

> **titleErrors**: `object`

#### Index Signature

\[`key`: `number`\]: `string`

### setTitleErrors

> **setTitleErrors**: `Dispatch`\<`SetStateAction`\<\{\[`key`: `number`\]: `string`; \}\>\>

### handleAddAsset

> **handleAddAsset**: () => `void`

#### Returns

`void`

### handleRemoveAsset

> **handleRemoveAsset**: (`index`) => `void`

#### Parameters

##### index

`number`

#### Returns

`void`

### handleUpdateAsset

> **handleUpdateAsset**: (`index`, `field`, `value`) => `void`

#### Parameters

##### index

`number`

##### field

keyof [`ContentAsset`](../interfaces/ContentAsset.md)

##### value

`any`

#### Returns

`void`

### handleTitleBlur

> **handleTitleBlur**: (`index`, `value`) => `void`

#### Parameters

##### index

`number`

##### value

`string`

#### Returns

`void`

### handleFileUpload

> **handleFileUpload**: (`index`, `file`, `onUploadProgress?`) => `Promise`\<`void`\>

#### Parameters

##### index

`number`

##### file

`File`

##### onUploadProgress?

(`progress`) => `void`

#### Returns

`Promise`\<`void`\>

### validateAll

> **validateAll**: () => `boolean`

#### Returns

`boolean`

### canAddMore

> **canAddMore**: `boolean`

### isEmpty

> **isEmpty**: `boolean`

### isReadonly

> **isReadonly**: `boolean` = `readonly`
