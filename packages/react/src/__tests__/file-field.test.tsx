// FileField renderer — JSDOM integration test (EA-C fan-out — File).
// Registers FileFieldRenderer directly (default-renderers.tsx is NOT
// touched — fan-out convention, ea-a-scout-briefing.md PART 1 "Test
// idioms"), then drives the real EntityForm -> createFormStore -> provider
// stack, same harness style as field-a11y.test.tsx / tag-field.test.tsx.
//
// NOTE on querying: the ui-default FileInput primitive puts `id` on its
// wrapping <div> (non-labelable), and the single/multi FileFieldRenderer
// passes `ariaLabel` through so `screen.getByLabelText` resolves the inner
// text input directly (ui-default/src/__tests__/primitives.test.tsx idiom).
// Multi-mode rows are additionally scoped through the stable
// `[data-field-name="..."]` wrapper FieldRenderer.tsx renders, mirroring
// tag-field.test.tsx.

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { EntityForm } from '@listgrid/schema-core';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import type { FileInputProps, UIComponents } from '@listgrid/ui-default';
// FileField is not yet re-exported from the @listgrid/schema-core barrel
// (shared file — registration is the fan-out orchestrator's job, per this
// task's hard rules); import the class straight from its module inside the
// sibling package so this suite is green standalone.
import { FileField } from '../../../schema-core/src/field/file-field';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { FormStoreProvider } from '../providers/form-store';
import { registerFieldRenderer } from '../registry/field-renderer-registry';
import { FileFieldRenderer } from '../registry/file-renderer';
import { ViewEntityForm } from '../components/ViewEntityForm';

registerFieldRenderer('file', FileFieldRenderer);

function fileForm(field: FileField): EntityForm {
  return new EntityForm('DocumentEntityForm', '/documents').addFields({ items: [field] });
}

