[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / TranslatorFactory

# Type Alias: TranslatorFactory

> **TranslatorFactory** = () => [`Translator`](../interfaces/Translator.md)

Defined in: [listgrid/utils/i18n.ts:27](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/utils/i18n.ts#L27)

Host apps pass a FACTORY (not a fixed translator) because language may
change per call. The factory is invoked on every `getTranslation()` call.

## Returns

[`Translator`](../interfaces/Translator.md)
