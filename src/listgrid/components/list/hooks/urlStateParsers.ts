import { createParser } from '../../../urlState';
import { Direction, FilterItem, QueryConditionType } from '../../../form/SearchForm';

/**
 * URL page parameter parser
 * URL: 1-indexed (user-friendly)
 * Internal: 0-indexed
 */
export const parseAsPage = createParser({
  parse: (value: string) => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 1) return null;
    // Convert 1-indexed URL to 0-indexed internal
    return parsed - 1;
  },
  serialize: (value: number) => {
    // Convert 0-indexed internal to 1-indexed URL
    return String(value + 1);
  },
});

/**
 * URL pageSize parameter parser
 * Default: 20
 */
export const parseAsPageSize = createParser({
  parse: (value: string) => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 1 || parsed > 100) return null;
    return parsed;
  },
  serialize: (value: number) => String(value),
});

/**
 * URL sort parameter parser
 * Format: "field:direction" (e.g., "createdAt:DESC")
 */
export interface SortState {
  field: string;
  direction: Direction;
}

export const parseAsSort = createParser<SortState | null>({
  parse: (value: string) => {
    if (!value) return null;
    const [field, direction] = value.split(':');
    if (!field || !direction) return null;
    if (direction !== 'ASC' && direction !== 'DESC') return null;
    return { field, direction };
  },
  serialize: (value: SortState | null) => {
    if (!value) return '';
    return `${value.field}:${value.direction}`;
  },
});

/**
 * URL filters parameter parser
 * Human-readable format: "field:value,field:op:value"
 *
 * Examples:
 *   ?filters=status:ACTIVE,type:FRESHMAN
 *   ?filters=status:ACTIVE,name:like:홍길동,createdAt:gte:2024-01-01
 *
 * Format:
 *   - Simple equality: field:value
 *   - With operator: field:operator:value
 *   - Multiple filters separated by comma
 *   - Supported operators: eq, ne, like, gt, gte, lt, lte, in, isnull
 */
export interface FiltersState {
  AND?: FilterItem[];
  OR?: FilterItem[];
}

// Operator mapping from URL shorthand to internal QueryConditionType
// Covers all QueryConditionType values
const OPERATOR_MAP: Record<string, QueryConditionType> = {
  eq: 'EQUAL',
  ne: 'NOT_EQUAL',
  eqi: 'EQUAL_IGNORECASE',
  in: 'IN',
  nin: 'NOT_IN',
  null: 'NULL',
  notnull: 'NOT_NULL',
  like: 'LIKE',
  nlike: 'NOT_LIKE',
  start: 'START_WITH',
  nstart: 'NOT_START_WITH',
  end: 'END_WITH',
  nend: 'NOT_END_WITH',
  lt: 'LESS_THAN',
  lte: 'LESS_THAN_EQUAL',
  gt: 'GREATER',
  gte: 'GREATER_THAN_EQUAL',
  nlt: 'NOT_LESS_THAN',
  nlte: 'NOT_LESS_THAN_EQUAL',
  ngt: 'NOT_GREATER',
  ngte: 'NOT_GREATER_THAN_EQUAL',
  between: 'BETWEEN',
  nbetween: 'NOT_BETWEEN',
  ideq: 'ID_EQUAL',
};

// Reverse mapping for serialization
const REVERSE_OPERATOR_MAP: Record<string, string> = {
  EQUAL: 'eq',
  NOT_EQUAL: 'ne',
  EQUAL_IGNORECASE: 'eqi',
  IN: 'in',
  NOT_IN: 'nin',
  NULL: 'null',
  NOT_NULL: 'notnull',
  LIKE: 'like',
  NOT_LIKE: 'nlike',
  START_WITH: 'start',
  NOT_START_WITH: 'nstart',
  END_WITH: 'end',
  NOT_END_WITH: 'nend',
  LESS_THAN: 'lt',
  LESS_THAN_EQUAL: 'lte',
  GREATER: 'gt',
  GREATER_THAN_EQUAL: 'gte',
  NOT_LESS_THAN: 'nlt',
  NOT_LESS_THAN_EQUAL: 'nlte',
  NOT_GREATER: 'ngt',
  NOT_GREATER_THAN_EQUAL: 'ngte',
  BETWEEN: 'between',
  NOT_BETWEEN: 'nbetween',
  ID_EQUAL: 'ideq',
};