function renderForm(
  field: FileField,
  onSave = vi.fn(),
  components: UIComponents = defaultUIComponents,
) {
  const entityForm = fileForm(field);
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

/** A host-swapped `FileInput` stub that simulates "upload" as a single
 *  button press resolving to a canned URL — exercises the "host overrides
 *  the FileInput component itself" seam (this renderer never sources/passes
 *  its own `onUpload`, matching the sibling image-renderer.tsx/
 *  multiple-asset-renderer.tsx posture; see file-renderer.tsx doc comment). */
function FakeUploadFileInput({ id, value, onChange, ariaLabel }: FileInputProps) {
  return (
    <div id={id}>
      <span>{value ?? ''}</span>
      <button
        type="button"
        aria-label={ariaLabel ? `${ariaLabel} — fake upload` : 'fake upload'}
        onClick={() => onChange?.('https://cdn.example.com/uploaded-by-host.png')}
      >
        Fake Upload
      </button>
    </div>
  );
}

describe('FileFieldRenderer — single mode (transplant of 0.3.x FileField.tsx:97-122)', () => {
  it('renders a label and a URL text input (ui-default fallback, no onUpload wired)', async () => {
    renderForm(new FileField('resume', 100).withLabel('Resume'));
    expect(await screen.findByText('Resume')).toBeInTheDocument();
    expect(screen.getByLabelText('Resume')).toBeInTheDocument();
    // no file picker without an injected onUpload (hard rule: URL-edit path
    // must fully work with zero upload wiring)
    expect(screen.queryByLabelText('Resume — upload')).not.toBeInTheDocument();
  });

  it('typing a URL writes it into the store as a plain string, and renders it back', async () => {
    const { store } = renderForm(new FileField('resume', 100).withLabel('Resume'));
    const input = await screen.findByLabelText('Resume');

    // deliberately NOT an http(s) URL — a relative asset-server path stays in
    // the editable FileInput mode (an http(s) value would immediately trip
    // the external-URL bypass on the next render, covered separately below).
    fireEvent.change(input, { target: { value: '/uploads/resume.pdf' } });
    await waitFor(() => expect(store.getState().getValue('resume')).toBe('/uploads/resume.pdf'));
    expect(input).toHaveValue('/uploads/resume.pdf');
  });

  it('clearing the value writes undefined', async () => {
    const { store } = renderForm(
      new FileField('resume', 100).withLabel('Resume').withDefaultValue('/uploads/a.pdf'),
    );
    const input = await screen.findByLabelText('Resume');
    expect(input).toHaveValue('/uploads/a.pdf');

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    await waitFor(() => expect(store.getState().getValue('resume')).toBeUndefined());
  });

  it('an external http(s) URL bypasses FileInput entirely and renders as a bare link (0.3.x pickExternalUrl parity)', async () => {
    renderForm(
      new FileField('resume', 100)
        .withLabel('Resume')
        .withDefaultValue('https://external.example.com/already-hosted.pdf'),
    );
    await screen.findByText('Resume');

    expect(screen.queryByLabelText('Resume')).not.toBeInTheDocument();
    const link = await screen.findByRole('link', {
      name: 'https://external.example.com/already-hosted.pdf',
    });
    expect(link).toHaveAttribute('href', 'https://external.example.com/already-hosted.pdf');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('fake onUpload via a host-swapped FileInput component reaches the store and renders back', async () => {
    const components: UIComponents = { ...defaultUIComponents, FileInput: FakeUploadFileInput };
    const { store } = renderForm(
      new FileField('resume', 100).withLabel('Resume'),
      vi.fn(),
      components,
    );
    await screen.findByText('Resume');

    fireEvent.click(screen.getByRole('button', { name: 'Resume — fake upload' }));
    await waitFor(() =>
      expect(store.getState().getValue('resume')).toBe(
        'https://cdn.example.com/uploaded-by-host.png',
      ),
    );
    expect(screen.getByText('https://cdn.example.com/uploaded-by-host.png')).toBeInTheDocument();
  });

  it('accept is built from config.extensions + config.fileTypes and threaded to the injected FileInput', async () => {
    // ui-default's own FileInput fallback only puts `accept` on the file
    // PICKER input, which only renders when `onUpload` is supplied (this
    // renderer never supplies one — see file-renderer.tsx doc comment), so
    // the `accept` prop this renderer computes is invisible in the DOM under
    // the plain default. A minimal probe stub renders it directly to assert
    // the renderer threads it through correctly regardless of which
    // FileInput component ends up injected.
    function AcceptProbeFileInput({ id, accept, ariaLabel, value }: FileInputProps) {
      return <input id={id} aria-label={ariaLabel} accept={accept} readOnly value={value ?? ''} />;
    }
    const components: UIComponents = { ...defaultUIComponents, FileInput: AcceptProbeFileInput };
    renderForm(
      new FileField('resume', 100)
        .withLabel('Resume')
        .withExtensions('pdf', 'doc')
        .withFileTypes('application/pdf'),
      vi.fn(),
      components,
    );
    const input = await screen.findByLabelText('Resume');
    expect(input).toHaveAttribute('accept', 'application/pdf,.pdf,.doc');
  });

  it('a11y: required file field carries aria-required; save validates required-blank', async () => {
    const onSave = vi.fn();
    renderForm(new FileField('resume', 100).withLabel('이력서').withRequired(true), onSave);
    const input = await screen.findByLabelText('이력서');
    await waitFor(() => expect(input).toHaveAttribute('aria-required', 'true'));

    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(await screen.findByText(/필수 값입니다/)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });
});

describe('FileFieldRenderer — multi mode (config.maxCount > 1, decision ①)', () => {
  function attachmentsWrapper(): HTMLElement {
    const wrapper = document.querySelector('[data-field-name="attachments"]');
    if (!wrapper) throw new Error('attachments field wrapper not found');
    return wrapper as HTMLElement;
  }

  it('maxCount > 1 renders one FileInput per existing URL plus one empty adder', async () => {
    const field = new FileField('attachments', 100)
      .withLabel('Attachments')
      .withMaxCount(3)
      .withDefaultValue(['/uploads/a.pdf', '/uploads/b.pdf']);
    renderForm(field);
    await screen.findByText('Attachments');

    expect(screen.getByLabelText('Attachments 1')).toHaveValue('/uploads/a.pdf');
    expect(screen.getByLabelText('Attachments 2')).toHaveValue('/uploads/b.pdf');
    expect(screen.getByLabelText('Attachments 추가')).toHaveValue('');
  });

  it('filling the adder appends a new URL to the store array', async () => {
    const field = new FileField('attachments', 100)
      .withLabel('Attachments')
      .withMaxCount(3)
      .withDefaultValue(['/uploads/a.pdf']);
    const { store } = renderForm(field);
    await screen.findByText('Attachments');

    fireEvent.change(screen.getByLabelText('Attachments 추가'), {
      target: { value: '/uploads/c.pdf' },
    });
    await waitFor(() =>
      expect(store.getState().getValue('attachments')).toEqual([
        '/uploads/a.pdf',
        '/uploads/c.pdf',
      ]),
    );
  });

  it('clearing an existing row removes it from the store array (compacts, does not leave a hole)', async () => {
    const field = new FileField('attachments', 100)
      .withLabel('Attachments')
      .withMaxCount(3)
      .withDefaultValue(['/uploads/a.pdf', '/uploads/b.pdf']);
    const { store } = renderForm(field);
    await screen.findByText('Attachments');

    const within1 = within(attachmentsWrapper());
    const clearButtons = within1.getAllByRole('button', { name: 'Clear' });
    fireEvent.click(clearButtons[0]!);
    await waitFor(() =>
      expect(store.getState().getValue('attachments')).toEqual(['/uploads/b.pdf']),
    );
  });

  it('the adder is not rendered once maxCount is reached', async () => {
    const field = new FileField('attachments', 100)
      .withLabel('Attachments')
      .withMaxCount(2)
      .withDefaultValue(['/uploads/a.pdf', '/uploads/b.pdf']);
    renderForm(field);
    await screen.findByText('Attachments');
    expect(screen.queryByLabelText('Attachments 추가')).not.toBeInTheDocument();
  });

  it('an external URL entry renders as a link row with its own Remove button, not a FileInput', async () => {
    const field = new FileField('attachments', 100)
      .withLabel('Attachments')
      .withMaxCount(3)
      .withDefaultValue(['https://external.example.com/already-hosted.pdf', '/uploads/b.pdf']);
    const { store } = renderForm(field);
    await screen.findByText('Attachments');

    const link = await screen.findByRole('link', {
      name: 'https://external.example.com/already-hosted.pdf',
    });
    expect(link).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Remove https://external.example.com/already-hosted.pdf',
      }),
    );
    await waitFor(() =>
      expect(store.getState().getValue('attachments')).toEqual(['/uploads/b.pdf']),
    );
  });

  it('required + empty array → validation failure (generic isBlank treats [] as blank, decision ①)', async () => {
    const onSave = vi.fn();
    const field = new FileField('attachments', 100)
      .withLabel('첨부파일')
      .withMaxCount(3)
      .withRequired(true);
    renderForm(field, onSave);
    await screen.findByText('첨부파일');

    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(await screen.findByText(/필수 값입니다/)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });
});
