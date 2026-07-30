import { describe, expect, it } from 'vitest';
import {
  BooleanField,
  EntityForm,
  ManyToOneField,
  StringField,
  getCurrentValue,
  isBlank,
  isDirty,
  resetValue,
  type FieldEvalContext,
  type FieldFilterConfig,
  type FieldListConfig,
  type FieldValueSlice,
} from '../index';

// V0.1 transplant oracle (decision D5) — locks the declaration model + the
// charter-C4 dirty/blank/current micro-decisions transplanted from 0.3.x
// FormField, so V0.2+ (store) and V0.4 (E2E) can rely on them.

// A faithful mini-College (the walking-skeleton target): name/englishName
// (String, englishName required), dean (ManyToOne→Professor via a LAZY thunk —
// decision D1), active (Boolean, default true).
function ProfessorForm(): EntityForm {
  return new EntityForm('ProfessorEntityForm', '/professor').addFields({
    items: [new StringField('name', 1).withRequired(true).withLabel('교수명')],
  });
}
function CollegeForm(): EntityForm {
  return new EntityForm('CollegeEntityForm', '/college')
    .withCapabilities({ delete: false })
    .withTitle('menu.academic.university.college')
    .addFields({
      items: [
        new StringField('name', 100).withRequired(true).withLabel('명칭'),
        new StringField('englishName', 110).withRequired(true).withLabel('영문명'),
        new ManyToOneField('dean', 200, { entityForm: () => ProfessorForm(), labelField: 'name' })
          .withLabel('학장')
          .useListField(),
        new BooleanField('active', 900).withLabel('사용여부').withDefaultValue(true),
      ],
    });
}

// R9 — a trivial EntityForm subclass with no overrides, used to assert
// clone()'s this-preserving contract (spec Law L3: `clone(): this`).
class CustomEntityForm extends EntityForm {}

describe('EntityForm declaration (charter C1)', () => {
  it('captures fields ordered + form-level config', () => {
    const f = CollegeForm();
    expect(f.name).toBe('CollegeEntityForm');
    expect(f.url).toBe('/college');
    expect(f.getTitle()).toBe('menu.academic.university.college');
    expect(f.getCapabilities().delete).toBe(false);
    expect(f.getFields().map((x) => x.getName())).toEqual([
      'name',
      'englishName',
      'dean',
      'active',
    ]);
  });

  it('getRenderType: create until an id is set', () => {
    expect(CollegeForm().getRenderType()).toBe('create');
    expect(CollegeForm().clone().withId('7').getRenderType()).toBe('update');
  });

  it('clone is independent (declaration copy)', () => {
    const a = CollegeForm();
    const b = a.clone();
    expect(b.getField('name')).not.toBe(a.getField('name'));
    expect(b.getFields().length).toBe(a.getFields().length);
  });

  it('clone() is this-preserving — a subclass instance clones to the same subclass (spec Law L3, R9)', () => {
    const custom = new CustomEntityForm('CustomEntityForm', '/custom');
    const cloned = custom.clone();
    expect(cloned).toBeInstanceOf(CustomEntityForm);
  });
});

describe('EntityForm.withCapabilities/getCapabilities (spec §3.4, CAP-06/CAP-22)', () => {
  it('defaults to {} — no capability declared, every key undefined (= allowed)', () => {
    const f = new EntityForm('Widget', '/widget');
    expect(f.getCapabilities()).toEqual({});
  });

  it('withCapabilities({ delete: false }) — the honest withNeverDelete replacement', () => {
    const f = new EntityForm('Widget', '/widget').withCapabilities({ delete: false });
    expect(f.getCapabilities().delete).toBe(false);
  });

  it('multiple withCapabilities calls shallow-merge (withMeta §3.1 clobber-avoidance precedent)', () => {
    const f = new EntityForm('Widget', '/widget')
      .withCapabilities({ create: false })
      .withCapabilities({ update: false });
    expect(f.getCapabilities()).toEqual({ create: false, update: false });
  });

  it('clone copies capabilities independently — mutating the clone via a later withCapabilities call does not affect the original', () => {
    const a = new EntityForm('Widget', '/widget').withCapabilities({ delete: false });
    const b = a.clone().withCapabilities({ create: false });
    expect(a.getCapabilities()).toEqual({ delete: false });
    expect(b.getCapabilities()).toEqual({ delete: false, create: false });
  });
});

