/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

import {parse, stringify} from '@gjcu/ui/utils/jsonUtils';

const cacheKey = 'listGridViewFields';

class CacheContext {
  public static create(value: any): CacheContext {
    const cache = new CacheContext();
    const data = parse(value);

    if (value) {
      cache.data = new Map<string, string[]>(Object.entries(data.data));
    }

    return cache;
  }

  data: Map<string, string[]> = new Map<string, string[]>();

  setFields(key: string, postFix: string | undefined, fields: string[]) {
    const cacheKey = this.createCacheKey(key, postFix);
    this.data.set(cacheKey, fields);
  }

  getFields(key: string, postFix?: string) : string[] {
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

export function getListFieldsFromCache(key: string, postFix?: string): string[] | undefined{
  if (typeof window === 'undefined')
    return undefined;
  const cache = CacheContext.create(localStorage.getItem(cacheKey));
  return cache.getFields(key, postFix);
}

export function setListFieldsToCache(key: string, postFix: string | undefined, fields: string[]) {
  if (typeof window === 'undefined')
    return;
  const cache = CacheContext.create(localStorage.getItem(cacheKey));
  cache.setFields(key, postFix, fields);
  localStorage.setItem(cacheKey, cache.toJson());
}

export function clearListFieldsToCache(key: string, postFix: string | undefined) {
  if (typeof window === 'undefined')
    return;
  const cache = CacheContext.create(localStorage.getItem(cacheKey));
  cache.clearFields(key, postFix);
  localStorage.setItem(cacheKey, cache.toJson());
}