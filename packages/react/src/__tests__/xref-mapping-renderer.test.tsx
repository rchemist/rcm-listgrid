// XrefMappingRenderer (EA-D2-1 — plain view only, ea-d2-xref-major-briefing.md
// §2/§3/§4). JSDOM render test through a real BackendAdapter fake, asserting
// the exact SearchForm each grid sends (display IN vs picker NOT_IN, both
// merged with config.filters), the no-fetch-when-empty posture, and the
// mapped/deleted value-wire transitions (add/multi-add/delete).

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { BackendAdapter, FilterItem, PageResult, SearchForm } from '@listgrid/schema-core';
import {
  EntityForm,
  StringField,
  XrefMappingField,
  type XrefMappingValue,
} from '@listgrid/schema-core';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { UIProvider } from '../providers/ui';
import { AdapterProvider } from '../providers/adapter';
import { FormStoreProvider } from '../providers/form-store';
import { XrefMappingRenderer } from '../registry/xref-mapping-renderer';

// withList() (spec §5.1; W5-2) — both the display AND picker grids here are
// plain ViewListGrids with no explicit `columns` prop, so they now derive
// from getListConfig(); `name` needs an explicit opt-in for the row-name
// assertions below to render (the old duck-typed-showInList magic fallback
// is abolished).
function professorForm(): EntityForm {
  return new EntityForm('ProfessorEntityForm', '/professor').addFields({
    items: [new StringField('name', 1).withLabel('Name').withList()],
  });
}

const PROFESSORS: Record<string, unknown>[] = [
  { id: '1', name: 'Kim' },
  { id: '2', name: 'Lee' },
  { id: '3', name: 'Park' },
];

function mockAdapter(): { adapter: BackendAdapter; listCalls: SearchForm[] } {
  const listCalls: SearchForm[] = [];
  const adapter: BackendAdapter = {
    list: vi.fn(async (_url: string, search: SearchForm): Promise<PageResult> => {
      listCalls.push(search);
      const idFilter = search.filters.AND.find((f) => f.name === 'id');
      let rows = PROFESSORS;
      if (idFilter?.queryConditionType === 'IN') {
        const ids = idFilter.values as string[];
        rows = PROFESSORS.filter((p) => ids.includes(p['id'] as string));
      } else if (idFilter?.queryConditionType === 'NOT_IN') {
        const ids = idFilter.values as string[];
        rows = PROFESSORS.filter((p) => !ids.includes(p['id'] as string));
      }
      return { content: rows, totalElements: rows.length, totalPages: 1 };
    }),
    getOne: vi.fn(async () => {
      throw new Error('not used in this test');
    }),
    create: vi.fn(async () => {
      throw new Error('not used in this test');
    }),
    update: vi.fn(async () => {
      throw new Error('not used in this test');
    }),
    remove: vi.fn(async () => {
      throw new Error('not used in this test');
    }),
  };
  return { adapter, listCalls };
}

function majorFormWith(field: XrefMappingField): EntityForm {
  return new EntityForm('MajorEntityForm', '/major').addFields({ items: [field] });
}

function renderRenderer(
  field: XrefMappingField,
  adapter: BackendAdapter,
  initial?: XrefMappingValue,
) {
  const entityForm = majorFormWith(field);
  const store = createFormStore(entityForm);
  if (initial) store.getState().setValue('professors', initial);

  render(
    <UIProvider components={defaultUIComponents}>
      <AdapterProvider adapter={adapter}>
        <FormStoreProvider store={store}>
          <XrefMappingRenderer field={field} name="professors" />
        </FormStoreProvider>
      </AdapterProvider>
    </UIProvider>,
  );
  return { store };
}

