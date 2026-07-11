import { describe, expect, it } from 'vitest';
import {
  BooleanField,
  EntityForm,
  FormField,
  InlineMapField,
  ManyToOneField,
  SearchForm,
  StringField,
  type BackendAdapter,
  type FieldEvalContext,
  type PageResult,
} from '@listgrid/schema-core';
import { createFormStore } from '../form-store';
import { createListStore } from '../list-store';

function ProfessorForm(): EntityForm {
  return new EntityForm('ProfessorEntityForm', '/professor').addFields({
    items: [new StringField('name', 1).withRequired(true)],
  });
}
function CollegeForm(): EntityForm {
  return new EntityForm('CollegeEntityForm', '/college').addFields({
    items: [
      new StringField('name', 100).withRequired(true).withLabel('명칭'),
      new StringField('englishName', 110).withRequired(true).withLabel('영문명'),
      new ManyToOneField('dean', 200, { entityForm: () => ProfessorForm() }).withLabel('학장'),
      new BooleanField('active', 900).withLabel('사용여부').withDefaultValue(true),
    ],
  });
}

describe('createFormStore (ADR-0002 value-slice store)', () => {
  it('seeds slices from field declaration defaults', () => {
    const store = createFormStore(CollegeForm());
    expect(store.getState().getValue('active')).toBe(true); // withDefaultValue(true)
    expect(store.getState().getValue('name')).toBeUndefined();
    expect(store.getState().renderType).toBe('create');
  });

  it('setValue updates only that field slice + recomputes dirty (D4)', () => {
    const store = createFormStore(CollegeForm());
    const before = store.getState().fields;
    store.getState().setValue('name', 'Engineering');
    const after = store.getState().fields;
    expect(store.getState().getValue('name')).toBe('Engineering');
    expect(after.name.dirty).toBe(true);
    expect(after.active).toBe(before.active); // untouched slice is referentially stable
  });

  it('validateAll: required-blank fails and writes per-field errors', async () => {
    const store = createFormStore(CollegeForm());
    const valid = await store.getState().validateAll();
    expect(valid).toBe(false);
    expect(store.getState().fields.name.errors?.[0].message).toContain('필수 값입니다');
    expect(store.getState().fields.englishName.errors?.length).toBe(1);
  });

  it('validateAll passes once required fields are filled', async () => {
    const store = createFormStore(CollegeForm());
    store.getState().setValue('name', '공학대학');
    store.getState().setValue('englishName', 'Engineering');
    expect(await store.getState().validateAll()).toBe(true);
  });

  it('hydrate fills fetched values → update mode', () => {
    const store = createFormStore(CollegeForm());
    store.getState().hydrate({ name: '공학대학', englishName: 'Engineering', active: false });
    expect(store.getState().renderType).toBe('update');
    expect(store.getState().getValue('name')).toBe('공학대학');
    expect(store.getState().getValue('active')).toBe(false);
    expect(store.getState().isDirty()).toBe(false); // fetched == current baseline
  });

  it('reset returns slices to baseline', () => {
    const store = createFormStore(CollegeForm());
    store.getState().setValue('name', 'x');
    expect(store.getState().isDirty()).toBe(true);
    store.getState().reset();
    expect(store.getState().isDirty()).toBe(false);
    expect(store.getState().getValue('name')).toBeUndefined();
  });

  it('toSaveData flattens ManyToOne → <name>Id and drops nothing else', () => {
    const store = createFormStore(CollegeForm());
    store.getState().setValue('name', '공학대학');
    store.getState().setValue('dean', { id: '42', name: '김교수' });
    const save = store.getState().toSaveData();
    expect(save.name).toBe('공학대학');
    expect(save.deanId).toBe('42');
    expect(save.dean).toBeUndefined();
  });

  // W2-4 (spec §5.2) — serializeValue seam: toSaveData no longer branches on
  // field.type === 'manyToOne'; it merges every field's serializeValue()
  // keyed contribution. These tests lock in the 3 NEW behaviors the seam
  // adds on top of the (unchanged) characterization above.
  describe('toSaveData serializeValue seam (W2-4, spec §5.2)', () => {
    class UppercaseNameField extends FormField<string> {
      constructor(name: string, order: number) {
        super(name, order, 'custom');
      }
      override serializeValue(value: string, _ctx: FieldEvalContext): Record<string, unknown> {
        return { [this.getName()]: typeof value === 'string' ? value.toUpperCase() : value };
      }
    }

    it("a custom field's serializeValue override is honored by toSaveData", () => {
      const form = new EntityForm('CustomFieldEntityForm', '/custom-field').addFields({
        items: [new UppercaseNameField('nickname', 1)],
      });
      const store = createFormStore(form);
      store.getState().setValue('nickname', 'kim');
      const save = store.getState().toSaveData();
      expect(save.nickname).toBe('KIM');
    });

    // Do-NOT (waves §W2-4): an object-valued field that is NOT manyToOne
    // (InlineMapField's value is itself a Record<string,string>) must serialize
    // under ITS OWN name, never mistaken for the M2O `<name>Id` flattening —
    // proving the base serializeValue's `{ [name]: value }` shape, not a
    // `field.type === 'manyToOne'` check, gates the flatten.
    it('an object-valued non-M2O field (InlineMapField) does NOT collide with M2O <name>Id flattening', () => {
      const form = new EntityForm('InlineMapEntityForm', '/inline-map').addFields({
        items: [new InlineMapField('attrs', 1)],
      });
      const store = createFormStore(form);
      store.getState().setValue('attrs', { color: 'red', size: 'L' });
      const save = store.getState().toSaveData();
      expect(save.attrs).toEqual({ color: 'red', size: 'L' });
      expect(save.attrsId).toBeUndefined();
    });

    class DottedKeyField extends FormField<string> {
      constructor(
        name: string,
        order: number,
        private readonly targetKey: string,
      ) {
        super(name, order, 'custom');
      }
      override serializeValue(value: string, _ctx: FieldEvalContext): Record<string, unknown> {
        return { [this.targetKey]: value };
      }
    }

    it('a dotted-key serializeValue contribution is nested into the save payload', () => {
      const form = new EntityForm('DottedEntityForm', '/dotted').addFields({
        items: [new DottedKeyField('state', 1, 'address.state')],
      });
      const store = createFormStore(form);
      store.getState().setValue('state', '서울');
      const save = store.getState().toSaveData();
      expect(save.address).toEqual({ state: '서울' });
      expect(save.state).toBeUndefined();
    });
  });

  // EF6 — submit-transform hook applied by toSaveData after the mechanical
  // dump (exceptOnSave drop, M2O flatten).
  describe('toSaveData submit-transform (EF6)', () => {
    it('no registered transform leaves the mechanical dump unchanged', () => {
      const store = createFormStore(CollegeForm());
      store.getState().setValue('name', '공학대학');
      store.getState().setValue('dean', { id: '42', name: '김교수' });
      const save = store.getState().toSaveData();
      expect(save).toEqual({
        name: '공학대학',
        englishName: undefined,
        deanId: '42',
        active: true,
      });
    });

    it('applies the registered transform AFTER the flatten — sees <name>Id keys', () => {
      const entityForm = CollegeForm().withSubmitTransform((data, ef) => {
        expect(data.deanId).toBe('42');
        expect(data.dean).toBeUndefined(); // already flattened by the time the transform runs
        expect(ef.name).toBe('CollegeEntityForm');
        return { ...data, active: data.active ? 'Y' : 'N' };
      });
      const store = createFormStore(entityForm);
      store.getState().setValue('dean', { id: '42', name: '김교수' });
      const save = store.getState().toSaveData();
      expect(save.deanId).toBe('42');
      expect(save.active).toBe('Y');
    });

    it('a throwing transform propagates (host bug) — not swallowed', () => {
      const entityForm = CollegeForm().withSubmitTransform(() => {
        throw new Error('boom');
      });
      const store = createFormStore(entityForm);
      expect(() => store.getState().toSaveData()).toThrow('boom');
    });
  });
});

