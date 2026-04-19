[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / useEntityFormInitializer

# Function: useEntityFormInitializer()

> **useEntityFormInitializer**(`params`): (`options?`) => `Promise`\<`void`\>

Defined in: [listgrid/components/form/hooks/useEntityFormInitializer.ts:32](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/hooks/useEntityFormInitializer.ts#L32)

Custom hook for initializing EntityForm state and tabs.
EntityForm 상태 및 탭 초기화를 위한 커스텀 훅

## Parameters

### params

초기화에 필요한 파라미터 객체

#### entityForm

[`EntityForm`](../classes/EntityForm.md)

#### isSubCollectionEntity

`boolean`

#### pathname

`string`

#### session?

[`Session`](../interfaces/Session.md)

#### buttonLinks?

[`EntityButtonLinkProps`](../type-aliases/EntityButtonLinkProps.md)

#### onInitialize?

(`entityForm`) => `Promise`\<[`EntityForm`](../classes/EntityForm.md)\<`any`\>\>

#### setTabs

(`tabs`) => `void`

#### setTabIndex

(`tabId`) => `void`

#### setEntityForm

(`entityForm`) => `void`

#### setTitleText

(`entityForm`) => `void`

#### setLoadingError

(`error`) => `void`

## Returns

(`options?`) => `Promise`\<`void`\>
