/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

import {isTrue} from "./BooleanUtil";

export function isNulls(value: any, other: any): boolean {
  if (value === undefined && other === undefined) {
    return true;
  }

  if (value === undefined) {
    if (other === null) {
      return true;
    } else if (other === '') {
      return true;
    }
  } else {
    if (other === undefined) {
      if (value === null) {
        return true;
      } else if (value === '') {
        return true;
      }
    }
  }
  return false;
}

export function isEquals(value: any, other: any): boolean {
  const isNull = isNulls(value, other);

  if (isNull) {
    return true;
  }
  if (value === other) {
    return true;
  }

  // plain object deep comparison
  if (typeof value === 'object' && typeof other === 'object' &&
      value !== null && other !== null &&
      !Array.isArray(value) && !Array.isArray(other)) {
    const keysA = Object.keys(value);
    const keysB = Object.keys(other);
    if (keysA.length !== keysB.length) return false;
    return keysA.every(key => keysB.includes(key) && isEquals(value[key], other[key]));
  }

  return false;
}

export function isEqualsIgnoreCase(value: string | null | undefined, other: string | null | undefined): boolean {
  const isNull = isNulls(value, other);

  if (isNull) {
    return true;
  }
  return value!.toLowerCase() === other!.toLowerCase();
}

export function isEqualCollection(value: any[], other: any[], ignoreOrder: boolean = false): boolean {
  if (value.length !== other.length) {
    return false;
  }

  if (isTrue(ignoreOrder)) {
    return value.every((v) => other.includes(v));
  }

  return value.every((v, i) => isEquals(v, other[i]));
}

export function isEmpty(collection: Map<any, any> | any[] | undefined): boolean {
  if (collection === undefined || collection === null) {
    return true;
  }
  if (collection instanceof Map) {
    return collection.size === 0;
  }
  return collection.length === 0;
}

export function isPositive(value?: number) : boolean {
  if (value === undefined || value === null) {
    return false;
  }
  return value > 0;
}

export function isNegative(value?: number) : boolean {
  if (value === undefined || value === null) {
    return false;
  }
  return value < 0;
}
