import { describe, expect, it } from 'vitest';
import { EntityForm, StringField } from '../index';

describe('EntityForm.withList compatibility seam', () => {
  it('opts in only named fields and ignores an unknown name', () => {
    const name = new StringField('name', 1);
    const status = new StringField('status', 2);
    const hidden = new StringField('hidden', 3);
    const form = new EntityForm('Example', '/examples').addFields({
      items: [name, status, hidden],
    });

    expect(form.withList('name', 'status', 'missing')).toBe(form);
    expect(name.getListConfig()).toEqual({});
    expect(status.getListConfig()).toEqual({});
    expect(hidden.getListConfig()).toBeUndefined();
  });
});
