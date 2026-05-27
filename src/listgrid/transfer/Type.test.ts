import { describe, it, expect } from 'vitest';
import { createFieldMap, DataField } from './Type';

describe('createFieldMap', () => {
  it('matches by field name', () => {
    const field = DataField.create({ name: 'studentNumber', label: '학번', type: 'text' });
    const map = createFieldMap(field);

    expect(map.has('studentNumber')).toBe(true);
    expect(map.get('studentNumber')).toBe(field);
  });

  it('matches by field label', () => {
    const field = DataField.create({ name: 'studentNumber', label: '학번', type: 'text' });
    const map = createFieldMap(field);

    expect(map.has('학번')).toBe(true);
    expect(map.get('학번')).toBe(field);
  });

  it('label match returns the same field as name match', () => {
    const field = DataField.create({ name: 'type', label: '구분', type: 'select' });
    const map = createFieldMap(field);

    expect(map.get('type')).toBe(map.get('구분'));
  });

  it('does not add duplicate key when name equals label', () => {
    const field = DataField.create({ name: '상태', label: '상태', type: 'text' });
    const map = createFieldMap(field);

    expect(map.size).toBe(1);
    expect(map.get('상태')).toBe(field);
  });

  it('existing bracket format still works — name key is primary', () => {
    const fields = [
      DataField.create({ name: 'id', label: '아이디', type: 'text' }),
      DataField.create({ name: 'status', label: '상태', type: 'select' }),
      DataField.create({ name: 'rejectMessage', label: '반려사유', type: 'text' }),
    ];
    const map = createFieldMap(...fields);

    // bracket format extracts field name → name match
    expect(map.get('id')?.getName()).toBe('id');
    expect(map.get('status')?.getName()).toBe('status');
    expect(map.get('rejectMessage')?.getName()).toBe('rejectMessage');

    // label also works
    expect(map.get('아이디')?.getName()).toBe('id');
    expect(map.get('상태')?.getName()).toBe('status');
    expect(map.get('반려사유')?.getName()).toBe('rejectMessage');
  });

  it('multiple fields — no cross-contamination', () => {
    const f1 = DataField.create({ name: 'a', label: 'A라벨', type: 'text' });
    const f2 = DataField.create({ name: 'b', label: 'B라벨', type: 'text' });
    const map = createFieldMap(f1, f2);

    expect(map.get('a')).toBe(f1);
    expect(map.get('A라벨')).toBe(f1);
    expect(map.get('b')).toBe(f2);
    expect(map.get('B라벨')).toBe(f2);
    expect(map.has('c')).toBe(false);
  });
});
