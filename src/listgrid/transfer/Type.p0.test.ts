import { describe, it, expect } from 'vitest';
import { DataField } from './Type';
import { DatetimeField } from '../components/fields/DatetimeField';

describe('P0-2 regression: DatetimeField registers as datetime type', () => {
  it('DatetimeField instances report type "datetime" (not "date")', () => {
    const field = new DatetimeField('meetingTime', 1);
    expect(field.type).toBe('datetime');
  });

  it('datetime DataField export -> import round trip preserves the time component', async () => {
    const datetimeField = DataField.create({ name: 'meetingTime', label: '미팅시간', type: 'datetime' });
    const original = new Date(2024, 0, 15, 15, 30);

    const exported = await datetimeField.getValueOnExport([original]);
    expect(exported).toContain('3:30');

    const imported = await datetimeField.getValueOnImport(exported);
    expect(imported).toContain('3:30');
  });

  it('contrast: a "date" DataField drops the time component on the same value', async () => {
    const dateField = DataField.create({ name: 'meetingDate', label: '미팅일자', type: 'date' });
    const original = new Date(2024, 0, 15, 15, 30);

    const exported = await dateField.getValueOnExport([original]);
    expect(exported).not.toContain('3:30');
  });
});
