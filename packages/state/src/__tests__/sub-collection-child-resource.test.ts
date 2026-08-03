import { describe, expect, it, vi } from 'vitest';
import {
  EntityForm,
  SearchForm,
  StringField,
  SubCollectionField,
  type BackendAdapter,
  type PageResult,
} from '@listgrid/schema-core';
import { createFormController } from '../form-controller';
import { createFormStore } from '../form-store';
import { initializeFormStore } from '../initialize-form-store';
import {
  getBufferedSubCollectionRows,
  setBufferedSubCollectionRows,
} from '../sub-collection-buffer';

function ChildForm(): EntityForm {
  return new EntityForm('DegreeForm', '/degree').addFields({
    items: [new StringField('name', 1)],
  });
}

function ParentForm(id?: string): EntityForm {
  const form = new EntityForm('ProfessorForm', '/professor').addFields({
    items: [
      new StringField('name', 1),
      new SubCollectionField('degrees', 2, {
        childEntityForm: ChildForm,
        mappedBy: 'professorId',
        persistence: 'child-resource',
      }),
    ],
  });
  return id === undefined ? form : form.withId(id);
}

function fakeAdapter(overrides: Partial<BackendAdapter> = {}): BackendAdapter {
  return {
    list: vi.fn(async () => ({ content: [], totalElements: 0, totalPages: 0 })),
    getOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    ...overrides,
  };
}

describe('SubCollectionField child-resource persistence', () => {
  it('keeps embedded as the default, requires mappedBy for opt-in, and excludes only opt-in rows from parent payload', () => {
    const embedded = new SubCollectionField('embedded', 1, { childEntityForm: ChildForm });
    expect(embedded.getPersistence()).toBe('embedded');
    expect(embedded.exceptOnSave).not.toBe(true);
    expect(
      () =>
        new SubCollectionField('invalid', 2, {
          childEntityForm: ChildForm,
          persistence: 'child-resource',
        }),
    ).toThrow(/requires mappedBy/);

    const form = ParentForm();
    const store = createFormStore(form);
    store.getState().setValue('name', 'Kim');
    store.getState().setValue('degrees', [{ name: 'PhD' }]);
    expect(store.getState().toSaveData()).toEqual({ name: 'Kim' });
  });

  it('loads every child-resource page with the mappedBy relation filter and ignores an embedded parent array', async () => {
    const searches: SearchForm[] = [];
    const list = vi.fn(
      async (_url: string, search: SearchForm): Promise<PageResult<Record<string, unknown>>> => {
        searches.push(search);
        return search.page === 0
          ? { content: [{ id: 'd1', name: 'BA' }], totalElements: 2, totalPages: 2 }
          : { content: [{ id: 'd2', name: 'MA' }], totalElements: 2, totalPages: 2 };
      },
    );
    const adapter = fakeAdapter({
      getOne: vi.fn(async () => ({
        id: 'p1',
        name: 'Kim',
        degrees: [{ id: 'embedded', name: 'wrong source' }],
      })),
      list,
    });

    const { store, error } = await initializeFormStore({
      entityForm: ParentForm(),
      adapter,
      id: 'p1',
    });

    expect(error).toBeUndefined();
    expect(list).toHaveBeenCalledTimes(2);
    expect(list.mock.calls[0]?.[0]).toBe('/degree');
    expect(searches[0]?.toJSON().filters.AND).toEqual([{ name: 'professor.id', value: 'p1' }]);
    expect(store.getState().getValue('degrees')).toEqual([
      { id: 'd1', name: 'BA' },
      { id: 'd2', name: 'MA' },
    ]);
  });

  it('flushes create-screen rows after parent create and injects mappedBy into each child payload', async () => {
    const create = vi.fn(async (url: string, data: Record<string, unknown>) =>
      url === '/professor' ? { id: 'p1', ...data } : { id: 'd1', ...data },
    );
    const form = ParentForm();
    const store = createFormStore(form);
    const buffered = [{ name: 'PhD' }];
    store.getState().setValue('name', 'Kim');
    store.getState().setValue('degrees', buffered);
    setBufferedSubCollectionRows(store, 'degrees', buffered);
    const runtime = createFormController({
      entityForm: form,
      store,
      adapter: fakeAdapter({ create }),
    });
    await expect(runtime.save()).resolves.toEqual({
      ok: true,
      result: { id: 'p1', name: 'Kim' },
    });
    expect(create).toHaveBeenNthCalledWith(1, '/professor', { name: 'Kim' });
    expect(create).toHaveBeenNthCalledWith(2, '/degree', {
      name: 'PhD',
      professorId: 'p1',
    });
    expect(getBufferedSubCollectionRows(store, 'degrees')).toEqual([]);
  });

  it('surfaces partial failure, retains only failed rows, and retries via parent update without duplicate parent create', async () => {
    let failSecondChild = true;
    const create = vi.fn(async (url: string, data: Record<string, unknown>) => {
      if (url === '/professor') return { id: 'p1', name: data['name'] };
      if (data['name'] === 'MA' && failSecondChild) throw new Error('child unavailable');
      return { id: `saved-${String(data['name'])}`, ...data };
    });
    const update = vi.fn(async () => ({ id: 'p1', name: 'Kim' }));
    const form = ParentForm();
    const store = createFormStore(form);
    const buffered = [{ name: 'BA' }, { name: 'MA' }];
    store.getState().setValue('name', 'Kim');
    store.getState().setValue('degrees', buffered);
    setBufferedSubCollectionRows(store, 'degrees', buffered);
    const runtime = createFormController({
      entityForm: form,
      store,
      adapter: fakeAdapter({ create, update }),
    });

    const first = await runtime.save();
    expect(first).toMatchObject({ ok: false, reason: 'error' });
    expect(first.ok === false ? first.error?.message : '').toContain('부모(id=p1) 저장은 성공');
    expect(getBufferedSubCollectionRows(store, 'degrees')).toEqual([{ name: 'MA' }]);
    expect(store.getState().messages).toEqual([
      expect.objectContaining({
        key: 'subcollection-partial-save',
        severity: 'error',
        persistent: true,
      }),
    ]);

    failSecondChild = false;
    await expect(runtime.save()).resolves.toEqual({
      ok: true,
      result: { id: 'p1', name: 'Kim' },
    });
    expect(create.mock.calls.filter(([url]) => url === '/professor')).toHaveLength(1);
    expect(update).toHaveBeenCalledWith('/professor', 'p1', { name: 'Kim' });
    expect(getBufferedSubCollectionRows(store, 'degrees')).toEqual([]);
  });
});
