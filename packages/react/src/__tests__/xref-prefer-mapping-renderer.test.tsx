// XrefPreferMappingRenderer (EA-D2-1, ea-d2-xref-major-briefing.md §1/§3/§4/§5).
// JSDOM render test: display grid (IN derivation + synthetic `preferred`
// column via postFetch annotation), toolbar 삭제 (mapped-only removal +
// single-preferred promotion), and the isolated mini-form modal (its OWN
// ManyToOneField 'mapping' — itself opening a NESTED picker modal — +
// 'preferred' BooleanField), asserting the mappingId-flatten read on save.

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { BackendAdapter, PageResult, SearchForm } from '@listgrid/schema-core';
import {
  EntityForm,
  StringField,
  XrefPreferMappingField,
  type XrefPreferMappingValue,
} from '@listgrid/schema-core';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { UIProvider } from '../providers/ui';
import { AuthProvider } from '../providers/auth';
import { AdapterProvider } from '../providers/adapter';
import { FormStoreProvider } from '../providers/form-store';
import { registerDefaultRenderers } from '../registry/default-renderers';
import { XrefPreferMappingRenderer } from '../registry/xref-prefer-mapping-renderer';

// the mini-form modal renders its OWN 'mapping'/'preferred' fields through
// FieldRenderer -> the type-registry dispatch (getFieldRenderer), so this
// suite (unlike xref-mapping-renderer.test.tsx, which renders its target
// renderer directly with no nested FieldRenderer dispatch) needs the real
// manyToOne/boolean renderers registered.
registerDefaultRenderers();

function collegeForm(): EntityForm {
  return new EntityForm('CollegeEntityForm', '/college').addFields({
    items: [new StringField('name', 1).withLabel('Name')],
  });
}

const COLLEGES: Record<string, unknown>[] = [
  { id: '1', name: 'Engineering' },
  { id: '2', name: 'Medicine' },
  { id: '3', name: 'Law' },
];

