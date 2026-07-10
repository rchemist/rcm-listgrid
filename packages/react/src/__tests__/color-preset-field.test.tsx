// ColorPresetField renderer integration test (EA-A fan-out — ColorPreset).
// Same harness shape as field-a11y.test.tsx / link-field.test.tsx: real
// EntityForm + createFormStore + the full provider stack, rendered with
// @listgrid/ui-default's unstyled primitives. The ColorPreset renderer is
// registered directly here via registerFieldRenderer('colorPreset', ...) —
// default-renderers.tsx is untouched (briefing PART 1 fan-out rule).
//
// NOTE: like every other EA-A fan-out sibling, this imports `ColorPresetField`
// as a NAMED export of `@listgrid/schema-core` — that barrel export is added
// centrally by the orchestrator from the fan-out manifest (hard rule: fan-out
// agents never touch packages/schema-core/src/index.ts). Until that
// registration lands, this file fails to run in isolation with "ColorPresetField
// is not a constructor" (verified against packages/react/src/__tests__/
// link-field.test.tsx, which is in the identical pre-registration state) — not
// a bug in this file.

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ColorPresetField, EntityForm } from '@listgrid/schema-core';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { FormStoreProvider } from '../providers/form-store';
import { registerFieldRenderer } from '../registry/field-renderer-registry';
import { ColorPresetFieldRenderer } from '../registry/color-preset-renderer';
import { ViewEntityForm } from '../components/ViewEntityForm';

registerFieldRenderer('colorPreset', ColorPresetFieldRenderer);

function collegeForm(presets?: string[]): EntityForm {
  const field = new ColorPresetField('brandColor', 100, presets).withLabel('Brand Color');
  return new EntityForm('CollegeEntityForm', '/college').addFields({ items: [field] });
}

function renderForm(entityForm: EntityForm, onSave = vi.fn()) {
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
  return { store, onSave };
}

describe('ColorPresetFieldRenderer', () => {
  it('renders a trigger button (not a text input) bound via id to the field name', async () => {
    renderForm(collegeForm());
    const trigger = await screen.findByLabelText(/^Brand Color/);
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger).toHaveAttribute('id', 'brandColor');
  });

  it('opens a swatch-grid popover on click, offering every named color when no presets are declared', async () => {
    renderForm(collegeForm());
    const trigger = await screen.findByLabelText(/^Brand Color/);

    fireEvent.click(trigger);

    const dialog = await screen.findByRole('dialog');
    // 16 named colors (0.3.x AdditionalColorType union) when `presets` is
    // undefined — the "offer everything" branch of the presets contract.
    const swatches = screen.getAllByRole('button', {
      name: /^(dark|gray|red|pink|grape|violet|indigo|blue|cyan|green|lime|yellow|orange|teal|black|white)$/,
    });
    expect(swatches).toHaveLength(16);
    expect(dialog).toBeTruthy();
  });

  it('user swatch pick writes the color key through the store (never local React state) and closes the popover', async () => {
    const { store } = renderForm(collegeForm());
    const trigger = await screen.findByLabelText(/^Brand Color/);
    fireEvent.click(trigger);

    const redSwatch = await screen.findByRole('button', { name: 'red' });
    fireEvent.click(redSwatch);

    expect(store.getState().fields['brandColor']?.current).toBe('red');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('presets (distinctive behavior, decision ③) narrows the swatch grid to the declared subset', async () => {
    renderForm(collegeForm(['teal', 'pink']));
    const trigger = await screen.findByLabelText(/^Brand Color/);

    fireEvent.click(trigger);
    await screen.findByRole('dialog');

    expect(screen.getByRole('button', { name: 'teal' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'pink' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'indigo' })).toBeNull();
    expect(screen.getAllByRole('button', { name: /^(teal|pink)$/ })).toHaveLength(2);
  });

  it('forwards required/invalid/describedBy for a11y, same wiring contract as every other renderer', async () => {
    const requiredField = new ColorPresetField('brandColor', 100)
      .withLabel('Brand Color')
      .withRequired(true);
    const entityForm = new EntityForm('CollegeEntityForm', '/college').addFields({
      items: [requiredField],
    });
    renderForm(entityForm);
    const trigger = await screen.findByLabelText(/^Brand Color/);
    const saveButton = screen.getByRole('button', { name: /save/i });

    await waitFor(() => expect(trigger).toHaveAttribute('aria-required', 'true'));

    fireEvent.click(saveButton);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-invalid', 'true'));
    const describedBy = trigger.getAttribute('aria-describedby');
    expect(describedBy).toBe('brandColor-error');
    expect(document.getElementById(describedBy as string)).toHaveTextContent(/필수 값입니다/);
  });

  it('disables the trigger when readOnly', async () => {
    const field = new ColorPresetField('brandColor', 100)
      .withLabel('Brand Color')
      .withReadOnly(true);
    const entityForm = new EntityForm('CollegeEntityForm', '/college').addFields({
      items: [field],
    });
    renderForm(entityForm);
    const trigger = await screen.findByLabelText(/^Brand Color/);
    await waitFor(() => expect(trigger).toBeDisabled());
  });
});
