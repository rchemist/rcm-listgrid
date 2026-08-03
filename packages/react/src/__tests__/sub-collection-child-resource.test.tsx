import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import {
  EntityForm,
  StringField,
  SubCollectionField,
  type BackendAdapter,
} from '@listgrid/schema-core';
import {
  createFormController,
  createFormStore,
  getBufferedSubCollectionRows,
} from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { AdapterProvider } from '../providers/adapter';
import { AuthProvider } from '../providers/auth';
import { FormStoreProvider } from '../providers/form-store';
import { UIProvider } from '../providers/ui';
import { registerDefaultRenderers } from '../registry/default-renderers';
import { SubCollectionRenderer } from '../registry/sub-collection-renderer';

registerDefaultRenderers();

function ChildForm(): EntityForm {
  return new EntityForm('DegreeForm', '/degree')
    .withTitle('Degree')
    .addFields({ items: [new StringField('name', 1).withLabel('Name')] });
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

function adapterWith(overrides: Partial<BackendAdapter> = {}): BackendAdapter {
  return {
    list: vi.fn(async () => ({ content: [], totalElements: 0, totalPages: 0 })),
    getOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    ...overrides,
  };
}

function renderField(form: EntityForm, adapter: BackendAdapter) {
  const field = form.getField('degrees') as SubCollectionField;
  const store = createFormStore(form);
  render(
    <UIProvider components={defaultUIComponents}>
      <AdapterProvider adapter={adapter}>
        <AuthProvider session={undefined}>
          <FormStoreProvider store={store}>
            <SubCollectionRenderer
              field={field}
              name="degrees"
              {...(form.getId() !== undefined ? { entityId: form.getId() } : {})}
            />
          </FormStoreProvider>
        </AuthProvider>
      </AdapterProvider>
    </UIProvider>,
  );
  return { field, store };
}

async function submitChild(name: string): Promise<void> {
  const dialog = screen.getByRole('dialog');
  fireEvent.change(within(dialog).getByLabelText('Name'), { target: { value: name } });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
}

describe('SubCollectionRenderer child-resource mode', () => {
  it('calls adapter create, update, and remove against the child resource for an existing parent', async () => {
    const create = vi.fn(async (_url: string, data: Record<string, unknown>) => ({
      id: 'd1',
      ...data,
    }));
    const update = vi.fn(async (_url: string, id: string, data: Record<string, unknown>) => ({
      id,
      ...data,
    }));
    const remove = vi.fn(async () => undefined);
    renderField(ParentForm('p1'), adapterWith({ create, update, remove }));

    fireEvent.click(screen.getByRole('button', { name: '추가' }));
    await submitChild('BA');
    expect(create).toHaveBeenCalledWith('/degree', { name: 'BA', professorId: 'p1' });
    expect(screen.getByText('BA')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '수정' }));
    await submitChild('MA');
    expect(update).toHaveBeenCalledWith('/degree', 'd1', {
      name: 'MA',
      professorId: 'p1',
    });
    expect(screen.getByText('MA')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '삭제' }));
    await waitFor(() => expect(remove).toHaveBeenCalledWith('/degree', ['d1'], undefined));
    expect(screen.queryByText('MA')).not.toBeInTheDocument();
  });

  it('buffers on a create screen, performs no early child IO, then flushes after parent save', async () => {
    const create = vi.fn(async (url: string, data: Record<string, unknown>) =>
      url === '/professor' ? { id: 'p1', ...data } : { id: 'd1', ...data },
    );
    const adapter = adapterWith({ create });
    const form = ParentForm();
    const { store } = renderField(form, adapter);
    store.getState().setValue('name', 'Kim');

    fireEvent.click(screen.getByRole('button', { name: '추가' }));
    await submitChild('PhD');
    expect(create).not.toHaveBeenCalled();
    expect(getBufferedSubCollectionRows(store, 'degrees')).toEqual([{ name: 'PhD' }]);

    const controller = createFormController({ entityForm: form, store, adapter });
    await expect(controller.save()).resolves.toMatchObject({ ok: true });
    expect(create).toHaveBeenNthCalledWith(1, '/professor', { name: 'Kim' });
    expect(create).toHaveBeenNthCalledWith(2, '/degree', {
      name: 'PhD',
      professorId: 'p1',
    });
    expect(getBufferedSubCollectionRows(store, 'degrees')).toEqual([]);
  });
});
