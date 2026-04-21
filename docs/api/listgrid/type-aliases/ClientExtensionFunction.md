[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ClientExtensionFunction

# Type Alias: ClientExtensionFunction\<TInput, TOutput\>

> **ClientExtensionFunction**\<`TInput`, `TOutput`\> = (`data`, `context`) => `Promise`\<`TOutput`\> \| `TOutput`

Defined in: [listgrid/extensions/EntityFormExtension.types.ts:32](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/extensions/EntityFormExtension.types.ts#L32)

Client Extension 함수 타입 - EntityForm 접근 가능

## Type Parameters

### TInput

`TInput`

### TOutput

`TOutput` = `TInput`

## Parameters

### data

`TInput`

### context

[`ClientExtensionContext`](../interfaces/ClientExtensionContext.md)

## Returns

`Promise`\<`TOutput`\> \| `TOutput`
