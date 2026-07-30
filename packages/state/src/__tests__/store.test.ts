import { describe, expect, it, vi } from 'vitest';
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

  // W3-5 (spec §3.1/§6.1, CAP-27) — createFormStore seeds formReadOnly from
  // entityForm.getReadOnly() at build time.
  it('seeds formReadOnly false when the form never declared withReadOnly', () => {
    const store = createFormStore(CollegeForm());
    expect(store.getState().formReadOnly).toBe(false);
  });

  it('seeds formReadOnly true when the form declared withReadOnly(true)', () => {
    const store = createFormStore(CollegeForm().withReadOnly(true));
    expect(store.getState().formReadOnly).toBe(true);
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

    it('passes EntityForm identity to custom field serialization without an id field', () => {
      class EntityAwareField extends FormField<string> {
        constructor() {
          super('nickname', 1, 'custom');
        }
        override serializeValue(value: string, ctx: FieldEvalContext): Record<string, unknown> {
          return { nickname: value, ownerId: ctx.entityId };
        }
      }
      const form = new EntityForm('EntityAwareForm', '/entity-aware')
        .withId('entity-42')
        .addFields({ items: [new EntityAwareField()] });
      const store = createFormStore(form);
      store.getState().setValue('nickname', 'kim');

      expect(store.getState().toSaveData()).toEqual({
        nickname: 'kim',
        ownerId: 'entity-42',
      });
      expect(form.getFields().some((field) => field.getName() === 'id')).toBe(false);
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

  // EF6's "submit-transform hook applied by toSaveData" describe block
  // (3 tests: unchanged-dump / applies-after-flatten / throwing-propagates)
  // lived here — REMOVED (spec §4.2: EF6 withSubmitTransform is gone;
  // toSaveData no longer applies any transform, so "no registered transform
  // leaves the dump unchanged" is now simply always true, already covered by
  // the characterization test above and the W2-4 serializeValue-seam block).
  // The equivalent semantics moved to the controller layer and are covered
  // in @listgrid/state/__tests__/form-controller.test.ts:
  //   - "applies the registered transform AFTER the flatten" -> an
  //     onBeforeSave handler mutating ctx.data via setData (that file's
  //     "onBeforeSave setData mutates the payload the adapter receives").
  //   - "a throwing transform propagates (host bug) — not swallowed" -> spec
  //     §4.2 REVERSES this for onBeforeSave: a throwing handler is now
  //     logged + SKIPPED, NOT propagated (that file's "a throwing
  //     onBeforeSave handler is logged + SKIPPED, not propagated").
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

  // W2-6 (spec §4.1/§4.2) — onBeforeListFetch/onAfterListFetch, dispatched by
  // fetch() itself. setSearchForm is the REAL injection path (spec §4.1):
  // fetch() sends the adapter the LAST setSearchForm-set instance. setRows
  // mirrors that for the fetched rows, ahead of the (unrelated, pre-existing)
  // postFetch pass.
  describe('onBeforeListFetch / onAfterListFetch (spec §4.1/§4.2, W2-6)', () => {
    function CollegeListForm(): EntityForm {
      return new EntityForm('CollegeListEntityForm', '/college');
    }

    it("onBeforeListFetch's setSearchForm(filter 추가) reaches the adapter.list body", async () => {
      let seenSearch: SearchForm | undefined;
      const adapter: BackendAdapter = {
        ...mockAdapter(rows),
        async list(url, search) {
          seenSearch = search;
          return mockAdapter(rows).list(url, search);
        },
      };
      const entityForm = CollegeListForm().onBeforeListFetch((ctx) => {
        ctx.setSearchForm(ctx.searchForm.addAndFilter({ name: 'active', value: true }));
      });
      const store = createListStore({
        url: '/college',
        adapter,
        entityForm,
        initialSearch: SearchForm.create({ pageSize: 10 }),
      });

      await store.getState().fetch();

      expect(seenSearch?.toJSON().filters.AND).toContainEqual({ name: 'active', value: true });
    });

    it("onAfterListFetch's setRows is reflected in the store's rows", async () => {
      const entityForm = CollegeListForm().onAfterListFetch((ctx) => {
        ctx.setRows(ctx.rows.map((r) => ({ ...(r as Record<string, unknown>), tagged: true })));
      });
      const store = createListStore({
        url: '/college',
        adapter: mockAdapter(rows),
        entityForm,
        initialSearch: SearchForm.create({ pageSize: 10 }),
      });

      await store.getState().fetch();

      const got = store.getState().rows;
      expect(got).toHaveLength(10);
      expect(got.every((r) => (r as Record<string, unknown>)['tagged'] === true)).toBe(true);
    });

    it('a filter injected via onBeforeListFetch is per-fetch, not persisted onto the store searchForm', async () => {
      const entityForm = CollegeListForm().onBeforeListFetch((ctx) => {
        ctx.setSearchForm(ctx.searchForm.addAndFilter({ name: 'active', value: true }));
      });
      const store = createListStore({
        url: '/college',
        adapter: mockAdapter(rows),
        entityForm,
        initialSearch: SearchForm.create({ pageSize: 10 }),
      });

      await store.getState().fetch();

      // SearchForm immutability (Do-NOT): the injected filter never lands on
      // the store's own searchForm — addAndFilter returned a NEW instance,
      // and fetch() never set() it back.
      expect(store.getState().searchForm.toJSON().filters.AND).toHaveLength(0);
    });

    it('a throwing onBeforeListFetch handler is logged + skipped — fetch still completes', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const entityForm = CollegeListForm().onBeforeListFetch(() => {
        throw new Error('hook boom');
      });
      const store = createListStore({
        url: '/college',
        adapter: mockAdapter(rows),
        entityForm,
        initialSearch: SearchForm.create({ pageSize: 10 }),
      });

      await store.getState().fetch();

      expect(store.getState().error).toBeUndefined();
      expect(store.getState().rows).toHaveLength(10);
      expect(consoleError).toHaveBeenCalledWith(
        expect.stringContaining('onBeforeListFetch handler threw'),
        expect.any(Error),
      );
      consoleError.mockRestore();
    });

    it('a throwing onAfterListFetch handler is logged + skipped — fetch still completes', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const entityForm = CollegeListForm().onAfterListFetch(() => {
        throw new Error('hook boom');
      });
      const store = createListStore({
        url: '/college',
        adapter: mockAdapter(rows),
        entityForm,
        initialSearch: SearchForm.create({ pageSize: 10 }),
      });

      await store.getState().fetch();

      expect(store.getState().error).toBeUndefined();
      expect(store.getState().rows).toHaveLength(10);
      expect(consoleError).toHaveBeenCalledWith(
        expect.stringContaining('onAfterListFetch handler threw'),
        expect.any(Error),
      );
      consoleError.mockRestore();
    });
  });
});
