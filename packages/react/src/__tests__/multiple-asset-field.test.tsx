// MultipleAssetField renderer — JSDOM integration test (EA-C fan-out).
// Registers MultipleAssetFieldRenderer directly (default-renderers.tsx is
// NOT touched — fan-out convention, briefing PART 1 "Test idioms"), then
// drives the real EntityForm -> createFormStore -> provider stack, same
// harness style as field-a11y.test.tsx / tag-field.test.tsx.

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { EntityForm } from '@listgrid/schema-core';
// MultipleAssetField/AssetItem are not yet re-exported from the
// @listgrid/schema-core barrel (shared file — registration is the fan-out
// orchestrator's job, per this task's hard rules); import the class straight
// from its module inside the sibling package so this suite is green
// standalone.
import type { AssetItem } from '../../../schema-core/src/field/multiple-asset-field';
import { MultipleAssetField } from '../../../schema-core/src/field/multiple-asset-field';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import type { FileInputProps } from '@listgrid/ui-default';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { FormStoreProvider } from '../providers/form-store';
import { registerFieldRenderer } from '../registry/field-renderer-registry';
import { MultipleAssetFieldRenderer } from '../registry/multiple-asset-renderer';
import { ViewEntityForm } from '../components/ViewEntityForm';

registerFieldRenderer('multipleAsset', MultipleAssetFieldRenderer);

function assetsForm(field: MultipleAssetField): EntityForm {
  return new EntityForm('GalleryEntityForm', '/gallery').addFields({ items: [field] });
}

function renderForm(
  field: MultipleAssetField,
  onSave = vi.fn(),
  components: typeof defaultUIComponents = defaultUIComponents,
) {
  const entityForm = assetsForm(field);
  const store = createFormStore(entityForm);
  render(
    <UIProvider components={components}>
      <AuthProvider session={undefined}>
        <FormStoreProvider store={store}>
          <ViewEntityForm entityForm={entityForm} store={store} onSave={onSave} />
        </FormStoreProvider>
      </AuthProvider>
    </UIProvider>,
  );
  return { store };
}

function wrapper(): HTMLElement {
  const el = document.querySelector('[data-field-name="gallery"]');
  if (!el) throw new Error('gallery field wrapper not found');
  return el as HTMLElement;
}

function openAddDialog() {
  fireEvent.click(within(wrapper()).getByRole('button', { name: '+ 추가' }));
}

function openSlot(labelRegExp: RegExp) {
  fireEvent.click(within(wrapper()).getByRole('button', { name: labelRegExp }));
}

function fillAndSave(opts: {
  name?: string;
  description?: string;
  url?: string;
  primary?: boolean;
}) {
  const dialog = screen.getByRole('dialog');
  if (opts.name !== undefined) {
    fireEvent.change(within(dialog).getByLabelText('이미지 유형'), {
      target: { value: opts.name },
    });
  }
  if (opts.description !== undefined) {
    fireEvent.change(within(dialog).getByLabelText('Alt Tag'), {
      target: { value: opts.description },
    });
  }
  if (opts.url !== undefined) {
    fireEvent.change(within(dialog).getByLabelText('Image'), { target: { value: opts.url } });
  }
  if (opts.primary) {
    fireEvent.click(within(dialog).getByLabelText('Primary'));
  }
  fireEvent.click(within(dialog).getByRole('button', { name: /이미지 (등록|수정)/ }));
}

