// InlineMapField renderer — JSDOM integration test (EA-D — single delegate,
// conductor-settled pendingRef redesign). Same harness shape as
// file-field.test.tsx / multi-select-field.test.tsx: real EntityForm +
// createFormStore + the full provider stack, `registerDefaultRenderers()`
// (this task DID touch default-renderers.tsx — "you do it this time",
// unlike the earlier fan-out tasks that registered locally to avoid the
// shared file).
//
// Covers: fixed-keys vs free mode, the #1289 regression pin (required
// works via generic isBlank with NO override), the 3 resultType
// conversions, and the Map-resultType round-trip through
// toSaveData()/hydrate() that justified narrowing it to Record on write
// (inline-map-renderer.tsx doc comment).

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { EntityForm, InlineMapField } from '@listgrid/schema-core';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { FormStoreProvider } from '../providers/form-store';
import { registerDefaultRenderers } from '../registry/default-renderers';
import { ViewEntityForm } from '../components/ViewEntityForm';

registerDefaultRenderers();

function inlineMapForm(field: InlineMapField): EntityForm {
  return new EntityForm('ProfileEntityForm', '/profiles').addFields({ items: [field] });
}

function renderForm(field: InlineMapField, onSave = vi.fn()) {
  const entityForm = inlineMapForm(field);
  const store = createFormStore(entityForm);
  render(
    <UIProvider components={defaultUIComponents}>
      <AuthProvider session={undefined}>
        <FormStoreProvider store={store}>
          <ViewEntityForm entityForm={entityForm} store={store} onSave={onSave} />
        </FormStoreProvider>
      </AuthProvider>
    </UIProvider>,
  );
  return { store };
}

function fieldWrapper(name = 'extra'): HTMLElement {
  const wrapper = document.querySelector(`[data-field-name="${name}"]`);
  if (!wrapper) throw new Error(`${name} field wrapper not found`);
  return wrapper as HTMLElement;
}