function mockAdapter(): { adapter: BackendAdapter; listCalls: SearchForm[] } {
  const listCalls: SearchForm[] = [];
  const adapter: BackendAdapter = {
    list: vi.fn(async (_url: string, search: SearchForm): Promise<PageResult> => {
      listCalls.push(search);
      const idFilter = search.filters.AND.find((f) => f.name === 'id');
      let rows = COLLEGES;
      if (idFilter?.queryConditionType === 'IN') {
        const ids = idFilter.values as string[];
        rows = COLLEGES.filter((c) => ids.includes(c['id'] as string));
      } else if (idFilter?.queryConditionType === 'NOT_IN') {
        const ids = idFilter.values as string[];
        rows = COLLEGES.filter((c) => !ids.includes(c['id'] as string));
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

function studentFormWith(field: XrefPreferMappingField): EntityForm {
  return new EntityForm('StudentEntityForm', '/student').addFields({ items: [field] });
}

function renderRenderer(
  field: XrefPreferMappingField,
  adapter: BackendAdapter,
  initial?: XrefPreferMappingValue,
) {
  const entityForm = studentFormWith(field);
  const store = createFormStore(entityForm);
  if (initial) store.getState().setValue('college', initial);

  render(
    <UIProvider components={defaultUIComponents}>
      <AuthProvider session={undefined}>
        <AdapterProvider adapter={adapter}>
          <FormStoreProvider store={store}>
            <XrefPreferMappingRenderer field={field} name="college" />
          </FormStoreProvider>
        </AdapterProvider>
      </AuthProvider>
    </UIProvider>,
  );
  return { store };
}

describe('XrefPreferMappingRenderer — display grid (IN derivation + synthetic preferred column)', () => {
  it('empty mapped => empty-state text, NO adapter.list call', async () => {
    const field = new XrefPreferMappingField('college', 1, { entityForm: collegeForm }).withLabel(
      '단과대학',
    );
    const { adapter } = mockAdapter();
    renderRenderer(field, adapter);

    expect(await screen.findByText('매핑된 항목이 없습니다.')).toBeInTheDocument();
    await new Promise((r) => setTimeout(r, 0));
    expect(adapter.list).not.toHaveBeenCalled();
  });

  it('postFetch annotates rows with preferred from the current value', async () => {
    const field = new XrefPreferMappingField('college', 1, { entityForm: collegeForm }).withLabel(
      '단과대학',
    );
    const { adapter, listCalls } = mockAdapter();
    renderRenderer(field, adapter, {
      mapped: [
        { id: '1', preferred: true },
        { id: '2', preferred: false },
      ],
    });

    await screen.findByText('Engineering');
    expect(screen.getByText('Medicine')).toBeInTheDocument();
    expect(listCalls[0]?.toJSON().filters.AND).toEqual([
      { name: 'id', queryConditionType: 'IN', values: ['1', '2'] },
    ]);

    const checkboxes = screen.getAllByRole('checkbox', { name: '기본값' });
    expect(checkboxes).toHaveLength(2);
    expect(checkboxes[0]).toBeChecked(); // Engineering (id 1) — preferred: true
    expect(checkboxes[1]).not.toBeChecked(); // Medicine (id 2) — preferred: false
  });

  it('EC-R1: a rejecting config.filters() surfaces a visible error in the display grid instead of an infinite blank', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const filters = vi.fn(async () => {
      throw new Error('filters backend unavailable');
    });
    const field = new XrefPreferMappingField('college', 1, {
      entityForm: collegeForm,
      filters,
    }).withLabel('단과대학');
    const { adapter, listCalls } = mockAdapter();
    renderRenderer(field, adapter, { mapped: [{ id: '1', preferred: true }] });

    expect(await screen.findByRole('alert')).toHaveTextContent('목록 필터를 불러오지 못했습니다.');
    expect(listCalls).toHaveLength(0);
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('EC-R1: closing/re-emptying before a rejecting config.filters() resolves does not show the alert afterward', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    let reject!: (err: Error) => void;
    const filters = vi.fn(
      () =>
        new Promise<never>((_resolve, rej) => {
          reject = rej;
        }),
    );
    const field = new XrefPreferMappingField('college', 1, {
      entityForm: collegeForm,
      filters,
    }).withLabel('단과대학');
    const { adapter } = mockAdapter();
    const { store } = renderRenderer(field, adapter, { mapped: [{ id: '1', preferred: true }] });

    await waitFor(() => expect(filters).toHaveBeenCalledTimes(1));

    // clear mapped before the filters() promise settles — the display grid
    // unmounts (empty-state text) ahead of the stale resolution.
    store.getState().setValue('college', { mapped: [] });
    await screen.findByText('매핑된 항목이 없습니다.');

    reject(new Error('too late'));
    await new Promise((r) => setTimeout(r, 0));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it('toolbar 삭제 removes mapped-only (no deleted array) and promotes mapped[0] when the preferred row is removed', async () => {
    const field = new XrefPreferMappingField('college', 1, { entityForm: collegeForm }).withLabel(
      '단과대학',
    );
    const { adapter } = mockAdapter();
    const { store } = renderRenderer(field, adapter, {
      mapped: [
        { id: '1', preferred: true },
        { id: '2', preferred: false },
      ],
    });

    await screen.findByText('Engineering');
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select row 1' }));
    fireEvent.click(screen.getByRole('button', { name: '삭제' }));

    expect(store.getState().getValue('college')).toEqual({
      mapped: [{ id: '2', preferred: true }], // promoted — no preferred row would otherwise remain
    });
    await waitFor(() => expect(screen.queryByText('Engineering')).not.toBeInTheDocument());
  });
});

describe('XrefPreferMappingRenderer — mini-form modal (isolated createFormStore)', () => {
  it('불러오기 opens the mini-form; its own M2O picker NOT_IN(current ids); save reads mappingId + preferred and appends', async () => {
    const field = new XrefPreferMappingField('college', 1, { entityForm: collegeForm })
      .withLabel('단과대학')
      .withPreferredLabel('주전공');
    const { adapter, listCalls } = mockAdapter();
    const { store } = renderRenderer(field, adapter, { mapped: [{ id: '1', preferred: true }] });

    await screen.findByText('Engineering');
    fireEvent.click(screen.getByRole('button', { name: '불러오기' }));

    // mini-form's own ManyToOneField renderer — opens its OWN nested picker.
    fireEvent.click(await screen.findByRole('button', { name: '찾기' }));
    await screen.findByText('Medicine'); // wait for the picker's own async filter-resolve fetch to land

    const pickerCall = listCalls[listCalls.length - 1];
    expect(pickerCall?.toJSON().filters.AND).toEqual([
      { name: 'id', queryConditionType: 'NOT_IN', values: ['1'] },
    ]);

    fireEvent.click(screen.getByText('Medicine').closest('tr') as HTMLElement);

    // toggle the mini-form's own 'preferred' checkbox (labelled '주전공' —
    // config.preferredLabel threaded through the mini-form builder). Scoped
    // to the mini-form's dialog — the display grid's synthetic `preferred`
    // column ALSO carries the aria-label '주전공' (same preferredLabel).
    const miniFormDialog = within(screen.getByRole('dialog', { name: '단과대학 추가' }));
    fireEvent.click(miniFormDialog.getByLabelText('주전공'));

    fireEvent.click(miniFormDialog.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(store.getState().getValue('college')).toEqual({
        mapped: [
          { id: '1', preferred: true },
          { id: '2', preferred: true },
        ],
      }),
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