describe('MultipleAssetFieldRenderer (transplant of 0.3.x MultipleAssetField.tsx:101-407)', () => {
  it('renders a label and one slot per field.tags, plus the add affordance', async () => {
    renderForm(
      new MultipleAssetField('gallery', 100, ['Primary', 'thumbnail']).withLabel('Gallery'),
    );
    expect(await screen.findByText('Gallery')).toBeInTheDocument();
    expect(within(wrapper()).getByRole('button', { name: 'Add Primary' })).toBeInTheDocument();
    expect(within(wrapper()).getByRole('button', { name: 'Add thumbnail' })).toBeInTheDocument();
    expect(within(wrapper()).getByRole('button', { name: '+ 추가' })).toBeInTheDocument();
  });

  it('URL-edit path works fully without onUpload (ui-default fallback, decision ②): adding a new named slot writes AssetItem[] to the store', async () => {
    const { store } = renderForm(new MultipleAssetField('gallery', 100).withLabel('Gallery'));
    await screen.findByText('Gallery');

    openAddDialog();
    fillAndSave({ name: 'banner', description: 'Banner image', url: '/uploads/banner.png' });

    await waitFor(() =>
      expect(store.getState().getValue('gallery')).toEqual([
        { name: 'banner', description: 'Banner image', url: '/uploads/banner.png' },
      ]),
    );
    // dialog closes after save
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    // value renders back into the grid as a filled slot
    expect(within(wrapper()).getByRole('button', { name: 'Edit banner' })).toBeInTheDocument();
  });

  it('filling a fixed named slot (from field.tags) saves under that slot name (name input locked when editing)', async () => {
    const { store } = renderForm(
      new MultipleAssetField('gallery', 100, ['Primary', 'thumbnail']).withLabel('Gallery'),
    );
    await screen.findByText('Gallery');

    openSlot(/^Add Primary$/);
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByLabelText('이미지 유형')).toHaveValue('Primary');
    expect(within(dialog).getByLabelText('이미지 유형')).toHaveAttribute('readonly');
    fillAndSave({ url: '/uploads/primary.png' });

    await waitFor(() =>
      expect(store.getState().getValue('gallery')).toEqual([
        { name: 'Primary', url: '/uploads/primary.png' },
      ]),
    );
  });

  it('slot-name regex validation: invalid characters surface the Korean message and block save (transplant :309-326)', async () => {
    renderForm(new MultipleAssetField('gallery', 100).withLabel('Gallery'));
    await screen.findByText('Gallery');

    openAddDialog();
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('이미지 유형'), {
      target: { value: 'Invalid Name!' },
    });
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      '영문 소문자/숫자만 입력할 수 있습니다',
    );
  });

  it('slot-name blank surfaces the Korean required-name message (transplant :311-312)', async () => {
    renderForm(new MultipleAssetField('gallery', 100).withLabel('Gallery'));
    await screen.findByText('Gallery');

    openAddDialog();
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('이미지 유형'), { target: { value: 'ok' } });
    fireEvent.change(within(dialog).getByLabelText('이미지 유형'), { target: { value: '' } });
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      '이미지의 이름을 영문/숫자로 입력하세요.',
    );
  });

  it('duplicate slot name is rejected (transplant :314-316)', async () => {
    const { store } = renderForm(new MultipleAssetField('gallery', 100).withLabel('Gallery'));
    await screen.findByText('Gallery');

    openAddDialog();
    fillAndSave({ name: 'banner', url: '/uploads/banner.png' });
    await waitFor(() => expect(store.getState().getValue('gallery')).toHaveLength(1));

    openAddDialog();
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('이미지 유형'), { target: { value: 'banner' } });
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      '중복된 이미지 이름이 존재합니다. 다른 이름을 입력해야 합니다.',
    );
  });

  it('save is blocked with a Korean message when url is left empty (transplant :381-382)', async () => {
    renderForm(new MultipleAssetField('gallery', 100).withLabel('Gallery'));
    await screen.findByText('Gallery');

    openAddDialog();
    fillAndSave({ name: 'banner' });
    expect(await screen.findByRole('alert')).toHaveTextContent('이미지를 업로드해 주세요.');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('delete affordance removes a non-Primary slot from the store', async () => {
    const { store } = renderForm(
      new MultipleAssetField('gallery', 100, ['Primary', 'thumbnail']).withLabel('Gallery'),
    );
    await screen.findByText('Gallery');

    openSlot(/^Add thumbnail$/);
    fillAndSave({ url: '/uploads/thumb.png' });
    await waitFor(() =>
      expect(store.getState().getValue('gallery')).toEqual([
        { name: 'thumbnail', url: '/uploads/thumb.png' },
      ]),
    );

    fireEvent.click(within(wrapper()).getByRole('button', { name: 'Remove thumbnail' }));
    await waitFor(() => expect(store.getState().getValue('gallery')).toEqual([]));
    // slot remains in the grid, empty and re-addable (deviation 2 — no vanishing slot)
    expect(within(wrapper()).getByRole('button', { name: 'Add thumbnail' })).toBeInTheDocument();
  });

  it("the 'Primary'-named slot never shows a delete affordance, even when filled (transplant :183-210)", async () => {
    const { store } = renderForm(
      new MultipleAssetField('gallery', 100, ['Primary']).withLabel('Gallery'),
    );
    await screen.findByText('Gallery');

    openSlot(/^Add Primary$/);
    fillAndSave({ url: '/uploads/primary.png' });
    await waitFor(() => expect(store.getState().getValue('gallery')).toHaveLength(1));

    expect(
      within(wrapper()).queryByRole('button', { name: 'Remove Primary' }),
    ).not.toBeInTheDocument();
  });

  it('the primary toggle enforces single-primary across items (conductor decision ④, deviation 4)', async () => {
    const { store } = renderForm(
      new MultipleAssetField('gallery', 100, ['Primary', 'thumbnail']).withLabel('Gallery'),
    );
    await screen.findByText('Gallery');

    openSlot(/^Add Primary$/);
    fillAndSave({ url: '/uploads/primary.png', primary: true });
    await waitFor(() =>
      expect(store.getState().getValue('gallery')).toEqual([
        { name: 'Primary', url: '/uploads/primary.png', primary: true },
      ]),
    );

    openSlot(/^Add thumbnail$/);
    fillAndSave({ url: '/uploads/thumb.png', primary: true });

    await waitFor(() => {
      const assets = store.getState().getValue('gallery') as AssetItem[];
      const primaries = assets.filter((a) => a.primary === true);
      expect(primaries).toHaveLength(1);
      expect(primaries[0]!.name).toBe('thumbnail');
      const oldPrimary = assets.find((a) => a.name === 'Primary')!;
      expect(oldPrimary.primary).toBeUndefined();
    });
  });

  it('a11y: required field carries aria-required on the add trigger; save validates the empty-array-is-blank contract (decision ④)', async () => {
    const onSave = vi.fn();
    renderForm(
      new MultipleAssetField('gallery', 100).withLabel('Gallery').withRequired(true),
      onSave,
    );
    await screen.findByText('Gallery');

    await waitFor(() =>
      expect(within(wrapper()).getByRole('button', { name: '+ 추가' })).toHaveAttribute(
        'aria-required',
        'true',
      ),
    );

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    expect(await screen.findByText(/필수 값입니다/)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('host FileInput override (fake onUpload-driven widget) still lands its resolved url in the store through the same draft/save flow', async () => {
    // Simulates a host that overrides the injected FileInput component with
    // its own upload-wired widget (this renderer never supplies onUpload
    // itself — see file header). The stub calls onChange directly with a
    // "resolved" URL, exactly like a real onUpload->onChange handoff would.
    function StubFileInput({ value, onChange, ariaLabel }: FileInputProps) {
      return (
        <input
          type="file"
          aria-label={ariaLabel}
          onChange={() => onChange?.('/uploads/from-fake-upload.png')}
          data-current-value={value}
        />
      );
    }

    const { store } = renderForm(
      new MultipleAssetField('gallery', 100).withLabel('Gallery'),
      vi.fn(),
      { ...defaultUIComponents, FileInput: StubFileInput },
    );
    await screen.findByText('Gallery');

    openAddDialog();
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('이미지 유형'), { target: { value: 'banner' } });
    fireEvent.change(within(dialog).getByLabelText('Image'), { target: { files: [] } });
    fireEvent.click(within(dialog).getByRole('button', { name: /이미지 등록/ }));

    await waitFor(() =>
      expect(store.getState().getValue('gallery')).toEqual([
        { name: 'banner', url: '/uploads/from-fake-upload.png' },
      ]),
    );
  });
});
