// EF5 — validate-on-change (opt-in), react integration (optional per the EF5
// briefing — "nice-to-have"). No react-layer change was needed: the error
// slice appearing via the existing validateField write path is already
// reactively subscribed (useFormField, D4), so a typed invalid value renders
// an error with no save/submit involved. Same harness style as
// field-meta-reactive.test.tsx.

import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { EntityForm, StringField } from '@listgrid/schema-core';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { FormStoreProvider } from '../providers/form-store';
import { registerDefaultRenderers } from '../registry/default-renderers';
import { ViewEntityForm } from '../components/ViewEntityForm';

registerDefaultRenderers();

function widgetForm(): EntityForm {
  return new EntityForm('WidgetEntityForm', '/widget').addFields({
    items: [new StringField('name', 1).withRequired(true).withLabel('Name')],
  });
}

describe('EF5 — validate-on-change react integration (optional)', () => {
  it('typing an invalid value shows an error after the debounce window, without saving', async () => {
    const entityForm = widgetForm();
    const store = createFormStore(entityForm, { validateOnChange: { debounceMs: 300 } });
    render(
      <UIProvider components={defaultUIComponents}>
        <AuthProvider session={undefined}>
          <FormStoreProvider store={store}>
            <ViewEntityForm entityForm={entityForm} store={store} onSave={() => {}} />
          </FormStoreProvider>
        </AuthProvider>
      </UIProvider>,
    );
    const nameInput = await screen.findByLabelText(/^Name/);

    vi.useFakeTimers();
    // type then clear — a controlled input's onChange does not fire when the
    // target value already equals its current (empty) value.
    fireEvent.change(nameInput, { target: { value: 'x' } });
    fireEvent.change(nameInput, { target: { value: '' } }); // required field, now blank
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    vi.useRealTimers();

    const errorList = document.getElementById('name-error');
    expect(errorList).not.toBeNull();
    expect(errorList).toHaveAttribute('role', 'alert');
    expect(errorList).toHaveTextContent(/필수 값입니다/);
  });
});
