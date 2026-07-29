import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DatetimeFilter } from './DatetimeFilter';
import { fDate, getDefinedDates } from '../../../misc';
import type { EntityForm } from '../../../config/EntityForm';

vi.mock('../../../ui', () => ({
  FlatPickrDateField: () => <div data-testid="flatpickr-stub" />,
  SafePerfectScrollbar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('DatetimeFilter — preset buttons', () => {
  const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

  const presets: Array<{ label: string; type: Parameters<typeof getDefinedDates>[0] }> = [
    { label: '오늘', type: 'TODAY' },
    { label: '1주일', type: 'WEEK' },
    { label: '1개월', type: 'MONTH' },
    { label: '3개월', type: 'MONTH3' },
    { label: '6개월', type: 'MONTH6' },
    { label: '1년', type: 'YEAR' },
  ];

  it.each(presets)(
    "'$label' preset should emit a BETWEEN range of 'yyyy-MM-dd' strings, not Date objects",
    ({ label, type }) => {
      const onChange = vi.fn();
      render(
        <DatetimeFilter
          entityForm={{} as unknown as EntityForm<object>}
          name="createdAt"
          onChange={onChange}
        />,
      );

      // Buttons are rendered twice (mobile/desktop wrappers) — clicking either is fine
      fireEvent.click(screen.getAllByText(label)[0]!);

      expect(onChange).toHaveBeenCalledTimes(1);
      const [values, op] = onChange.mock.calls[0]!;

      expect(op).toBe('BETWEEN');
      expect(Array.isArray(values)).toBe(true);
      expect(values).toHaveLength(2);
      for (const value of values) {
        expect(typeof value).toBe('string');
        expect(value).toMatch(DATE_ONLY);
      }

      const [expectedStart, expectedEnd] = getDefinedDates(type);
      expect(values[0]).toBe(fDate(expectedStart!, 'yyyy-MM-dd'));
      expect(values[1]).toBe(fDate(expectedEnd!, 'yyyy-MM-dd'));
    },
  );
});
