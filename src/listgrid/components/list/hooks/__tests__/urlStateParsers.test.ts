import { parseAsFilters } from '../urlStateParsers';

describe('urlStateParsers', () => {
  describe('parseAsFilters — BETWEEN round-trip', () => {
    it('should restore BETWEEN pipe-separated value as a two-element values array', () => {
      const result = parseAsFilters.parse('createdAt:between:2026-07-06|2027-12-29');

      expect(result).toEqual({
        AND: [
          {
            name: 'createdAt',
            values: ['2026-07-06', '2027-12-29'],
            queryConditionType: 'BETWEEN',
          },
        ],
      });
    });

    it('should restore NOT_BETWEEN pipe-separated value as a values array', () => {
      const result = parseAsFilters.parse('amount:nbetween:10|20');

      expect(result).toEqual({
        AND: [
          {
            name: 'amount',
            values: ['10', '20'],
            queryConditionType: 'NOT_BETWEEN',
          },
        ],
      });
    });

    it('should keep a BETWEEN value without pipe as a single value', () => {
      const result = parseAsFilters.parse('createdAt:between:2026-07-06');

      expect(result).toEqual({
        AND: [
          {
            name: 'createdAt',
            value: '2026-07-06',
            queryConditionType: 'BETWEEN',
          },
        ],
      });
    });

    it('should survive a serialize → parse round-trip for BETWEEN', () => {
      const filters = {
        AND: [
          {
            name: 'createdAt',
            values: ['2026-07-06', '2027-12-29'],
            queryConditionType: 'BETWEEN' as const,
          },
        ],
      };

      const serialized = parseAsFilters.serialize(filters);
      expect(serialized).toBe('createdAt:between:2026-07-06|2027-12-29');

      expect(parseAsFilters.parse(serialized)).toEqual(filters);
    });

    it('should keep IN pipe-splitting behavior unchanged', () => {
      const result = parseAsFilters.parse('status:in:ACTIVE|CLOSED');

      expect(result).toEqual({
        AND: [
          {
            name: 'status',
            values: ['ACTIVE', 'CLOSED'],
            queryConditionType: 'IN',
          },
        ],
      });
    });
  });
});
