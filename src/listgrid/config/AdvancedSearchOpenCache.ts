import { parse, stringify } from '../utils/jsonUtils';

class CacheContext {
  public static create(value: string | null): CacheContext {
    const cache = new CacheContext();
    if (value) {
      const data = parse<{ data: Record<string, boolean> }>(value);
      cache.data = new Map<string, boolean>(Object.entries(data.data));
    }

    return cache;
  }

  data: Map<string, boolean> = new Map<string, boolean>();

  isOpened(key: string, postFix?: string): boolean {
    const cacheKey = key + (postFix ? '_' + postFix : '');
    return this.data.get(cacheKey) ?? false;
  }

  setOpened(key: string, postFix?: string, opened: boolean = true) {
    const cacheKey = key + (postFix ? '_' + postFix : '');
    this.data.set(cacheKey, opened);
  }

  setClosed(key: string, postFix?: string) {
    this.setOpened(key, postFix, false);
  }

  toJson(): string {
    return stringify(this);
  }
}

export function isOpenedAdvancedSearch(key: string, postFix?: string): boolean {
  if (typeof window === 'undefined') return false;
  const cache = CacheContext.create(localStorage.getItem('advancedSearchFormOpened'));
  return cache.isOpened(key, postFix);
}

export function setOpenedAdvancedSearch(key: string, postFix?: string, opened: boolean = true) {
  if (typeof window === 'undefined') return;
  const cache = CacheContext.create(localStorage.getItem('advancedSearchFormOpened'));
  cache.setOpened(key, postFix, opened);
  localStorage.setItem('advancedSearchFormOpened', cache.toJson());
}

export function setClosedAdvancedSearch(key: string, postFix?: string) {
  if (typeof window === 'undefined') return;
  const cache = CacheContext.create(localStorage.getItem('advancedSearchFormOpened'));
  cache.setClosed(key, postFix);
  localStorage.setItem('advancedSearchFormOpened', cache.toJson());
}
