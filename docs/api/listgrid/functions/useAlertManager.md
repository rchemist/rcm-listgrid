[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / useAlertManager

# Function: useAlertManager()

> **useAlertManager**(`alertMessages`, `onRemove?`, `onTabChange?`, `onFieldFocus?`): `object`

Defined in: [listgrid/components/form/hooks/useAlertManager.ts:9](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/hooks/useAlertManager.ts#L9)

## Parameters

### alertMessages

[`AlertMessage`](../interfaces/AlertMessage.md)[]

### onRemove?

(`key`) => `void`

### onTabChange?

(`tabId`) => `void`

### onFieldFocus?

(`fieldName`) => `void`

## Returns

`object`

### visibleAlerts

> **visibleAlerts**: [`AlertMessage`](../interfaces/AlertMessage.md)[]

### isCollapsed

> **isCollapsed**: `boolean`

### handleLinkClick

> **handleLinkClick**: (`link`) => `void`

#### Parameters

##### link

[`AlertMessageLink`](../interfaces/AlertMessageLink.md)

#### Returns

`void`

### handleCloseAlert

> **handleCloseAlert**: (`key`) => `void`

#### Parameters

##### key

`string`

#### Returns

`void`

### toggleCollapse

> **toggleCollapse**: () => `void`

#### Returns

`void`

### getDominantColor

> **getDominantColor**: () => `"info"` \| `"success"` \| `"warning"` \| `"danger"`

#### Returns

`"info"` \| `"success"` \| `"warning"` \| `"danger"`
