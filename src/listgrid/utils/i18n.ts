// i18n contract: library emits translation keys (e.g. "common.save",
// "menu.academic.admission.notice"), host maps them to strings.
//
// Usage:
//   import { configureTranslator } from '@rchemist/listgrid';
//   configureTranslator(() => ({ t: myI18n.t, i18n: myI18n, initLocale: ... }));
//
// Library code then calls `getTranslation().t('key')` and gets the host's
// translation. When no host is configured, `t(key)` returns the key itself
// (identity translator) so UI is still renderable.

export interface TranslatorI18n {
  language?: string;
  changeLanguage?(lang: string): void;
}

export interface Translator {
  t: (key: string, fallback?: string) => string;
  i18n?: TranslatorI18n;
  initLocale?: (themeLocale: string) => void;
}

/**
 * Host apps pass a FACTORY (not a fixed translator) because language may
 * change per call. The factory is invoked on every `getTranslation()` call.
 */
export type TranslatorFactory = () => Translator;

let _factory: TranslatorFactory | undefined;

export function configureTranslator(factory: TranslatorFactory): void {
  _factory = factory;
}

const DEFAULT_TRANSLATOR: Translator = {
  t: (key: string, fallback?: string) => fallback ?? key,
  i18n: {},
  initLocale: () => {},
};

export function getTranslation(): Translator {
  if (_factory) {
    try {
      return _factory();
    } catch (e) {
      console.warn(
        '[@rchemist/listgrid] configured translator factory threw; falling back to identity.',
        e,
      );
      return DEFAULT_TRANSLATOR;
    }
  }
  return DEFAULT_TRANSLATOR;
}