/**
 * Parse a single filter segment
 * Formats: "field:value" or "field:op:value"
 */
function parseFilterSegment(segment: string): FilterItem | null {
  if (!segment) return null;

  const parts = segment.split(':');
  if (parts.length < 2) return null;

  const name = parts[0];
  if (!name) return null;

  // Format: field:op:value (3 parts)
  if (parts.length >= 3) {
    const opKey = parts[1]!.toLowerCase();
    const queryConditionType = OPERATOR_MAP[opKey] as QueryConditionType | undefined;
    if (queryConditionType) {
      // Join remaining parts in case value contains ':'
      const rawValue = parts.slice(2).join(':');
      // For IN/NOT_IN operators, split by pipe to get array and use 'values' field
      if (
        (queryConditionType === 'IN' || queryConditionType === 'NOT_IN') &&
        rawValue.includes('|')
      ) {
        return { name, values: rawValue.split('|'), queryConditionType };
      }
      return { name, value: rawValue, queryConditionType };
    }
  }

  // Format: field:value (2 parts)
  const value = parts.slice(1).join(':');

  // If value contains pipe separator, treat as IN operator with multiple values
  if (value.includes('|')) {
    return { name, values: value.split('|'), queryConditionType: 'IN' };
  }

  return { name, value, queryConditionType: 'EQUAL' };
}

/**
 * Serialize a single filter to URL format
 */
function serializeFilterItem(filter: FilterItem): string {
  const { name, value, values, queryConditionType } = filter;

  // Handle array values (values field or array in value) - join with pipe separator
  let serializedValue: string;
  if (values && values.length > 0) {
    serializedValue = values.join('|');
  } else if (Array.isArray(value)) {
    serializedValue = value.join('|');
  } else {
    serializedValue = value ?? '';
  }

  // For EQUAL condition, use short format: field:value
  if (!queryConditionType || queryConditionType === 'EQUAL') {
    return `${name}:${serializedValue}`;
  }

  // For other conditions, use full format: field:op:value
  const op = REVERSE_OPERATOR_MAP[queryConditionType] ?? queryConditionType.toLowerCase();
  return `${name}:${op}:${serializedValue}`;
}

export const parseAsFilters = createParser<FiltersState | null>({
  parse: (value: string) => {
    if (!value) return null;

    try {
      // Split by comma and parse each segment
      const segments = value.split(',').filter((s) => s.trim());
      if (segments.length === 0) return null;

      const filters: FilterItem[] = [];
      for (const segment of segments) {
        const filter = parseFilterSegment(segment.trim());
        if (filter) {
          filters.push(filter);
        }
      }

      if (filters.length === 0) return null;

      // All filters go to AND by default
      return { AND: filters };
    } catch {
      return null;
    }
  },
  serialize: (value: FiltersState | null) => {
    if (!value) return '';

    try {
      const parts: string[] = [];

      // Serialize AND filters
      if (value.AND && value.AND.length > 0) {
        for (const filter of value.AND) {
          parts.push(serializeFilterItem(filter));
        }
      }

      // Note: OR filters are not commonly used in URL, but we can support them
      // by prefixing with 'or.' if needed in the future

      return parts.join(',');
    } catch {
      return '';
    }
  },
});

/**
 * URL quick search parameter parser
 * Simple string with URL encoding handled by nuqs
 */
export const parseAsQuickSearch = createParser<string | null>({
  parse: (value: string) => {
    if (!value || value.trim() === '') return null;
    return value;
  },
  serialize: (value: string | null) => value ?? '',
});

/**
 * Type definitions for URL state
 */
export interface ListGridUrlState {
  page: number | null;
  pageSize: number | null;
  q: string | null;
  sort: SortState | null;
  filters: FiltersState | null;
}

/**
 * Default URL state
 */
export const defaultUrlState: ListGridUrlState = {
  page: null,
  pageSize: null,
  q: null,
  sort: null,
  filters: null,
};

/**
 * Check if URL has any ListGrid params
 */
export function hasUrlParams(urlState: ListGridUrlState): boolean {
  return (
    urlState.page !== null ||
    urlState.pageSize !== null ||
    urlState.q !== null ||
    urlState.sort !== null ||
    urlState.filters !== null
  );
}
