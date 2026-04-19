import { describe, it, expect } from 'vitest';
import {
  getWindowPositionClassName,
  isAdditionalColorType,
  getAdditionalColorClass,
  getTextColorClass,
  getOppositeTextColorClass,
  getOrderedColorType,
  getBgColor,
  getColorSuffix,
  getMaxWidthClassName,
  getAlignClassName,
  getGutterValue,
  getResponsiveClasses,
  getShapeClassName,
  getSizeClassName,
  getColorClass,
} from './func';
import { ColorTypes } from './type';

describe('common/func', () => {
  describe('getWindowPositionClassName', () => {
    it('maps center to items-center + justify-center', () => {
      expect(getWindowPositionClassName('center')).toContain('items-center');
      expect(getWindowPositionClassName('center')).toContain('justify-center');
    });

    it('maps top-left to items-start + justify-start', () => {
      const out = getWindowPositionClassName('top-left');
      expect(out).toContain('items-start');
      expect(out).toContain('justify-start');
    });

    it('maps bottom-right to items-end + justify-end', () => {
      const out = getWindowPositionClassName('bottom-right');
      expect(out).toContain('items-end');
      expect(out).toContain('justify-end');
    });

    it('handles all defined positions without returning undefined', () => {
      const positions = [
        'center',
        'top',
        'top-left',
        'top-right',
        'top-center',
        'bottom',
        'bottom-left',
        'bottom-right',
        'center-left',
        'center-right',
      ] as const;
      for (const p of positions) {
        expect(typeof getWindowPositionClassName(p)).toBe('string');
        expect(getWindowPositionClassName(p).length).toBeGreaterThan(0);
      }
    });
  });

  describe('isAdditionalColorType', () => {
    it('returns true for known additional colors', () => {
      expect(isAdditionalColorType('red')).toBe(true);
      expect(isAdditionalColorType('blue')).toBe(true);
      expect(isAdditionalColorType('primary')).toBe(true);
    });

    it('returns false for unknown colors', () => {
      expect(isAdditionalColorType('banana')).toBe(false);
      expect(isAdditionalColorType('')).toBe(false);
    });
  });

  describe('getAdditionalColorClass', () => {
    it('returns bg-<color> for known color', () => {
      expect(getAdditionalColorClass('red')).toBe('bg-red');
      expect(getAdditionalColorClass('primary')).toBe('bg-primary');
      expect(getAdditionalColorClass('info')).toBe('bg-info');
    });

    it('returns "bg-white border" for white', () => {
      expect(getAdditionalColorClass('white')).toBe('bg-white border');
    });

    it.each([
      ['dark', 'bg-dark'],
      ['gray', 'bg-gray'],
      ['pink', 'bg-pink'],
      ['grape', 'bg-grape'],
      ['violet', 'bg-violet'],
      ['indigo', 'bg-indigo'],
      ['blue', 'bg-blue'],
      ['cyan', 'bg-cyan'],
      ['green', 'bg-green'],
      ['lime', 'bg-lime'],
      ['yellow', 'bg-yellow'],
      ['orange', 'bg-orange'],
      ['teal', 'bg-teal'],
      ['black', 'bg-black'],
      ['success', 'bg-success'],
      ['warning', 'bg-warning'],
      ['danger', 'bg-danger'],
      ['secondary', 'bg-secondary'],
    ])('maps %s to %s', (color, expected) => {
      expect(getAdditionalColorClass(color)).toBe(expected);
    });

    it('falls back to bg-primary for unknown color (normalized upstream)', () => {
      // Unknown color gets normalized to "primary" before the switch.
      expect(getAdditionalColorClass('banana')).toBe('bg-primary');
    });
  });

  describe('getTextColorClass', () => {
    it('returns text-<color> for known color', () => {
      expect(getTextColorClass('red')).toBe('text-red');
      expect(getTextColorClass('success')).toBe('text-success');
    });

    it.each([
      ['dark', 'text-dark'],
      ['gray', 'text-gray'],
      ['pink', 'text-pink'],
      ['grape', 'text-grape'],
      ['violet', 'text-violet'],
      ['indigo', 'text-indigo'],
      ['blue', 'text-blue'],
      ['cyan', 'text-cyan'],
      ['green', 'text-green'],
      ['lime', 'text-lime'],
      ['yellow', 'text-yellow'],
      ['orange', 'text-orange'],
      ['teal', 'text-teal'],
      ['black', 'text-black'],
      ['white', 'text-white'],
      ['primary', 'text-primary'],
      ['info', 'text-info'],
      ['warning', 'text-warning'],
      ['danger', 'text-danger'],
      ['secondary', 'text-secondary'],
    ])('maps %s to %s', (color, expected) => {
      expect(getTextColorClass(color)).toBe(expected);
    });

    it('normalizes unknown to primary', () => {
      expect(getTextColorClass('banana')).toBe('text-primary');
    });
  });

  describe('getOppositeTextColorClass', () => {
    it('returns text-white for most colors', () => {
      expect(getOppositeTextColorClass('red')).toBe('text-white');
      expect(getOppositeTextColorClass('primary')).toBe('text-white');
    });

    it('returns text-dark for white background', () => {
      expect(getOppositeTextColorClass('white')).toBe('text-dark');
    });

    it.each([
      'dark',
      'gray',
      'pink',
      'grape',
      'violet',
      'indigo',
      'blue',
      'cyan',
      'green',
      'lime',
      'yellow',
      'orange',
      'teal',
      'black',
      'info',
      'success',
      'warning',
      'danger',
      'secondary',
    ])('returns text-white for %s', (color) => {
      expect(getOppositeTextColorClass(color)).toBe('text-white');
    });

    it('normalizes unknown and returns text-white (primary)', () => {
      expect(getOppositeTextColorClass('banana')).toBe('text-white');
    });
  });

  describe('getOrderedColorType', () => {
    it('cycles through ColorTypes', () => {
      expect(getOrderedColorType(0)).toBe(ColorTypes[0]);
      expect(getOrderedColorType(ColorTypes.length)).toBe(ColorTypes[0]);
      expect(getOrderedColorType(1)).toBe(ColorTypes[1]);
    });
  });

  describe('getBgColor', () => {
    it('returns predefined for ColorType', () => {
      expect(getBgColor('primary')).toBe('bg-primary');
      expect(getBgColor('success')).toBe('bg-success');
    });

    it('delegates to getAdditionalColorClass for additional colors', () => {
      expect(getBgColor('red')).toBe('bg-red');
    });

    it('returns arbitrary hex as bg-[#xxx]', () => {
      expect(getBgColor('#ff0000')).toBe('bg-[#ff0000]');
      expect(getBgColor('aabbcc')).toBe('bg-[#aabbcc]');
    });
  });

  describe('getColorSuffix', () => {
    it('wraps hex in brackets', () => {
      expect(getColorSuffix('#123')).toBe('[#123]');
    });

    it('returns plain name otherwise', () => {
      expect(getColorSuffix('primary')).toBe('primary');
    });
  });

  describe('getMaxWidthClassName', () => {
    it.each([
      ['xs', 'max-w-xs'],
      ['sm', 'max-w-sm'],
      ['md', 'max-w-md'],
      ['lg', 'max-w-lg'],
      ['xl', 'max-w-xl'],
      ['2xl', 'max-w-2xl'],
      ['3xl', 'max-w-3xl'],
      ['4xl', 'max-w-4xl'],
      ['5xl', 'max-w-5xl'],
      ['6xl', 'max-w-6xl'],
      ['full', 'max-w-full'],
    ] as const)('maps %s to %s', (size, expected) => {
      expect(getMaxWidthClassName(size)).toBe(expected);
    });

    it('falls back to max-w-md for undefined', () => {
      expect(getMaxWidthClassName(undefined)).toBe('max-w-md');
    });
  });

  describe('getAlignClassName', () => {
    it('produces text-* classes without flex', () => {
      expect(getAlignClassName('left')).toBe('text-left');
      expect(getAlignClassName('center')).toBe('text-center');
      expect(getAlignClassName('right')).toBe('text-right');
    });

    it('produces justify-* classes with flex', () => {
      expect(getAlignClassName('left', true)).toBe('justify-start');
      expect(getAlignClassName('center', true)).toBe('justify-center');
      expect(getAlignClassName('right', true)).toBe('justify-end');
    });
  });

  describe('getGutterValue', () => {
    it('returns string form of number', () => {
      expect(getGutterValue(16)).toBe('16');
    });

    it('maps named sizes', () => {
      expect(getGutterValue('xs')).toBe('0.5rem');
      expect(getGutterValue('sm')).toBe('1rem');
      expect(getGutterValue('md')).toBe('1.5rem');
      expect(getGutterValue('lg')).toBe('2rem');
      expect(getGutterValue('xl')).toBe('3rem');
    });
  });

  describe('getResponsiveClasses', () => {
    it('produces single class for scalar input', () => {
      expect(getResponsiveClasses(4, 'p')).toBe('p-4');
    });

    it('produces responsive classes for object input', () => {
      const out = getResponsiveClasses({ base: 1, md: 2 }, 'p');
      expect(out).toContain('p-1');
      expect(out).toContain('md:p-2');
    });

    it('supports valueMap object', () => {
      const out = getResponsiveClasses('a', 'p', { a: 'zero' });
      expect(out).toBe('p-zero');
    });

    it('supports valueMap function', () => {
      const out = getResponsiveClasses(2, 'p', (v) => `x${v}`);
      expect(out).toBe('p-x2');
    });
  });

  describe('getShapeClassName', () => {
    it('maps each shape', () => {
      expect(getShapeClassName('pill')).toBe('rounded-full');
      expect(getShapeClassName('box')).toBe('rounded-none');
      expect(getShapeClassName('rounded')).toBe('rounded');
    });
  });

  describe('getSizeClassName', () => {
    it('maps each size', () => {
      expect(getSizeClassName('xs')).toContain('text-xs');
      expect(getSizeClassName('sm')).toContain('text-sm');
      expect(getSizeClassName('md')).toContain('text-sm');
      expect(getSizeClassName('lg')).toContain('text-base');
      expect(getSizeClassName('xl')).toContain('text-lg');
      expect(getSizeClassName('2xl')).toContain('text-xl');
      expect(getSizeClassName('5xl')).toContain('text-3xl');
      expect(getSizeClassName('full')).toBe('w-full h-full');
    });

    it('falls back for unspecified/default', () => {
      // Size not explicitly mapped (e.g. 3xl) falls through to default
      expect(getSizeClassName('3xl')).toContain('text-sm');
    });
  });

  describe('getColorClass', () => {
    it('filled variant uses background + opposite text', () => {
      const out = getColorClass('primary', 'filled');
      expect(out).toContain('bg-primary');
      expect(out).toContain('text-white');
    });

    it('outline variant uses border + text', () => {
      const out = getColorClass('primary', 'outline');
      expect(out).toContain('border-primary');
      expect(out).toContain('text-primary');
      expect(out).toContain('bg-transparent');
    });

    it('solid variant uses bg-<color> and text-white', () => {
      const out = getColorClass('primary', 'solid');
      expect(out).toContain('bg-primary');
      expect(out).toContain('text-white');
    });
  });
});