describe('EntityForm.withReadOnly/getReadOnly (spec §3.1/§6.1, CAP-27; W3-5)', () => {
  it('defaults to false — withReadOnly never called', () => {
    const f = new EntityForm('Widget', '/widget');
    expect(f.getReadOnly()).toBe(false);
  });

  it('withReadOnly() with no argument defaults to true', () => {
    const f = new EntityForm('Widget', '/widget').withReadOnly();
    expect(f.getReadOnly()).toBe(true);
  });

  it('withReadOnly(false) clears a previously-declared read-only', () => {
    const f = new EntityForm('Widget', '/widget').withReadOnly(true).withReadOnly(false);
    expect(f.getReadOnly()).toBe(false);
  });

  it('clone preserves formReadOnly', () => {
    const a = new EntityForm('Widget', '/widget').withReadOnly(true);
    const b = a.clone();
    expect(b.getReadOnly()).toBe(true);
  });
});

describe('EntityForm.addAction/getActions (spec §3.4, CAP-09; W3-3)', () => {
  it('defaults to [] — no action declared', () => {
    const f = new EntityForm('Widget', '/widget');
    expect(f.getActions()).toEqual([]);
  });

  it('getActions returns declared actions order-sorted regardless of registration order', () => {
    const f = new EntityForm('Widget', '/widget')
      .addAction({ id: 'z', label: 'Z', order: 5 })
      .addAction({ id: 'a', label: 'A', order: 1 })
      .addAction({ id: 'm', label: 'M', order: 3 });
    expect(f.getActions().map((a) => a.id)).toEqual(['a', 'm', 'z']);
  });

  it('order-less actions default to 0 (sort ahead of any positive order)', () => {
    const f = new EntityForm('Widget', '/widget')
      .addAction({ id: 'first', label: 'First' })
      .addAction({ id: 'second', label: 'Second', order: 10 });
    expect(f.getActions().map((a) => a.id)).toEqual(['first', 'second']);
  });

  it('clone independently copies actions — a later addAction on the original does not leak into the clone', () => {
    const a = new EntityForm('Widget', '/widget').addAction({ id: 'x', label: 'X' });
    const b = a.clone();
    a.addAction({ id: 'y', label: 'Y' });
    expect(a.getActions().map((act) => act.id)).toEqual(['x', 'y']);
    expect(b.getActions().map((act) => act.id)).toEqual(['x']);
  });

  it('clone independently copies actions — a later addAction on the CLONE does not leak into the original', () => {
    const a = new EntityForm('Widget', '/widget').addAction({ id: 'x', label: 'X' });
    const b = a.clone();
    b.addAction({ id: 'y', label: 'Y' });
    expect(a.getActions().map((act) => act.id)).toEqual(['x']);
    expect(b.getActions().map((act) => act.id)).toEqual(['x', 'y']);
  });
});

describe('ManyToOne lazy thunk (decision D1 — no eager recursion)', () => {
  it('resolves the target form only when called', () => {
    const dean = CollegeForm().getField('dean') as ManyToOneField;
    expect(dean.type).toBe('manyToOne');
    // useListField() now delegates to withList() (spec §5.1; W5-2 —
    // ManyToOne's own `showInList` boolean is gone, replaced by the shared
    // getListConfig() tri-state every field carries).
    expect(dean.getListConfig()).toEqual({});
    expect(dean.getIdField()).toBe('id');
    expect(dean.getLabelField()).toBe('name');
    const target = dean.getEntityForm();
    expect(target.name).toBe('ProfessorEntityForm');
  });
});

describe('ManyToOne.useListField() delegates to withList() (spec §5.1; W5-2)', () => {
  it('useListField() ⟹ getListConfig() truthy (an object, the withList() default {})', () => {
    const dean = new ManyToOneField('dean', 1, {
      entityForm: () => new EntityForm('ProfessorEntityForm', '/professor'),
    }).useListField();

    expect(dean.getListConfig()).toEqual({});
    expect(dean.getListConfig()).not.toBe(false);
    expect(dean.getListConfig()).not.toBeUndefined();
  });

  it('never calling useListField()/withList() leaves getListConfig() undeclared (undefined)', () => {
    const dean = new ManyToOneField('dean', 1, {
      entityForm: () => new EntityForm('ProfessorEntityForm', '/professor'),
    });

    expect(dean.getListConfig()).toBeUndefined();
  });
});

