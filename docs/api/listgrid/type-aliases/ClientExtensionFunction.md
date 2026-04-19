[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ClientExtensionFunction

# Type Alias: ClientExtensionFunction\<TInput, TOutput\>

> **ClientExtensionFunction**\<`TInput`, `TOutput`\> = (`data`, `context`) => `Promise`\<`TOutput`\> \| `TOutput`

Defined in: [listgrid/extensions/EntityFormExtension.types.ts:39](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/extensions/EntityFormExtension.types.ts#L39)

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
