import { describe, it, expect } from 'vitest';
import { AdjustmentTypes, getAdjustmentTypeLabel, type AdjustmentType } from './CommonType';

describe('CommonType', () => {
  describe('AdjustmentTypes', () => {
    it('exposes five well-known adjustment options', () => {
      expect(AdjustmentTypes.map((o) => o.value)).toEqual([
        'FIXED_PRICE',
        'ADD_AMOUNT',
        'ADD_PERCENT',
        'OFF_AMOUNT',
        'OFF_PERCENT',
      ]);
    });

    it('every option has a non-empty label', () => {
      for (const option of AdjustmentTypes) {
        expect(option.label).toBeTruthy();
        expect(typeof option.label).toBe('string');
      }
    });
  });

  describe('getAdjustmentTypeLabel', () => {
    it('returns label for known FIXED_PRICE', () => {
      expect(getAdjustmentTypeLabel('FIXED_PRICE')).toBe('고정 가격');
    });

    it('returns label for ADD_AMOUNT', () => {
      expect(getAdjustmentTypeLabel('ADD_AMOUNT')).toBe('금액 추가');
    });

    it('returns label for ADD_PERCENT', () => {
      expect(getAdjustmentTypeLabel('ADD_PERCENT')).toBe('비율 추가');
    });

    it('returns label for OFF_AMOUNT', () => {
      expect(getAdjustmentTypeLabel('OFF_AMOUNT')).toBe('금액 할인');
    });

    it('returns label for OFF_PERCENT', () => {
      expect(getAdjustmentTypeLabel('OFF_PERCENT')).toBe('비율 할인');
    });

    it('returns the input itself for an unknown value (fallback)', () => {
      // Cast an invalid value to exercise the else branch.
      const unknown = 'UNKNOWN' as AdjustmentType;
      expect(getAdjustmentTypeLabel(unknown)).toBe('UNKNOWN');
    });
  });
});