describe('getCurrentValue / isBlank (transplant of FormField:531-539,726-737)', () => {
  it('current wins when present; else default(create)/fetched(update)', () => {
    expect(getCurrentValue({ current: 'c', default: 'd', fetched: 'f' }, 'create')).toBe('c');
    expect(getCurrentValue({ default: 'd', fetched: 'f' }, 'create')).toBe('d');
    expect(getCurrentValue({ default: 'd', fetched: 'f' }, 'update')).toBe('f');
    expect(getCurrentValue(undefined)).toBeUndefined();
    // explicit current:undefined still wins (hasOwnProperty semantics)
    expect(getCurrentValue({ current: undefined, default: 'd' }, 'create')).toBeUndefined();
  });

  it('isBlank: empty array / undefined / null / empty string', () => {
    expect(isBlank({ current: '' })).toBe(true);
    expect(isBlank({ current: [] })).toBe(true);
    expect(isBlank({ current: null })).toBe(true);
    expect(isBlank({ current: 'x' })).toBe(false);
    expect(isBlank({ current: 0 })).toBe(false); // 0 is NOT blank
  });
});

describe('isDirty (transplant of FormField:542-590 — the C4 micro-decision)', () => {
  it('untouched (no fetched, no current) → not dirty', () => {
    expect(isDirty({ default: 'd' })).toBe(false);
  });
  it('create mode: current vs default, empty-normalized', () => {
    expect(isDirty({ current: 'd', default: 'd' })).toBe(false);
    expect(isDirty({ current: 'x', default: 'd' })).toBe(true);
    expect(isDirty({ current: '', default: undefined })).toBe(false); // '' normalizes to undefined
  });
  it('update mode: fetched vs current', () => {
    expect(isDirty({ fetched: 'f', current: 'f' })).toBe(false);
    expect(isDirty({ fetched: 'f', current: 'g' })).toBe(true);
  });
  it('arrays compare order-insensitively', () => {
    expect(isDirty({ fetched: ['a', 'b'], current: ['b', 'a'] })).toBe(false);
    expect(isDirty({ fetched: ['a'], current: ['a', 'b'] })).toBe(true);
  });

  describe('EA-B1: empty-array normalization (systemic array-field dirty fix)', () => {
    it('create mode: current=[] with no declared default -> not dirty (was a false positive pre-EA-B1)', () => {
      expect(isDirty({ current: [] })).toBe(false);
      expect(isDirty({ current: [], default: undefined })).toBe(false);
    });
    it('create mode: current=[] vs a non-empty declared default -> dirty', () => {
      expect(isDirty({ current: [], default: ['a'] })).toBe(true);
    });
    it('create mode: current with >=1 item and no default -> dirty', () => {
      expect(isDirty({ current: ['a'] })).toBe(true);
      expect(isDirty({ current: ['a', 'b'] })).toBe(true);
    });
    it('create mode: current=[] equals default=[] -> not dirty', () => {
      expect(isDirty({ current: [], default: [] })).toBe(false);
    });
    it('update mode is unaffected: fetched=["a"] then current back to ["a"] -> not dirty', () => {
      expect(isDirty({ fetched: ['a'], current: ['a'] })).toBe(false);
    });
    it('update mode: fetched=[] then current edited to a non-empty array -> dirty', () => {
      expect(isDirty({ fetched: [], current: ['a'] })).toBe(true);
    });
  });
});

describe('resetValue', () => {
  it('resets current to baseline + clears dirty/errors', () => {
    const slice: FieldValueSlice = {
      current: 'x',
      default: 'd',
      dirty: true,
      errors: [{ message: 'e' }],
    };
    const r = resetValue(slice, 'create');
    expect(r.current).toBe('d');
    expect(r.dirty).toBe(false);
    expect(r.errors).toBeUndefined();
  });
});

describe('FormField.validate (transplant of FormField:779-823)', () => {
  const ctx = (
    value: FieldValueSlice,
    renderType: 'create' | 'update' = 'create',
  ): FieldEvalContext => ({
    renderType,
    value,
  });

  it('required + blank → one failure with the Korean message', async () => {
    const eng = new StringField('englishName', 1).withRequired(true).withLabel('영문명');
    const res = await eng.validate(ctx({ current: '' }));
    expect(res).toHaveLength(1);
    expect(res[0].message).toContain('필수 값입니다');
    expect(res[0].message).toContain('영문명');
  });

  it('required + filled → valid', async () => {
    const eng = new StringField('englishName', 1).withRequired(true);
    expect(await eng.validate(ctx({ current: 'Engineering' }))).toEqual([]);
  });

  it('hidden/readonly fields skip validation', async () => {
    const eng = new StringField('x', 1).withRequired(true).withHidden(true);
    expect(await eng.validate(ctx({ current: '' }))).toEqual([]);
    const ro = new StringField('y', 1).withRequired(true).withReadOnly(true);
    expect(await ro.validate(ctx({ current: '' }))).toEqual([]);
  });

  it('conditional required resolves per renderType', async () => {
    const f = new StringField('z', 1).withRequired({ onCreate: true, onUpdate: false });
    expect(await f.validate(ctx({ current: '' }, 'create'))).toHaveLength(1);
    expect(await f.validate(ctx({ current: '' }, 'update'))).toEqual([]);
  });
});

