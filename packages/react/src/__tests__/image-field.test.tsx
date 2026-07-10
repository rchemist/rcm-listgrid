// ImageField renderer integration test (EA-C fan-out — Image). Same harness
// shape as field-a11y.test.tsx / link-field.test.tsx: real EntityForm +
// createFormStore + the full provider stack, rendered with
// @listgrid/ui-default's unstyled primitives. The Image renderer is
// registered directly here via registerFieldRenderer('image', ...) —
// default-renderers.tsx is untouched (briefing PART 1 fan-out rule).
//
// NOTE on querying (same pitfall as tag-field.test.tsx): FieldRenderer.tsx
// associates the field's <label htmlFor={fieldName}> with `id={fieldName}`
// on whatever the registered renderer puts that id on. ui-default's
// FileInput primitive puts `id` on its wrapping <div>, which is not a
// "labelable" HTML element — so `screen.findByLabelText` does not resolve
// this field's input. Tests below query through the stable
// `[data-field-name="avatar"]` wrapper FieldRenderer.tsx renders instead.

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { EntityForm } from '@listgrid/schema-core';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import type { FileInputProps } from '@listgrid/ui-default';
// ImageField is not yet re-exported from the @listgrid/schema-core barrel
// (shared file — registration is the fan-out orchestrator's job, per this
// task's hard rules); import the class straight from its module inside the
// sibling package so this suite is green standalone.
import { ImageField } from '../../../schema-core/src/field/image-field';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { FormStoreProvider } from '../providers/form-store';
import { registerFieldRenderer } from '../registry/field-renderer-registry';
import { ImageFieldRenderer } from '../registry/image-renderer';
import { ViewEntityForm } from '../components/ViewEntityForm';

registerFieldRenderer('image', ImageFieldRenderer);

function profileForm(field: ImageField): EntityForm {
  return new EntityForm('ProfileEntityForm', '/profile').addFields({ items: [field] });
}

function renderForm(
  field: ImageField,
  onSave = vi.fn(),
  components: typeof defaultUIComponents = defaultUIComponents,
) {
  const entityForm = profileForm(field);
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
  const el = document.querySelector('[data-field-name="avatar"]');
  if (!el) throw new Error('avatar field wrapper not found');
  return el as HTMLElement;
}

/** The URL text input inside the FileInput slot, scoped via the wrapper. */
function urlInput(): HTMLInputElement {
  return within(wrapper()).getByRole('textbox') as HTMLInputElement;
}

/**
 * A custom `FileInput` stub standing in for a host-provided component with
 * upload capability BAKED IN (not passed through as an `onUpload` prop —
 * ImageFieldRenderer never sources/passes one itself, see image-renderer.tsx
 * header comment). Exercises the "fake onUpload" path: clicking the button
 * resolves a canned URL and feeds it through `onChange`, exactly like a real
 * host FileInput would after a successful upload.
 */
