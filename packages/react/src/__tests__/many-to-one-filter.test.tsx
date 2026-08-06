// EA-D2-0 M2O filter channel (decision ②, briefing §3) — JSDOM render test.
// ManyToOneConfig.filter, when present, is resolved when the picker opens
// and the resolved FilterItem[] must reach the picker's list request as the
// SearchForm's AND filters. Asserted via the fake adapter's received
// SearchForm (the adapter is the only seam that sees the actual request).

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { BackendAdapter, FilterItem, PageResult, SearchForm } from '@listgrid/schema-core';
import { EntityForm, ManyToOneField, StringField } from '@listgrid/schema-core';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { UIProvider } from '../providers/ui';
import { AdapterProvider } from '../providers/adapter';
import { FormStoreProvider } from '../providers/form-store';
import { ManyToOneRenderer } from '../registry/many-to-one-renderer';

// withList() (spec §5.1; W5-2) — ManyToOneRenderer's picker is a plain
// ViewListGrid with no explicit `columns` prop, so it now derives from
// getListConfig(); `name` needs an explicit opt-in for the picker-row
// assertions ('Kim'/'Lee') below to render (the old magic fallback is
// abolished).
function professorForm(): EntityForm {
  return new EntityForm('ProfessorEntityForm', '/professor').addFields({
    items: [new StringField('name', 1).withRequired(true).withLabel('Name').withList()],
  });
}

const PROFESSORS: Record<string, unknown>[] = [
  { id: '1', name: 'Kim' },
  { id: '2', name: 'Lee' },
];

function mockAdapter(): { adapter: BackendAdapter; listCalls: SearchForm[] } {
  const listCalls: SearchForm[] = [];
  const adapter: BackendAdapter = {
    list: vi.fn(async (_url: string, search: SearchForm): Promise<PageResult> => {
      listCalls.push(search);
      return { content: PROFESSORS, totalElements: PROFESSORS.length, totalPages: 1 };
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

function collegeFormWithDean(config: { filter?: () => Promise<FilterItem[]> }): EntityForm {
  return new EntityForm('CollegeEntityForm', '/college').addFields({
    items: [
      new StringField('name', 100).withLabel('Name'),
      new ManyToOneField('dean', 200, {
        entityForm: () => professorForm(),
        ...(config.filter !== undefined ? { filter: config.filter } : {}),
      }).withLabel('Dean'),
    ],
  });
}

describe('ManyToOneRenderer — config.filter channel (EA-D2-0)', () => {
  it('resolves config.filter and carries it into the picker list request as AND filters', async () => {
    const filter = vi.fn(async () => [
      { name: 'assistant', value: true, queryConditionType: 'EQUAL' as const },
    ]);
    const entityForm = collegeFormWithDean({ filter });
    const { adapter, listCalls } = mockAdapter();
    const store = createFormStore(entityForm);
    const field = entityForm.getField('dean') as ManyToOneField;

    render(
      <UIProvider components={defaultUIComponents}>
        <AdapterProvider adapter={adapter}>
          <FormStoreProvider store={store}>
            <ManyToOneRenderer field={field} name="dean" />
          </FormStoreProvider>
        </AdapterProvider>
      </UIProvider>,
    );

    expect(screen.getByText('(선택 안 됨)')).toHaveClass('rcm-m2o-value');
    fireEvent.click(screen.getByRole('button', { name: '찾기' }));

    await waitFor(() => expect(filter).toHaveBeenCalledTimes(1));
    await screen.findByText('Kim');

    expect(listCalls).toHaveLength(1);
    expect(listCalls[0]?.toJSON().filters.AND).toEqual([
      { name: 'assistant', value: true, queryConditionType: 'EQUAL' },
    ]);
  });

  it('no filter configured => unchanged behavior (empty AND filters)', async () => {
    const entityForm = collegeFormWithDean({});
    const { adapter, listCalls } = mockAdapter();
    const store = createFormStore(entityForm);
    const field = entityForm.getField('dean') as ManyToOneField;

    render(
      <UIProvider components={defaultUIComponents}>
        <AdapterProvider adapter={adapter}>
          <FormStoreProvider store={store}>
            <ManyToOneRenderer field={field} name="dean" />
          </FormStoreProvider>
        </AdapterProvider>
      </UIProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: '찾기' }));
    await screen.findByText('Kim');

    expect(listCalls).toHaveLength(1);
    expect(listCalls[0]?.toJSON().filters.AND).toEqual([]);
  });

  it('EC-R1: a rejecting config.filter surfaces a visible error instead of an infinite blank picker', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const filter = vi.fn(async () => {
      throw new Error('filter backend unavailable');
    });
    const entityForm = collegeFormWithDean({ filter });
    const { adapter, listCalls } = mockAdapter();
    const store = createFormStore(entityForm);
    const field = entityForm.getField('dean') as ManyToOneField;

    render(
      <UIProvider components={defaultUIComponents}>
        <AdapterProvider adapter={adapter}>
          <FormStoreProvider store={store}>
            <ManyToOneRenderer field={field} name="dean" />
          </FormStoreProvider>
        </AdapterProvider>
      </UIProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: '찾기' }));

    await waitFor(() => expect(filter).toHaveBeenCalledTimes(1));
    expect(await screen.findByRole('alert')).toHaveTextContent('목록 필터를 불러오지 못했습니다.');
    // no fallback to the unfiltered picker store — no list request at all.
    expect(listCalls).toHaveLength(0);
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('EC-R1: closing before a rejecting config.filter resolves does not set error after unmount of the modal content', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    let reject!: (err: Error) => void;
    const filter = vi.fn(
      () =>
        new Promise<never>((_resolve, rej) => {
          reject = rej;
        }),
    );
    const entityForm = collegeFormWithDean({ filter });
    const { adapter } = mockAdapter();
    const store = createFormStore(entityForm);
    const field = entityForm.getField('dean') as ManyToOneField;

    render(
      <UIProvider components={defaultUIComponents}>
        <AdapterProvider adapter={adapter}>
          <FormStoreProvider store={store}>
            <ManyToOneRenderer field={field} name="dean" />
          </FormStoreProvider>
        </AdapterProvider>
      </UIProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: '찾기' }));
    await waitFor(() => expect(filter).toHaveBeenCalledTimes(1));

    // close the picker BEFORE the filter promise settles.
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    reject(new Error('too late'));
    await new Promise((r) => setTimeout(r, 0));

    // cancelled — the closed modal must not show the alert.
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });
});
