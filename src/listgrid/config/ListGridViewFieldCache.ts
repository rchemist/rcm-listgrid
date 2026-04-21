import { parse, stringify } from '../utils/jsonUtils';

const cacheKey = 'listGridViewFields';

class CacheContext {
  public static create(value: string | null): CacheContext {
    const cache = new CacheContext();
    if (value) {
      const data = parse<{ data: Record<string, string[]> }>(value);
      cache.data = new Map<string, string[]>(Object.entries(data.data));
    }

    return cache;
  }

  data: Map<string, string[]> = new Map<string, string[]>();

  setFields(key: string, postFix: string | undefined, fields: string[]) {
    const cacheKey = this.createCacheKey(key, postFix);
    this.data.set(cacheKey, fields);
  }

  getFields(key: string, postFix?: string): string[] {
    const cacheKey = this.createCacheKey(key, postFix);
    return this.data.get(cacheKey) ?? [];
  }

  clearFields(key: string, postFix?: string) {
    const cacheKey = this.createCacheKey(key, postFix);
    this.data.delete(cacheKey);
  }

  private createCacheKey(key: string, postFix?: string): string {
    return key + (postFix ? '_' + postFix : '');
  }

  toJson(): string {
    return stringify(this);
  }
}

export function getListFieldsFromCache(key: string, postFix?: string): string[] | undefined {
  if (typeof window === 'undefined') return undefined;
  const cache = CacheContext.create(localStorage.getItem(cacheKey));
  return cache.getFields(key, postFix);
}

export function setListFieldsToCache(key: string, postFix: string | undefined, fields: string[]) {
  if (typeof window === 'undefined') return;
  const cache = CacheContext.create(localStorage.getItem(cacheKey));
  cache.setFields(key, postFix, fields);
  localStorage.setItem(cacheKey, cache.toJson());
}

export function clearListFieldsToCache(key: string, postFix: string | undefined) {
  if (typeof window === 'undefined') return;
  const cache = CacheContext.create(localStorage.getItem(cacheKey));
  cache.clearFields(key, postFix);
  localStorage.setItem(cacheKey, cache.toJson());
}