function FakeUploadFileInput({
  id,
  value,
  onChange,
  readOnly,
  disabled,
  required,
  invalid,
  describedBy,
}: FileInputProps) {
  return (
    <div id={id}>
      <input
        type="text"
        role="textbox"
        value={value ?? ''}
        readOnly={readOnly}
        disabled={disabled}
        aria-required={required || undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={(e) => onChange?.(e.target.value === '' ? undefined : e.target.value)}
      />
      <button type="button" onClick={() => onChange?.('https://cdn.example.com/uploaded.png')}>
        Fake Upload
      </button>
    </div>
  );
}

describe('ImageFieldRenderer (transplant of 0.3.x ImageField.tsx:141-189)', () => {
  it('renders a label and the FileInput URL text input, empty by default (no thumbnail)', async () => {
    renderForm(new ImageField('avatar', 100).withLabel('Avatar'));
    expect(await screen.findByText('Avatar')).toBeInTheDocument();
    expect(urlInput().value).toBe('');
    expect(wrapper().querySelector('img')).toBeNull();
  });

  it('URL edit writes through the store as a plain string (never local React state)', async () => {
    const { store } = renderForm(new ImageField('avatar', 100).withLabel('Avatar'));
    await screen.findByText('Avatar');

    fireEvent.change(urlInput(), { target: { value: 'https://cdn.example.com/a.png' } });

    expect(store.getState().fields['avatar']?.current).toBe('https://cdn.example.com/a.png');
    await waitFor(() => expect(urlInput().value).toBe('https://cdn.example.com/a.png'));
  });

  it('a non-empty value renders back as a bare <img> thumbnail (no zoom modal)', async () => {
    const { store } = renderForm(new ImageField('avatar', 100).withLabel('Avatar'));
    await screen.findByText('Avatar');

    fireEvent.change(urlInput(), { target: { value: 'https://cdn.example.com/a.png' } });
    await waitFor(() => {
      const img = wrapper().querySelector('img');
      expect(img).not.toBeNull();
      expect(img).toHaveAttribute('src', 'https://cdn.example.com/a.png');
    });
    // no click-to-enlarge affordance / modal (descoped, briefing decision ⑤)
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('clearing the value removes the thumbnail (no broken-image / no-image fallback — deviation, RuntimeConfig has no equivalent)', async () => {
    renderForm(
      new ImageField('avatar', 100)
        .withLabel('Avatar')
        .withDefaultValue('https://cdn.example.com/a.png'),
    );
    await waitFor(() => expect(wrapper().querySelector('img')).not.toBeNull());

    const clearButton = within(wrapper()).getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);

    await waitFor(() => expect(wrapper().querySelector('img')).toBeNull());
  });

  it('withPreviewSize applies the size via inline style on the thumbnail', async () => {
    renderForm(
      new ImageField('avatar', 100)
        .withLabel('Avatar')
        .withPreviewSize('8rem')
        .withDefaultValue('https://cdn.example.com/a.png'),
    );
    await waitFor(() => {
      const img = wrapper().querySelector('img') as HTMLImageElement;
      expect(img.style.width).toBe('8rem');
      expect(img.style.height).toBe('8rem');
    });
  });

  it('ui-default fallback renders no file picker when the host FileInput has no onUpload wired — the URL-edit path fully works without it', async () => {
    renderForm(new ImageField('avatar', 100).withLabel('Avatar'));
    await screen.findByText('Avatar');
    expect(wrapper().querySelector('input[type="file"]')).toBeNull();
    // the URL text input remains fully functional (covered above)
  });

  it('a host-injected FileInput with upload baked in (fake onUpload) resolves a URL that reaches the store and renders back as a thumbnail', async () => {
    const { store } = renderForm(new ImageField('avatar', 100).withLabel('Avatar'), vi.fn(), {
      ...defaultUIComponents,
      FileInput: FakeUploadFileInput,
    });
    await screen.findByText('Avatar');

    const uploadButton = within(wrapper()).getByRole('button', { name: /fake upload/i });
    fireEvent.click(uploadButton);

    await waitFor(() =>
      expect(store.getState().fields['avatar']?.current).toBe(
        'https://cdn.example.com/uploaded.png',
      ),
    );
    await waitFor(() => {
      const img = wrapper().querySelector('img');
      expect(img).toHaveAttribute('src', 'https://cdn.example.com/uploaded.png');
    });
  });

  it('a11y: required/invalid/describedBy are forwarded to the FileInput slot on save-triggered validation (plain-string blank now correctly fails required — decision ⑤ natural healing)', async () => {
    const onSave = vi.fn();
    renderForm(new ImageField('avatar', 100).withLabel('Avatar').withRequired(true), onSave);
    await screen.findByText('Avatar');

    await waitFor(() => expect(urlInput()).toHaveAttribute('aria-required', 'true'));

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => expect(urlInput()).toHaveAttribute('aria-invalid', 'true'));
    const describedBy = urlInput().getAttribute('aria-describedby');
    expect(describedBy).toBe('avatar-error');
    expect(document.getElementById(describedBy as string)).toHaveTextContent(/필수 값입니다/);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('multi-image config (maxCount>1): a resolved URL is written to the store as a single-element array', async () => {
    const { store } = renderForm(
      new ImageField('gallery', 100).withLabel('Gallery').withMaxCount(3),
      vi.fn(),
      { ...defaultUIComponents, FileInput: FakeUploadFileInput },
    );
    await screen.findByText('Gallery');

    const galleryWrapper = document.querySelector('[data-field-name="gallery"]') as HTMLElement;
    const uploadButton = within(galleryWrapper).getByRole('button', { name: /fake upload/i });
    fireEvent.click(uploadButton);

    await waitFor(() =>
      expect(store.getState().fields['gallery']?.current).toEqual([
        'https://cdn.example.com/uploaded.png',
      ]),
    );
  });

  describe('EA-R1 #2: multi-image gallery no longer drops the tail on edit', () => {
    it('hydrates a pre-loaded string[] gallery and renders one FileInput per URL', async () => {
      renderForm(
        new ImageField('gallery', 100)
          .withLabel('Gallery')
          .withMaxCount(3)
          .withDefaultValue(['a', 'b', 'c']),
      );
      await screen.findByText('Gallery');
      const galleryWrapper = document.querySelector('[data-field-name="gallery"]') as HTMLElement;
      expect(within(galleryWrapper).getAllByRole('textbox')).toHaveLength(3);
      expect(galleryWrapper.querySelectorAll('img')).toHaveLength(3);
    });

    it('editing slot 0 preserves the other pre-loaded URLs (b, c)', async () => {
      const { store } = renderForm(
        new ImageField('gallery', 100)
          .withLabel('Gallery')
          .withMaxCount(3)
          .withDefaultValue(['a', 'b', 'c']),
      );
      await screen.findByText('Gallery');
      const galleryWrapper = document.querySelector('[data-field-name="gallery"]') as HTMLElement;
      const inputs = within(galleryWrapper).getAllByRole('textbox') as HTMLInputElement[];

      fireEvent.change(inputs[0]!, { target: { value: 'a2' } });

      await waitFor(() => expect(store.getState().getValue('gallery')).toEqual(['a2', 'b', 'c']));
    });

    it('removing slot 1 leaves [a, c]', async () => {
      const { store } = renderForm(
        new ImageField('gallery', 100)
          .withLabel('Gallery')
          .withMaxCount(3)
          .withDefaultValue(['a', 'b', 'c']),
      );
      await screen.findByText('Gallery');
      const galleryWrapper = document.querySelector('[data-field-name="gallery"]') as HTMLElement;

      fireEvent.click(within(galleryWrapper).getByRole('button', { name: 'Remove image 2' }));

      await waitFor(() => expect(store.getState().getValue('gallery')).toEqual(['a', 'c']));
    });
  });
});
