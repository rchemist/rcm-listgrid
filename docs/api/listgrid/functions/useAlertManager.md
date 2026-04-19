[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / useAlertManager

# Function: useAlertManager()

> **useAlertManager**(`alertMessages`, `onRemove?`, `onTabChange?`, `onFieldFocus?`): `object`

Defined in: [listgrid/components/form/hooks/useAlertManager.ts:16](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/hooks/useAlertManager.ts#L16)

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
