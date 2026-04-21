// // type script 4.9 버그로 인해 TSON 을 사용할 수 없다.
// import TSON from "typescript-json";

export function replacer(_key: string, value: unknown): unknown {
  if (value instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(value.entries()), // or with spread: value: [...value]
    };
  } else {
    return value;
  }
}

export function reviver(_key: string, value: unknown): unknown {
  if (typeof value === 'object' && value !== null) {
    const record = value as { dataType?: string; value?: Iterable<readonly [unknown, unknown]> };
    if (record.dataType === 'Map' && record.value) {
      return new Map(record.value);
    }
  }
  return value;
}

function mapReplacer(_key: string, value: unknown): unknown {
  if (value instanceof Map) {
    return Object.fromEntries(value);
  } else if (value instanceof Set) {
    return [...value];
    // of course you can separate cases to turn Maps into objects
  }
  return value;
}

export function stringify(obj: unknown, beautify?: boolean): string {
  // Circular reference를 처리하기 위한 WeakSet
  const seen = new WeakSet<object>();

  const circularSafeReplacer = (key: string, value: unknown): unknown => {
    // 먼저 mapReplacer 적용
    const mappedValue = mapReplacer(key, value);

    // 객체가 아니거나 null인 경우 그대로 반환
    if (typeof mappedValue !== 'object' || mappedValue === null) {
      return mappedValue;
    }

    // Circular reference 체크
    if (seen.has(mappedValue as object)) {
      return '[Circular Reference]';
    }
    seen.add(mappedValue as object);

    return mappedValue;
  };

  try {
    if (beautify) {
      return JSON.stringify(obj, circularSafeReplacer, 2);
    }
    return JSON.stringify(obj, circularSafeReplacer);
  } catch (error) {
    console.error('stringify error:', error);
    return '{}';
  }
}

const simpleStringify = (object: Record<string, unknown>): string => {
  for (const eachIdx in object) {
    if (object[eachIdx] instanceof Map) {
      object[eachIdx] = Array.from(object[eachIdx] as Map<unknown, unknown>);
      simpleStringify(object);
    } else if (typeof object[eachIdx] == 'object' && object[eachIdx] !== null) {
      simpleStringify(object[eachIdx] as Record<string, unknown>);
    }
  }
  return JSON.stringify(object);
};

// Re-export from `misc` — `parse<T = unknown>` is the canonical generic
// implementation. Prior duplicate definition was merged into `misc`.
// This re-export preserves existing `import { parse } from '../utils/jsonUtils'`
// paths for backward-compat.
export { parse } from '../misc';