describe('XrefMappingRenderer — display grid (IN derivation)', () => {
  it('empty mapped => empty-state text, NO adapter.list call at all', async () => {
    const field = new XrefMappingField('professors', 1, { entityForm: professorForm });
    const { adapter } = mockAdapter();
    renderRenderer(field, adapter);

    expect(await screen.findByText('매핑된 항목이 없습니다.')).toBeInTheDocument();
    // give any accidental async fetch a tick to fire before asserting absence
    await new Promise((r) => setTimeout(r, 0));
    expect(adapter.list).not.toHaveBeenCalled();
  });

  it('mapped ids => IN query, shows only the mapped rows', async () => {
    const field = new XrefMappingField('professors', 1, { entityForm: professorForm });
    const { adapter, listCalls } = mockAdapter();
    renderRenderer(field, adapter, { mapped: ['1', '3'], deleted: [] });

    expect(await screen.findByText('Kim')).toBeInTheDocument();
    expect(screen.getByText('Park')).toBeInTheDocument();
    expect(screen.queryByText('Lee')).not.toBeInTheDocument();

    expect(listCalls[0]?.toJSON().filters.AND).toEqual([
      { name: 'id', queryConditionType: 'IN', values: ['1', '3'] },
    ]);
  });

  it('config.filters() is AND-ed into the display IN query too (not just the picker)', async () => {
    const filters = vi.fn(
      async (): Promise<FilterItem[]> => [
        { name: 'assistant', value: true, queryConditionType: 'EQUAL' },
      ],
    );
    const field = new XrefMappingField('professors', 1, { entityForm: professorForm, filters });
    const { adapter, listCalls } = mockAdapter();
    renderRenderer(field, adapter, { mapped: ['1'], deleted: [] });

    await screen.findByText('Kim');
    expect(listCalls[0]?.toJSON().filters.AND).toEqual([
      { name: 'id', queryConditionType: 'IN', values: ['1'] },
      { name: 'assistant', value: true, queryConditionType: 'EQUAL' },
    ]);
  });

  it('EC-R1: a rejecting config.filters() surfaces a visible error in the display grid instead of an infinite blank', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const filters = vi.fn(async (): Promise<FilterItem[]> => {
      throw new Error('filters backend unavailable');
    });
    const field = new XrefMappingField('professors', 1, { entityForm: professorForm, filters });
    const { adapter, listCalls } = mockAdapter();
    renderRenderer(field, adapter, { mapped: ['1'], deleted: [] });

    expect(await screen.findByRole('alert')).toHaveTextContent('목록 필터를 불러오지 못했습니다.');
    expect(listCalls).toHaveLength(0);
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('toolbar 삭제 moves a checked id mapped -> deleted', async () => {
    const field = new XrefMappingField('professors', 1, { entityForm: professorForm });
    const { adapter } = mockAdapter();
    const { store } = renderRenderer(field, adapter, { mapped: ['1', '3'], deleted: [] });

    await screen.findByText('Kim');
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select row 1' }));
    fireEvent.click(screen.getByRole('button', { name: '삭제' }));

    expect(store.getState().getValue('professors')).toEqual({ mapped: ['3'], deleted: ['1'] });
    // let the display store's mapped-id-set-changed rebuild (IN(['3'])) settle
    // inside act() before the test tears down.
    await waitFor(() => expect(screen.queryByText('Kim')).not.toBeInTheDocument());
  });
});

describe('XrefMappingRenderer — picker modal (NOT_IN derivation)', () => {
  it('opens on 선택, sends NOT_IN(mapped), single row click adds + closes', async () => {
    const field = new XrefMappingField('professors', 1, { entityForm: professorForm });
    const { adapter, listCalls } = mockAdapter();
    const { store } = renderRenderer(field, adapter, { mapped: ['1'], deleted: [] });

    await screen.findByText('Kim');
    fireEvent.click(screen.getByRole('button', { name: '선택' }));

    await screen.findByText('Lee');
    const pickerCall = listCalls[listCalls.length - 1];
    expect(pickerCall?.toJSON().filters.AND).toEqual([
      { name: 'id', queryConditionType: 'NOT_IN', values: ['1'] },
    ]);

    fireEvent.click(screen.getByText('Lee').closest('tr') as HTMLElement);

    await waitFor(() =>
      expect(store.getState().getValue('professors')).toEqual({ mapped: ['1', '2'], deleted: [] }),
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('excludeId is NOT_EQUAL-filtered into the picker query', async () => {
    const field = new XrefMappingField('professors', 1, {
      entityForm: professorForm,
      excludeId: '2',
    });
    const { adapter, listCalls } = mockAdapter();
    renderRenderer(field, adapter);

    fireEvent.click(screen.getByRole('button', { name: '선택' }));
    await screen.findByText('Kim');

    expect(listCalls[0]?.toJSON().filters.AND).toEqual([
      { name: 'id', queryConditionType: 'NOT_EQUAL', value: '2' },
    ]);
  });

  it('EC-R1: a rejecting config.filters() surfaces a visible error in the picker instead of an infinite blank', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const filters = vi.fn(async (): Promise<FilterItem[]> => {
      throw new Error('filters backend unavailable');
    });
    const field = new XrefMappingField('professors', 1, { entityForm: professorForm, filters });
    const { adapter, listCalls } = mockAdapter();
    renderRenderer(field, adapter);

    fireEvent.click(screen.getByRole('button', { name: '선택' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('목록 필터를 불러오지 못했습니다.');
    expect(listCalls).toHaveLength(0);
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('EC-R1: closing the picker before a rejecting config.filters() resolves does not show the alert afterward', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    let reject!: (err: Error) => void;
    const filters = vi.fn(
      () =>
        new Promise<FilterItem[]>((_resolve, rej) => {
          reject = rej;
        }),
    );
    const field = new XrefMappingField('professors', 1, { entityForm: professorForm, filters });
    const { adapter } = mockAdapter();
    renderRenderer(field, adapter);

    fireEvent.click(screen.getByRole('button', { name: '선택' }));
    await waitFor(() => expect(filters).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    reject(new Error('too late'));
    await new Promise((r) => setTimeout(r, 0));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it('selection + onConfirm ("선택 완료") multi-adds all checked ids and closes', async () => {
    const field = new XrefMappingField('professors', 1, { entityForm: professorForm });
    const { adapter } = mockAdapter();
    const { store } = renderRenderer(field, adapter);

    fireEvent.click(screen.getByRole('button', { name: '선택' }));
    await screen.findByText('Kim');

    fireEvent.click(screen.getByRole('checkbox', { name: 'Select row 1' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select row 2' }));
    fireEvent.click(screen.getByRole('button', { name: '선택 완료' }));

    await waitFor(() =>
      expect(store.getState().getValue('professors')).toEqual({ mapped: ['1', '2'], deleted: [] }),
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
