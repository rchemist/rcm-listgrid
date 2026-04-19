import { describe, it, expect, beforeEach } from 'vitest';
import { configureTranslator, getTranslation } from './i18n';

describe('i18n', () => {
  beforeEach(() => {
    // Reset to identity by configuring an identity factory
    configureTranslator(() => ({ t: (key, fallback) => fallback ?? key }));
  });

  it('identity translator returns the key when no fallback', () => {
    configureTranslator(() => ({ t: (key, fallback) => fallback ?? key }));
    expect(getTranslation().t('common.save')).toBe('common.save');
  });

  it('identity translator returns fallback when provided', () => {
    configureTranslator(() => ({ t: (key, fallback) => fallback ?? key }));
    expect(getTranslation().t('missing.key', 'Saved')).toBe('Saved');
  });

  it('configured dictionary-based translator returns mapped string', () => {
    const dict: Record<string, string> = { 'common.save': '저장' };
    configureTranslator(() => ({
      t: (key, fallback) => dict[key] ?? fallback ?? key,
    }));
    expect(getTranslation().t('common.save')).toBe('저장');
    expect(getTranslation().t('unknown')).toBe('unknown');
  });

  it('falls back to identity translator when factory throws', () => {
    configureTranslator(() => {
      throw new Error('boom');
    });
    const t = getTranslation();
    expect(t.t('foo')).toBe('foo');
    expect(t.t('foo', 'bar')).toBe('bar');
  });

  it('factory is invoked per call (supports runtime language switching)', () => {
    let lang = 'en';
    configureTranslator(() => ({
      t: (key) => `${lang}:${key}`,
    }));
    expect(getTranslation().t('hi')).toBe('en:hi');
    lang = 'ko';
    expect(getTranslation().t('hi')).toBe('ko:hi');
  });

  it('exposes optional i18n and initLocale', () => {
    configureTranslator(() => ({
      t: (key) => key,
      i18n: { language: 'ko' },
      initLocale: () => {},
    }));
    const translator = getTranslation();
    expect(translator.i18n?.language).toBe('ko');
    expect(typeof translator.initLocale).toBe('function');
  });
});
