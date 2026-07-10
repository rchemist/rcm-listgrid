// ProfileField renderer integration test (EA-A fan-out — Profile). Same
// harness shape as field-a11y.test.tsx: real EntityForm + createFormStore +
// the full provider stack, rendered with @listgrid/ui-default's unstyled
// primitives. The Profile renderer is registered directly here via
// registerFieldRenderer('profile', ...) — default-renderers.tsx is untouched
// (briefing PART 1 fan-out rule).
//
// ProfileField's distinctive pitfall (briefing PART 2 §Profile, conductor
// decision ②): the value shape is HOST-OWNED. 0.3.x's own UserView was
// already a headless stub, so the new engine's posture is a "최소
// placeholder" — ui-default's UserView shows the raw value as text, and a
// real host is expected to override the `UIComponents.UserView` slot with an
// actual user-lookup/avatar view. That override seam is what these tests
// pin down, alongside the always-readonly/always-hideLabel constructor
// behavior (profile-field.test.ts covers the schema-core half).

import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { EntityForm, ProfileField } from '@listgrid/schema-core';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import type { UserViewProps } from '@listgrid/ui-default';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { FormStoreProvider } from '../providers/form-store';
import { registerFieldRenderer } from '../registry/field-renderer-registry';
import { ProfileFieldRenderer } from '../registry/profile-renderer';
import { ViewEntityForm } from '../components/ViewEntityForm';

registerFieldRenderer('profile', ProfileFieldRenderer);

function collegeForm(): EntityForm {
  return new EntityForm('CollegeEntityForm', '/college').addFields({
    items: [new ProfileField('owner', 100).withLabel('Owner').withDefaultValue('jane.doe')],
  });
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

describe('ProfileFieldRenderer', () => {
  it('renders the stored value through the ui-default UserView fallback (plain text)', async () => {
    renderForm(collegeForm());
    const view = await waitFor(() => {
      const el = document.getElementById('owner');
      expect(el).not.toBeNull();
      return el as HTMLElement;
    });
    expect(view).toHaveTextContent('jane.doe');
  });

  it('hideLabel (forced true by the 0.3.x-faithful constructor) means no external <label> renders for this field', async () => {
    renderForm(collegeForm());
    await waitFor(() => expect(document.getElementById('owner')).not.toBeNull());
    // FieldRenderer skips the <label htmlFor> wrapper entirely when
    // field.hideLabel is true (components/FieldRenderer.tsx). Note this is
    // NOT reachable via queryByLabelText — the renderer's own aria-label
    // (forwarded to UserView below) gives the element an accessible name
    // without an associated <label> DOM element, so we assert the DOM
    // shape directly instead.
    const container = document.querySelector('[data-field-name="owner"]');
    expect(container?.querySelector('label')).toBeNull();
  });

  it('is display-only: no input/button is rendered to edit the value (0.3.x never offered an editable UserView either)', async () => {
    renderForm(collegeForm());
    await waitFor(() => expect(document.getElementById('owner')).not.toBeNull());
    const container = document.querySelector('[data-field-name="owner"]') as HTMLElement;
    expect(container.querySelector('input')).toBeNull();
    expect(container.querySelector('button')).toBeNull();
  });

  it('a host can override the UserView slot — the placeholder posture premises host override (conductor decision ②)', async () => {
    function CustomUserView({ id, value, ariaLabel, describedBy }: UserViewProps): ReactNode {
      return (
        <div id={id} aria-label={ariaLabel} aria-describedby={describedBy} data-custom-user-view>
          {`custom:${String(value)}`}
        </div>
      );
    }
    const store = createFormStore(collegeForm());
    render(
      <UIProvider components={{ ...defaultUIComponents, UserView: CustomUserView }}>
        <AuthProvider session={undefined}>
          <FormStoreProvider store={store}>
            <ViewEntityForm entityForm={collegeForm()} store={store} onSave={vi.fn()} />
          </FormStoreProvider>
        </AuthProvider>
      </UIProvider>,
    );
    const custom = await waitFor(() => {
      const el = document.querySelector('[data-custom-user-view]');
      expect(el).not.toBeNull();
      return el as HTMLElement;
    });
    expect(custom).toHaveAttribute('id', 'owner');
    expect(custom).toHaveAttribute('aria-label', 'Owner');
    expect(custom).toHaveTextContent('custom:jane.doe');
  });

  it('saving does not fail validation even with no value (ProfileField is always readonly by default, base FormField skips validation)', async () => {
    const { store, onSave } = renderForm(
      new EntityForm('CollegeEntityForm', '/college').addFields({
        items: [new ProfileField('owner', 100).withLabel('Owner')],
      }),
    );
    await waitFor(() => expect(document.getElementById('owner')).not.toBeNull());
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(store.getState().fields['owner']?.errors ?? []).toEqual([]);
  });
});