describe('InlineMapFieldRenderer — fixed-keys mode (config.keys non-empty)', () => {
  it('renders one row per declared key, value-only editing', async () => {
    const field = new InlineMapField('extra', 100).withLabel('추가정보').withKeys([
      { key: 'phone', label: 'Phone' },
      { key: 'fax', label: 'Fax' },
    ]);
    renderForm(field);
    await screen.findByText('추가정보');
    const group = within(fieldWrapper());
    expect(group.getByText('Phone')).toBeInTheDocument();
    expect(group.getByText('Fax')).toBeInTheDocument();
  });

  it('editing a value writes a Record keyed by the declared key', async () => {
    const field = new InlineMapField('extra', 100).withLabel('추가정보').withKeys([
      { key: 'phone', label: 'Phone' },
      { key: 'fax', label: 'Fax' },
    ]);
    const { store } = renderForm(field);
    await screen.findByText('추가정보');
    const group = within(fieldWrapper());
    fireEvent.change(group.getByLabelText('Value 1'), { target: { value: '010-1234' } });
    await waitFor(() => expect(store.getState().getValue('extra')).toEqual({ phone: '010-1234' }));
  });

  it('a per-key `required` flag has no removal affordance to gate — fixed-keys mode never renders one', async () => {
    const field = new InlineMapField('extra', 100)
      .withLabel('추가정보')
      .withKeys([{ key: 'phone', label: 'Phone', required: true }]);
    renderForm(field);
    await screen.findByText('추가정보');
    const group = within(fieldWrapper());
    expect(group.queryByRole('button', { name: /add/i })).not.toBeInTheDocument();
    expect(group.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument();
  });
});

describe('InlineMapFieldRenderer — free mode (no config.keys)', () => {
  it('add a row, type key+value, writes the accumulated Record to the store', async () => {
    const field = new InlineMapField('extra', 100).withLabel('추가정보');
    const { store } = renderForm(field);
    await screen.findByText('추가정보');
    const group = within(fieldWrapper());

    fireEvent.click(group.getByRole('button', { name: 'Add' }));
    fireEvent.change(group.getByLabelText('Key 1'), { target: { value: 'phone' } });
    fireEvent.change(group.getByLabelText('Value 1'), { target: { value: '010' } });

    await waitFor(() => expect(store.getState().getValue('extra')).toEqual({ phone: '010' }));
  });

  it('removing the only row writes undefined (empty Record → undefined, so generic isBlank sees it)', async () => {
    const field = new InlineMapField('extra', 100)
      .withLabel('추가정보')
      .withDefaultValue({ phone: '010' });
    const { store } = renderForm(field);
    await screen.findByText('추가정보');
    const group = within(fieldWrapper());
    expect(store.getState().getValue('extra')).toEqual({ phone: '010' });

    fireEvent.click(group.getByRole('button', { name: 'Remove row 1' }));
    await waitFor(() => expect(store.getState().getValue('extra')).toBeUndefined());
  });

  it('respects a declared limit.max — Add beyond the ceiling is rejected', async () => {
    const field = new InlineMapField('extra', 100)
      .withLabel('추가정보')
      .withLimit({ max: 1 })
      .withDefaultValue({ a: '1' });
    renderForm(field);
    await screen.findByText('추가정보');
    const group = within(fieldWrapper());
    fireEvent.click(group.getByRole('button', { name: 'Add' }));
    expect(group.getByRole('alert')).toHaveTextContent('최대 1개');
  });
});

describe('InlineMapFieldRenderer — required works via generic isBlank (0.3.x issue #1289 regression pin)', () => {
  it('required + never touched → Save blocked with the required message', async () => {
    const onSave = vi.fn();
    const field = new InlineMapField('extra', 100).withLabel('추가정보').withRequired(true);
    renderForm(field, onSave);
    await screen.findByText('추가정보');

    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(await screen.findByText(/필수 값입니다/)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('required + a row typed in → Save proceeds (no pendingRef needed — store IS the value)', async () => {
    const onSave = vi.fn();
    const field = new InlineMapField('extra', 100).withLabel('추가정보').withRequired(true);
    renderForm(field, onSave);
    await screen.findByText('추가정보');
    const group = within(fieldWrapper());

    fireEvent.click(group.getByRole('button', { name: 'Add' }));
    fireEvent.change(group.getByLabelText('Key 1'), { target: { value: 'phone' } });
    fireEvent.change(group.getByLabelText('Value 1'), { target: { value: '010' } });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith({ extra: { phone: '010' } }));
  });

  it('required + added-then-removed back to empty → Save still blocked (redesign correctness: no stale pendingRef to mask it)', async () => {
    const onSave = vi.fn();
    const field = new InlineMapField('extra', 100).withLabel('추가정보').withRequired(true);
    renderForm(field, onSave);
    await screen.findByText('추가정보');
    const group = within(fieldWrapper());

    fireEvent.click(group.getByRole('button', { name: 'Add' }));
    fireEvent.change(group.getByLabelText('Key 1'), { target: { value: 'phone' } });
    fireEvent.click(group.getByRole('button', { name: 'Remove row 1' }));

    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(await screen.findByText(/필수 값입니다/)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });
});

describe('InlineMapFieldRenderer — EA-R1 #1: fixed-keys type-then-clear does not bypass required (0.3.x #1289 mode)', () => {
  it('fixed-keys, single key typed then cleared back to blank → Save still blocked', async () => {
    const onSave = vi.fn();
    const field = new InlineMapField('extra', 100)
      .withLabel('추가정보')
      .withKeys([{ key: 'phone', label: 'Phone' }])
      .withRequired(true);
    const { store } = renderForm(field, onSave);
    await screen.findByText('추가정보');
    const group = within(fieldWrapper());

    fireEvent.change(group.getByLabelText('Value 1'), { target: { value: '010-1234' } });
    await waitFor(() => expect(store.getState().getValue('extra')).toEqual({ phone: '010-1234' }));

    fireEvent.change(group.getByLabelText('Value 1'), { target: { value: '' } });
    await waitFor(() => expect(store.getState().getValue('extra')).toBeUndefined());

    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(await screen.findByText(/필수 값입니다/)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('fixed-keys, two keys, only one filled → NOT blank (required passes, both entries retained)', async () => {
    const onSave = vi.fn();
    const field = new InlineMapField('extra', 100)
      .withLabel('추가정보')
      .withKeys([
        { key: 'phone', label: 'Phone' },
        { key: 'fax', label: 'Fax' },
      ])
      .withRequired(true);
    const { store } = renderForm(field, onSave);
    await screen.findByText('추가정보');
    const group = within(fieldWrapper());

    fireEvent.change(group.getByLabelText('Value 1'), { target: { value: '010' } });
    await waitFor(() => expect(store.getState().getValue('extra')).toEqual({ phone: '010' }));

    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith({ extra: { phone: '010' } }));
  });

  it('useKeyValue() legit row (real key + non-empty value) round-trips unaffected — not filtered away', async () => {
    const field = new InlineMapField('extra', 100).withLabel('추가정보').useKeyValue();
    const { store } = renderForm(field);
    await screen.findByText('추가정보');
    const group = within(fieldWrapper());
    fireEvent.click(group.getByRole('button', { name: 'Add' }));
    fireEvent.change(group.getByLabelText('Key 1'), { target: { value: 'phone' } });
    fireEvent.change(group.getByLabelText('Value 1'), { target: { value: '010' } });
    await waitFor(() =>
      expect(store.getState().getValue('extra')).toEqual([{ key: 'phone', value: '010' }]),
    );
  });

  it('useKeyValue() all-blank-value rows collapse to [] (KeyValue mode variant of the #1289 fix)', async () => {
    const onSave = vi.fn();
    const field = new InlineMapField('extra', 100)
      .withLabel('추가정보')
      .useKeyValue()
      .withRequired(true);
    renderForm(field, onSave);
    await screen.findByText('추가정보');
    const group = within(fieldWrapper());
    fireEvent.click(group.getByRole('button', { name: 'Add' }));
    fireEvent.change(group.getByLabelText('Key 1'), { target: { value: 'phone' } });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(await screen.findByText(/필수 값입니다/)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });
});

describe('InlineMapFieldRenderer — resultType conversions', () => {
  it("default ('Object') writes a plain Record", async () => {
    const field = new InlineMapField('extra', 100).withLabel('추가정보');
    const { store } = renderForm(field);
    await screen.findByText('추가정보');
    const group = within(fieldWrapper());
    fireEvent.click(group.getByRole('button', { name: 'Add' }));
    fireEvent.change(group.getByLabelText('Key 1'), { target: { value: 'a' } });
    fireEvent.change(group.getByLabelText('Value 1'), { target: { value: '1' } });
    await waitFor(() => {
      const value = store.getState().getValue('extra');
      expect(value).toEqual({ a: '1' });
      expect(value).not.toBeInstanceOf(Map);
      expect(Array.isArray(value)).toBe(false);
    });
  });

  it('useKeyValue() writes a KeyValue[] array', async () => {
    const field = new InlineMapField('extra', 100).withLabel('추가정보').useKeyValue();
    const { store } = renderForm(field);
    await screen.findByText('추가정보');
    const group = within(fieldWrapper());
    fireEvent.click(group.getByRole('button', { name: 'Add' }));
    fireEvent.change(group.getByLabelText('Key 1'), { target: { value: 'a' } });
    fireEvent.change(group.getByLabelText('Value 1'), { target: { value: '1' } });
    await waitFor(() =>
      expect(store.getState().getValue('extra')).toEqual([{ key: 'a', value: '1' }]),
    );
  });

  it('useKeyValue() reads an existing KeyValue[] default back into the editor', async () => {
    const field = new InlineMapField('extra', 100)
      .withLabel('추가정보')
      .useKeyValue()
      .withDefaultValue([{ key: 'a', value: '1' }]);
    renderForm(field);
    await screen.findByText('추가정보');
    const group = within(fieldWrapper());
    expect(group.getByLabelText('Key 1')).toHaveValue('a');
    expect(group.getByLabelText('Value 1')).toHaveValue('1');
  });
});

describe("InlineMapFieldRenderer — 'Map' resultType narrows to Record on write (verified round-trip, recorded deviation)", () => {
  it('reads an initial Map default correctly into the editor', async () => {
    const field = new InlineMapField('extra', 100)
      .withLabel('추가정보')
      .useResultMap()
      .withDefaultValue(new Map([['a', '1']]));
    renderForm(field);
    await screen.findByText('추가정보');
    const group = within(fieldWrapper());
    expect(group.getByLabelText('Key 1')).toHaveValue('a');
    expect(group.getByLabelText('Value 1')).toHaveValue('1');
  });

  it('editing writes a plain Record, NOT a Map instance, into the store', async () => {
    const field = new InlineMapField('extra', 100).withLabel('추가정보').useResultMap();
    const { store } = renderForm(field);
    await screen.findByText('추가정보');
    const group = within(fieldWrapper());
    fireEvent.click(group.getByRole('button', { name: 'Add' }));
    fireEvent.change(group.getByLabelText('Key 1'), { target: { value: 'a' } });
    fireEvent.change(group.getByLabelText('Value 1'), { target: { value: '1' } });

    await waitFor(() => {
      const value = store.getState().getValue('extra');
      expect(value).not.toBeInstanceOf(Map);
      expect(value).toEqual({ a: '1' });
    });
  });

  it('toSaveData() output survives a JSON round-trip (a raw Map would NOT — JSON.stringify(new Map()) is always "{}")', async () => {
    const field = new InlineMapField('extra', 100).withLabel('추가정보').useResultMap();
    const { store } = renderForm(field);
    await screen.findByText('추가정보');
    const group = within(fieldWrapper());
    fireEvent.click(group.getByRole('button', { name: 'Add' }));
    fireEvent.change(group.getByLabelText('Key 1'), { target: { value: 'phone' } });
    fireEvent.change(group.getByLabelText('Value 1'), { target: { value: '010' } });
    await waitFor(() => expect(store.getState().getValue('extra')).toEqual({ phone: '010' }));

    const saved = store.getState().toSaveData();
    expect(saved['extra']).toEqual({ phone: '010' });
    expect(JSON.parse(JSON.stringify(saved))['extra']).toEqual({ phone: '010' });
  });

  it('hydrate() with a plain-object server payload round-trips through the editor and back out via toSaveData()', async () => {
    const field = new InlineMapField('extra', 100).withLabel('추가정보').useResultMap();
    const { store } = renderForm(field);
    await screen.findByText('추가정보');

    store.getState().hydrate({ extra: { phone: '010' } });
    const group = within(fieldWrapper());
    await waitFor(() => expect(group.getByLabelText('Key 1')).toHaveValue('phone'));
    expect(group.getByLabelText('Value 1')).toHaveValue('010');
    expect(store.getState().toSaveData()['extra']).toEqual({ phone: '010' });
  });
});