describe('FormField.withList/getListConfig, withFilter/getFilterConfig (spec §5.1; W5-1 — pure declaration substrate, purely additive)', () => {
  it('withList(config) round-trips via getListConfig', () => {
    const config: FieldListConfig = {
      order: 2,
      label: 'X',
      align: 'right',
      width: 120,
      sortable: true,
    };
    const f = new StringField('x', 1).withList(config);
    expect(f.getListConfig()).toEqual(config);
  });

  it('withList() with no arg opts in with {} — distinct from never-called (undefined) and withList(false) (false)', () => {
    const notDeclared = new StringField('a', 1);
    expect(notDeclared.getListConfig()).toBeUndefined();

    const optedIn = new StringField('b', 1).withList();
    expect(optedIn.getListConfig()).toEqual({});

    const excluded = new StringField('c', 1).withList(false);
    expect(excluded.getListConfig()).toBe(false);
  });

  it('withFilter(config) round-trips via getFilterConfig', () => {
    const config: FieldFilterConfig = { operator: 'like', order: 1 };
    const f = new StringField('x', 1).withFilter(config);
    expect(f.getFilterConfig()).toEqual(config);
  });

  it('withFilter() with no arg opts in with {}; withFilter(false) explicitly excludes', () => {
    const notDeclared = new StringField('a', 1);
    expect(notDeclared.getFilterConfig()).toBeUndefined();

    const optedIn = new StringField('b', 1).withFilter();
    expect(optedIn.getFilterConfig()).toEqual({});

    const excluded = new StringField('c', 1).withFilter(false);
    expect(excluded.getFilterConfig()).toBe(false);
  });

  it('builders are chainable (return this)', () => {
    const f = new StringField('x', 1);
    expect(f.withList().withFilter()).toBe(f);
  });

  it('clone() preserves listConfig/filterConfig with no shared reference (L8 clone 무손실)', () => {
    const original = new StringField('x', 1)
      .withList({ order: 3, label: 'L', sortable: true })
      .withFilter({ operator: 'eq', order: 1 });
    const copy = original.clone();

    expect(copy.getListConfig()).toEqual(original.getListConfig());
    expect(copy.getListConfig()).not.toBe(original.getListConfig());
    expect(copy.getFilterConfig()).toEqual(original.getFilterConfig());
    expect(copy.getFilterConfig()).not.toBe(original.getFilterConfig());

    // mutating the clone's config object must not leak back into the original
    const cloneListConfig = copy.getListConfig();
    if (cloneListConfig && typeof cloneListConfig === 'object') {
      cloneListConfig.label = 'mutated';
    }
    expect((original.getListConfig() as FieldListConfig).label).toBe('L');
  });

  it('clone() preserves false (excluded) and undefined (undeclared) list/filter declarations', () => {
    const excluded = new StringField('x', 1).withList(false).withFilter(false);
    const clonedExcluded = excluded.clone();
    expect(clonedExcluded.getListConfig()).toBe(false);
    expect(clonedExcluded.getFilterConfig()).toBe(false);

    const undeclared = new StringField('y', 1);
    const clonedUndeclared = undeclared.clone();
    expect(clonedUndeclared.getListConfig()).toBeUndefined();
    expect(clonedUndeclared.getFilterConfig()).toBeUndefined();
  });
});

describe('FormField 0.3 view-preset compatibility sugars', () => {
  it('preserves add/modify/view-hidden/list-only semantics promised by MIGRATION §1', async () => {
    const addOnly = new StringField('add', 1).withAddOnly();
    expect(await addOnly.isReadOnly({ renderType: 'create' })).toBe(false);
    expect(await addOnly.isReadOnly({ renderType: 'update' })).toBe(true);

    const modifyOnly = new StringField('modify', 2).withModifyOnly();
    expect(await modifyOnly.isHidden({ renderType: 'create' })).toBe(true);
    expect(await modifyOnly.isHidden({ renderType: 'update' })).toBe(false);

    const viewHidden = new StringField('viewHidden', 3).withViewHidden();
    expect(await viewHidden.isReadOnly({ renderType: 'update' })).toBe(true);

    const listOnly = new StringField('listOnly', 4).withListOnly();
    expect(await listOnly.isHidden({ renderType: 'create' })).toBe(true);
    expect(await listOnly.isHidden({ renderType: 'update' })).toBe(true);
  });
});