// A tiny in-memory adapter for the list store tests.
function mockAdapter(rows: Record<string, unknown>[]): BackendAdapter {
  return {
    async list(_url, search): Promise<PageResult> {
      const { page, pageSize } = search.toJSON();
      const start = page * pageSize;
      return {
        content: rows.slice(start, start + pageSize),
        totalElements: rows.length,
        totalPages: Math.max(1, Math.ceil(rows.length / pageSize)),
      };
    },
    async getOne() {
      throw new Error('unused');
    },
    async create() {
      throw new Error('unused');
    },
    async update() {
      throw new Error('unused');
    },
    async remove() {},
  };
}

describe('createListStore (charter C9)', () => {
  const rows = Array.from({ length: 25 }, (_, i) => ({ id: String(i + 1), name: `c${i + 1}` }));

  it('fetch populates rows + totals (Spring-Page envelope)', async () => {
    const store = createListStore({
      url: '/college',
      adapter: mockAdapter(rows),
      initialSearch: SearchForm.create({ pageSize: 10 }),
    });
    await store.getState().fetch();
    expect(store.getState().rows).toHaveLength(10);
    expect(store.getState().totalElements).toBe(25);
    expect(store.getState().totalPages).toBe(3);
  });

  it('setPage refetches the next page', async () => {
    const store = createListStore({
      url: '/college',
      adapter: mockAdapter(rows),
      initialSearch: SearchForm.create({ pageSize: 10 }),
    });
    await store.getState().setPage(2);
    expect(store.getState().searchForm.page).toBe(2);
    expect(store.getState().rows).toHaveLength(5); // last page: 25 - 20
  });

  it('quickSearch updates the search form + resets to page 0', async () => {
    const store = createListStore({ url: '/college', adapter: mockAdapter(rows) });
    await store.getState().setPage(1);
    await store.getState().quickSearch(['name'], 'c1');
    expect(store.getState().searchForm.page).toBe(0);
    expect(store.getState().searchForm.toJSON().filters.OR).toHaveLength(1);
  });

  it('surfaces adapter errors', async () => {
    const failing: BackendAdapter = {
      ...mockAdapter([]),
      async list() {
        throw new Error('boom');
      },
    };
    const store = createListStore({ url: '/x', adapter: failing });
    await store.getState().fetch();
    expect(store.getState().error).toBe('boom');
    expect(store.getState().loading).toBe(false);
  });

  // EA-D2-0 postFetch (decision ①, §3) — the Priority-view reordering hook:
  // applied to page.content right before set(), on EVERY fetch.
  describe('postFetch (EA-D2-0)', () => {
    // reverse + annotate — proves both a reorder AND a row-shape change land
    // in `rows` (not just a pass-through no-op).
    function reverseAndAnnotate(pageRows: Record<string, unknown>[]): Record<string, unknown>[] {
      return [...pageRows].reverse().map((r) => ({ ...r, annotated: true }));
    }

    it('transforms rows on the initial fetch', async () => {
      const store = createListStore({
        url: '/college',
        adapter: mockAdapter(rows),
        initialSearch: SearchForm.create({ pageSize: 10 }),
        postFetch: reverseAndAnnotate,
      });
      await store.getState().fetch();
      const got = store.getState().rows;
      expect(got).toHaveLength(10);
      expect(got[0]).toEqual({ id: '10', name: 'c10', annotated: true });
      expect(got.every((r) => r['annotated'] === true)).toBe(true);
    });

    it('transforms rows again on a page-change refetch (not just the first load)', async () => {
      const store = createListStore({
        url: '/college',
        adapter: mockAdapter(rows),
        initialSearch: SearchForm.create({ pageSize: 10 }),
        postFetch: reverseAndAnnotate,
      });
      await store.getState().fetch();
      await store.getState().setPage(2);
      const got = store.getState().rows;
      expect(got).toHaveLength(5); // last page: 25 - 20
      expect(got[0]).toEqual({ id: '25', name: 'c25', annotated: true });
      expect(got.every((r) => r['annotated'] === true)).toBe(true);
    });

    it('a throwing postFetch propagates — not swallowed as an adapter error', async () => {
      const store = createListStore({
        url: '/college',
        adapter: mockAdapter(rows),
        postFetch: () => {
          throw new Error('postFetch boom');
        },
      });
      await expect(store.getState().fetch()).rejects.toThrow('postFetch boom');
      // NOT surfaced as the adapter-failure `error` state (that catch block
      // only wraps the adapter call, not postFetch).
      expect(store.getState().error).toBeUndefined();
    });
  });
});
