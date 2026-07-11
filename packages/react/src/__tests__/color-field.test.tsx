// EA-B fan-out — ColorFieldRenderer integration test (PART C §Color). Real
// DOM render through EntityForm → createFormStore → provider stack
// (field-a11y/time-field pattern), registering ONLY the 'color' renderer
// directly here (default-renderers.tsx untouched — fan-out contract).
//
// Covers the field's distinctive old-engine behavior (Conductor decision ②):
// old `ColorInput.onChangeEnd` commits exactly ONCE, no intermediate calls
// (ColorField.tsx:76-79). The new native `<input type="color">` fires
// change events at a browser-dependent frequency, so onChange must write
// with `{ cascade: false }` (value visible, no onChanges dispatch) and only
// blur commits (default cascade) — asserted here via an onChanges spy that
// must stay empty through intermediate changes and fire exactly once on
// blur.

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { EntityForm, type FormMutator } from '@listgrid/schema-core';
// ColorField isn't exported from the schema-core barrel yet (barrel edits
// are the orchestrator's job — fan-out contract); import the class directly
// from its source file (a straight relative path, not a package subpath
// import — @listgrid/schema-core's package.json `exports` map only
// publishes ".").
import { ColorField } from '../../../schema-core/src/field/color-field';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { FormStoreProvider } from '../providers/form-store';
import { registerFieldRenderer } from '../registry/field-renderer-registry';
import { ColorFieldRenderer } from '../registry/color-renderer';
import { ViewEntityForm } from '../components/ViewEntityForm';

registerFieldRenderer('color', ColorFieldRenderer);

function widgetForm(onChangesSpy?: (changedField: string) => void): EntityForm {
  const field = new ColorField('brandColor', 1)
    .withLabel('Brand Color')
    .withDefaultValue('#ffffff');
  const form = new EntityForm('WidgetEntityForm', '/widget').addFields({ items: [field] });
  if (onChangesSpy) {
    form.onChange((_m: FormMutator, changedField: string) => onChangesSpy(changedField));
  }
  return form;
}

function renderForm(entityForm: EntityForm) {
  const store = createFormStore(entityForm);
  render(
    <UIProvider components={defaultUIComponents}>
      <AuthProvider session={undefined}>
        <FormStoreProvider store={store}>
          <ViewEntityForm entityForm={entityForm} store={store} onSave={() => {}} />
        </FormStoreProvider>
      </AuthProvider>
    </UIProvider>,
  );
  return { store };
}

describe('ColorFieldRenderer — basic wiring', () => {
  it('renders a native color input seeded from the default value', async () => {
    const { store } = renderForm(widgetForm());
    const input = (await screen.findByLabelText(/^Brand Color/)) as HTMLInputElement;
    expect(input).toHaveAttribute('type', 'color');
    expect(input.value).toBe('#ffffff');
    expect(store.getState().fields.brandColor.default).toBe('#ffffff');
  });

  it('forwards required/invalid/describedBy a11y attributes', async () => {
    const field = new ColorField('brandColor', 1).withLabel('Brand Color').withRequired(true);
    const form = new EntityForm('WidgetEntityForm', '/widget').addFields({ items: [field] });
    renderForm(form);
    const input = await screen.findByLabelText(/^Brand Color/);
    await vi.waitFor(() => expect(input).toHaveAttribute('aria-required', 'true'));

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    await vi.waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'));
    expect(input.getAttribute('aria-describedby')).toBe('brandColor-error');
  });
});

describe('ColorFieldRenderer — onChangeEnd parity (Conductor decision ②)', () => {
  it('writes the live value on every change but suppresses the onChanges cascade until blur', async () => {
    const calls: string[] = [];
    const { store } = renderForm(widgetForm((changedField) => calls.push(changedField)));
    const input = (await screen.findByLabelText(/^Brand Color/)) as HTMLInputElement;

    // Simulate a browser firing several intermediate change events while the
    // picker is open (dragging the hue/saturation control) — none of these
    // may dispatch onChanges (old onChangeEnd never fired mid-drag either).
    fireEvent.change(input, { target: { value: '#ff0000' } });
    expect(input.value).toBe('#ff0000');
    expect(store.getState().fields.brandColor.current).toBe('#ff0000');
    expect(calls).toEqual([]);

    fireEvent.change(input, { target: { value: '#00ff00' } });
    expect(store.getState().fields.brandColor.current).toBe('#00ff00');
    expect(calls).toEqual([]);

    // blur commits — cascade fires exactly once, old onChangeEnd parity.
    fireEvent.blur(input);
    expect(calls).toEqual(['brandColor']);
    expect(store.getState().fields.brandColor.current).toBe('#00ff00');
  });

  it('a blur with no prior change still commits (dispatches) once — matches setValue(name,v) always running on blur', async () => {
    const calls: string[] = [];
    const { store } = renderForm(widgetForm((changedField) => calls.push(changedField)));
    const input = await screen.findByLabelText(/^Brand Color/);

    fireEvent.blur(input);
    expect(calls).toEqual(['brandColor']);
    expect(store.getState().fields.brandColor.current).toBe('#ffffff');
  });
});
