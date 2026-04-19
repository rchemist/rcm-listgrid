[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / TranslatorFactory

# Type Alias: TranslatorFactory

> **TranslatorFactory** = () => [`Translator`](../interfaces/Translator.md)

Defined in: [listgrid/utils/i18n.ts:27](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/utils/i18n.ts#L27)

Host apps pass a FACTORY (not a fixed translator) because language may
change per call. The factory is invoked on every `getTranslation()` call.

## Returns

[`Translator`](../interfaces/Translator.md)
